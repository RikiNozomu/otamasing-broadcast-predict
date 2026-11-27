/** The board seeded on first open: a short Japan Cup field (from the Figma design) with two pundits. */
import { BoardSchema, type AppData, type BoardInput } from "./model";

const p = (date: string, round: string, grade: "G1" | "G2" | "G3" | null, name: string, course: string, distanceM: number, finish: number, field: number, rating: number, time: string, jockey: string, jockeyCountry: string, weight: number, other: string) =>
  ({ date, round, grade, name, course, surface: "Turf" as const, distanceM, finish, field, rating, time, jockey, jockeyCountry, weight, other });

export const SAMPLE: BoardInput = {
  version: 1,
  race: { date: "2026-11-29", course: "Tokyo", round: "12R", postTime: "15:40", timeZone: "JST", name: "Japan Cup", jpName: "第46回 ジャパンカップ", grade: "G1", surface: "Turf", distanceM: 2400 },
  style: { drawScheme: "jra", numberScheme: "plain", autoDraw: true },
  pundits: [
    { name: "แอนตี้แฟน คาวาดะ", picks: { "3": "◎", "4": "○", "1": "▲" } },
    { name: "ริกิโนโซมุ", picks: { "4": "◎", "2": "○", "3": "△" } },
  ],
  runners: [
    { number: 1, name: "Redentor", country: "JP", profile: "5yo DB H", rating: "E114", sire: "Rulership", dam: "Corcovado", bms: "Stay Gold", center: "MIHO", trainer: "Kimura Tetsuya", runStyle: 3, jockey: "Tom Marquand", jockeyCountry: "GB", weight: 58, silks: "Carrot",
      form: [p("2026-10-04", "11R", "G2", "Kyoto Daishoten", "Kyoto", 2400, 5, 18, 113, "2:24.3", "H.Yoshida", "JP", 58, "Ecoro Dinos"),
        p("2026-05-03", "11R", "G1", "Tenno Sho (Spring)", "Kyoto", 3200, 5, 15, 114, "3:14.1", "C.Lemaire", "FR", 58, "Croix du Nord"),
        p("2026-02-15", "11R", "G2", "Kyoto Kinen", "Kyoto", 2200, 8, 12, 109, "2:13.6", "C.Lemaire", "FR", 59, "June Take")] },
    { number: 2, name: "Cosmo Kuranda", country: "JP", profile: "5yo DB H", rating: "L118", sire: "Al Ain", dam: "Southern Speed", bms: "Southern Image", center: "MIHO", trainer: "Kato Shizuya", blinkers: true, runStyle: 2, jockey: "Tannai Yuji", jockeyCountry: "JP", weight: 58, silks: "Big Red",
      form: [p("2026-11-01", "11R", "G1", "Tenno Sho (Autumn)", "Tokyo", 2000, 9, 17, 112, "1:57.7", "Y.Tannai", "JP", 58, "Danon Decile"),
        p("2026-09-20", "11R", "G2", "All Comers", "Nakayama", 2200, 11, 13, 65, "2:21.9", "T.Yokoyama", "JP", 57, "Meisho Gekirin"),
        p("2026-06-14", "11R", "G1", "Takarazuka Kinen", "Hanshin", 2200, 4, 18, 118, "2:12.6", "T.Yokoyama", "JP", 58, "Meisho Tabaru")] },
    { number: 3, name: "Meisho Tabaru", country: "JP", profile: "5yo B H", rating: "L123", sire: "Gold Ship", dam: "Meisho Tsubakuro", bms: "French Deputy", center: "RITTO", trainer: "Ishibashi Mamoru", runStyle: 1, jockey: "Take Yutaka", jockeyCountry: "JP", weight: 56, silks: "Meisho",
      form: [p("2026-10-04", "5R", "G1", "L'Arc de Triomphe", "Longchamp", 2400, 14, 16, 115, "2:28.1", "Y.Take", "JP", 59.5, "Daryz"),
        p("2026-06-14", "11R", "G1", "Takarazuka Kinen", "Hanshin", 2200, 1, 18, 123, "2:12.1", "Y.Take", "JP", 58, "Croix du Nord"),
        p("2026-04-05", "11R", "G1", "Osaka Hai", "Hanshin", 2000, 2, 15, 120, "1:57.7", "Y.Take", "JP", 58, "Croix du Nord")] },
    { number: 4, name: "Croix du Nord", country: "JP", profile: "4yo Br H", rating: "L122", sire: "Kitasan Black", dam: "Rising Cross", bms: "Cape Cross", center: "RITTO", trainer: "Saito Takashi", runStyle: 2, jockey: "Cristian Demuro", jockeyCountry: "IT", weight: 58, silks: "Sunday",
      form: [p("2026-11-01", "11R", "G1", "Tenno Sho (Autumn)", "Tokyo", 2000, 5, 17, 116, "1:57.4", "C.Demuro", "IT", 58, "Danon Decile"),
        p("2026-06-14", "11R", "G1", "Takarazuka Kinen", "Hanshin", 2200, 2, 18, 122, "2:12.2", "Y.Kitamura", "JP", 58, "Meisho Tabaru"),
        p("2026-05-03", "11R", "G1", "Tenno Sho (Spring)", "Kyoto", 3200, 1, 15, 117, "3:13.7", "Y.Kitamura", "JP", 58, "Wurttemberg")] },
  ],
};

export const sampleData = (): AppData => ({ ...BoardSchema.parse(SAMPLE), scroll: 0, fit: false });
