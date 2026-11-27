import { expect, test, type BrowserContext, type Page } from "@playwright/test";

/** Dock and overlay open side by side in one browser profile, like OBS. */
async function open(context: BrowserContext): Promise<{ dock: Page; overlay: Page }> {
  const overlay = await context.newPage();
  await overlay.setViewportSize({ width: 1920, height: 1080 });
  await overlay.goto("#/overlay");
  const dock = await context.newPage();
  await dock.setViewportSize({ width: 420, height: 900 });
  await dock.goto("#/dock");
  return { dock, overlay };
}
const board = (p: Page) => p.getByTestId("scroller").first();

test("first open seeds the sample board with its pundits", async ({ context }) => {
  const { dock, overlay } = await open(context);
  await expect(dock.getByRole("tab")).toHaveText(["ภาพรวม", "การแข่งขัน", "ผู้ทายผล", "ม้า"]);
  await expect(overlay.getByTestId("race-name")).toHaveText("JAPAN CUP");
  await expect(overlay.getByTestId("row")).toHaveCount(4);
  await expect(overlay.getByTestId("board").getByTestId("pundit-head")).toHaveCount(2);
  await expect(overlay.locator("[data-no='3'] [data-testid=pick]").first()).toHaveAttribute("data-mark", "◎");
  await expect(overlay.locator("[data-no='1'] [data-silks]")).toHaveAttribute("data-silks", "Carrot");
});

test("pundits: add up to 4, remove down to 1, picks reach the overlay", async ({ context }) => {
  const { dock, overlay } = await open(context);
  await dock.getByRole("tab", { name: "ผู้ทายผล" }).click();
  const add = dock.getByRole("button", { name: "+ เพิ่มผู้ทายผล" });
  await add.click();
  await add.click();
  await expect(add).toBeDisabled();
  await expect(overlay.getByTestId("board").getByTestId("pundit-head")).toHaveCount(4);
  await dock.getByLabel("ชื่อผู้ทายผลคนที่ 4").fill("กุ้ง");
  await expect(overlay.getByTestId("board").getByTestId("pundit-head").nth(3)).toHaveText("กุ้ง");
  await dock.getByLabel("กุ้ง เบอร์ 2").selectOption("☆");
  await expect(overlay.locator("[data-no='2'] [data-testid=pick]").nth(3)).toHaveAttribute("data-mark", "☆");
  for (let i = 4; i > 1; i--) await dock.getByRole("button", { name: `ลบผู้ทายผลคนที่ ${i}` }).click();
  await expect(dock.getByRole("button", { name: "ลบผู้ทายผลคนที่ 1" })).toBeDisabled();
  await expect(overlay.getByTestId("board").getByTestId("pundit-head")).toHaveCount(1);
});

test("the dock scrolls the overlay freely and the table header stays on top", async ({ context }) => {
  const { dock, overlay } = await open(context);
  // a long field so there is something to scroll
  await dock.getByRole("tab", { name: "ม้า" }).click();
  for (let i = 0; i < 10; i++) await dock.getByRole("button", { name: "+ เพิ่มม้า" }).click();
  await expect(overlay.getByTestId("row")).toHaveCount(14);
  await dock.getByRole("tab", { name: "ภาพรวม" }).click();
  const top = () => board(overlay).evaluate((e) => e.scrollTop);
  // any position, not snapped to a row: 437 board px = 437 * 1920 / 1418 screen px
  await dock.getByLabel("ตำแหน่งตาราง").fill("437");
  await expect.poll(top).toBeCloseTo((437 * 1920) / 1418, 0);
  // the header floats a gap below the top, on a white band that hides the board above it
  const head = await overlay.getByTestId("floating-head").getByTestId("table-head").boundingBox();
  expect(head!.y).toBeCloseTo((38 * 1920) / 1418, 0);
  await expect(overlay.getByTestId("floating-head")).toBeVisible();
  expect(await overlay.getByTestId("floating-head").evaluate((e) => getComputedStyle(e).backgroundColor)).toBe("rgb(255, 255, 255)");
  // the mouse wheel over the dock preview scrolls too
  const preview = dock.getByTestId("scroll-preview");
  await preview.hover();
  await dock.mouse.wheel(0, 50);
  await expect.poll(async () => (await dock.getByLabel("ตำแหน่งตาราง").inputValue()) !== "437").toBe(true);
  await dock.getByRole("button", { name: "บนสุด" }).click();
  await expect.poll(top).toBe(0);
  await expect(overlay.getByTestId("floating-head")).toBeHidden();
});

test("number styles follow the dock like compact and intro", async ({ context }) => {
  const { dock, overlay } = await open(context);
  await dock.getByRole("tab", { name: "การแข่งขัน" }).click();
  const pp = overlay.locator("[data-no='3'] > div").nth(1);
  await expect(pp).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await dock.getByLabel("สีช่อง PP").selectOption("jra");
  await expect(pp).toHaveCSS("background-color", "rgb(232, 57, 42)");
  await dock.getByRole("switch", { name: "แสดงช่อง BK (ซอง)" }).click();
  await expect(overlay.getByTestId("table-head").getByText("BK", { exact: true })).toHaveCount(0);
});

