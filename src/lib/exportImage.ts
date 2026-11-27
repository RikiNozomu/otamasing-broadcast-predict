/** Turns the drawn board into a JPG or a one-page PDF (page = the board's size). */

/** JPEG data URL of `node` at `ratio` times its size (white behind anything transparent). */
export async function boardJpeg(node: HTMLElement, ratio = 2): Promise<string> {
  const { toJpeg } = await import("html-to-image");
  await document.fonts?.ready;
  await Promise.all([...node.querySelectorAll("img")].map((i) => (i.complete ? null : i.decode().catch(() => {}))));
  return toJpeg(node, { quality: 0.92, pixelRatio: ratio, backgroundColor: "#ffffff", cacheBust: false });
}

export const dataUrlBlob = async (url: string) => (await fetch(url)).blob();

/** A PDF of one page as big as the board (in px), holding the JPEG. */
export async function jpegPdf(jpeg: string, w: number, h: number): Promise<Blob> {
  // loaded on use: jsPDF is big and only the export needs it
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: w > h ? "landscape" : "portrait", unit: "px", format: [w, h], hotfixes: ["px_scaling"], compress: true });
  pdf.addImage(jpeg, "JPEG", 0, 0, w, h);
  return pdf.output("blob");
}

/** A picture file shrunk to at most `max` px wide/high, as a JPEG data URL (small enough for localStorage and the JSON). */
export async function shrinkPicture(file: Blob, max = 1600, quality = 0.85): Promise<string> {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close();
  return c.toDataURL("image/jpeg", quality);
}