test("export JSON, then import a one-race file after confirming", async ({ context }) => {
  const { dock, overlay } = await open(context);
  await dock.getByRole("button", { name: "ส่งออก JSON" }).click();
  const text = await dock.getByTestId("export-text").inputValue();
  const file = JSON.parse(text);
  expect(file.race.name).toBe("Japan Cup");
  file.race.name = "Arima Kinen";
  file.runners = file.runners.slice(0, 2);
  await dock.getByTestId("import-file").setInputFiles({ name: "arima.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(file)) });
  await dock.getByRole("button", { name: "แทนที่" }).click();
  await expect(overlay.getByTestId("race-name")).toHaveText("ARIMA KINEN");
  await expect(overlay.getByTestId("row")).toHaveCount(2);
  await dock.getByRole("button", { name: "วาง JSON" }).click();
  await dock.getByLabel("วาง JSON").fill('{"race":{"date":"2026"}}');
  await dock.getByRole("button", { name: "ตรวจและนำเข้า" }).click();
  await expect(dock.getByRole("alert")).toContainText("race.date");
});

test("the top-left picture and the JPG / PDF export", async ({ context }) => {
  const { dock, overlay } = await open(context);
  await dock.getByRole("tab", { name: "การแข่งขัน" }).click();
  const png = await dock.evaluate(() => { const c = document.createElement("canvas"); c.width = 40; c.height = 30; c.getContext("2d")!.fillRect(0, 0, 40, 30); return c.toDataURL("image/png"); });
  await dock.getByTestId("photo-file").setInputFiles({ name: "p.png", mimeType: "image/png", buffer: Buffer.from(png.split(",")[1], "base64") });
  await expect(overlay.getByTestId("photo")).toHaveAttribute("src", /^data:image\/jpeg/);
  await dock.getByRole("slider", { name: "ซูม" }).fill("2");
  await dock.getByRole("slider", { name: "หมุน" }).fill("15");
  await dock.getByRole("slider", { name: "แนวนอน" }).fill("40");
  await expect(overlay.getByTestId("photo")).toHaveAttribute("style", /translate\(40px, 0px\) rotate\(15deg\) scale\(2\)/);
  const f = (await dock.getByTestId("photo-frame").boundingBox())!;
  await dock.mouse.move(f.x + 50, f.y + 30); await dock.mouse.down(); await dock.mouse.move(f.x + 50, f.y + 60); await dock.mouse.up();
  await expect(dock.getByRole("slider", { name: "แนวตั้ง" })).not.toHaveValue("0");
  await dock.getByRole("button", { name: "รีเซ็ตตำแหน่งรูป" }).click();
  await expect(overlay.getByTestId("photo")).toHaveAttribute("style", /rotate\(0deg\) scale\(1\)/);
  await dock.getByRole("tab", { name: "ภาพรวม" }).click();
  // no save dialog in the test browser: the file downloads
  await dock.evaluate(() => { (window as unknown as { showSaveFilePicker?: unknown }).showSaveFilePicker = undefined; });
  for (const [btn, ext] of [["บันทึก JPG", "jpg"], ["บันทึก PDF", "pdf"]]) {
    const dl = dock.waitForEvent("download");
    await dock.getByRole("button", { name: btn }).click();
    const d = await dl;
    expect(d.suggestedFilename()).toBe(`2026-11-29-12r-japan-cup.${ext}`);
  }
});

test("past races are edited one tab at a time as a labelled form", async ({ context }) => {
  const { dock, overlay } = await open(context);
  await dock.getByRole("tab", { name: "ม้า" }).click();
  const ed = dock.getByTestId("runner-editor").first();
  await ed.locator("summary").click();
  await ed.getByRole("tab", { name: "ครั้งก่อน", exact: true }).click();
  await ed.getByLabel("ชื่อรายการ").fill("Tenno Sho (Spring) X");
  await expect(overlay.locator("[data-no='1']").getByTestId("past").nth(1)).toContainText("TENNO SHO (SPRING) X");
  // removing the last race leaves an empty tab with an add button
  await ed.getByRole("tab", { name: "2 ครั้งก่อน", exact: true }).click();
  await ed.getByRole("button", { name: /^ลบเบอร์ 1/ }).click();
  await expect(ed.getByRole("tab", { name: "2 ครั้งก่อน +" })).toBeVisible();
  await ed.getByRole("tab", { name: "2 ครั้งก่อน +" }).click();
  await ed.getByRole("button", { name: "+ เพิ่มผลงาน 2 ครั้งก่อน" }).click();
  await expect(ed.getByLabel("วันที่")).toBeVisible();
});
