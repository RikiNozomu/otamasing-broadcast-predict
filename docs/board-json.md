# Board JSON (one race per file)

The dock's "ส่งออก JSON" writes this file and "นำเข้าไฟล์…" / "วาง JSON" read it back. Importing **replaces** the
whole board. Only `race.date`, `race.name` and the runners' `number` are required; everything else has a default.

```jsonc
{
  "version": 1,
  "race": {
    "date": "2026-11-29", "course": "Tokyo", "round": "12R", "postTime": "15:40", "timeZone": "JST",
    "name": "Japan Cup", "jpName": "第46回 ジャパンカップ",
    "grade": "G1",            // G1 | G2 | G3 | L | null  (shown GI GII GIII LR)
    "surface": "Turf",        // Turf | Dirt | Jump
    "distanceM": 2400
  },
  "style": {
    "drawScheme": "jra",      // BK box: jra | us | hk | gb | fr | plain | custom (same as compact / intro)
    "numberScheme": "plain",  // PP box: plain (black on white) | jra | us | gb | fr | custom
    "autoDraw": true,         // BK = JRA bracket worked out from the number and field size
    "customColors": {},       // { "1": ["#bg", "#fg"] } for "custom"
    "showDraw": true          // show the BK column
  },
  "pundits": [                // 1 to 4, one column each, in this order
    { "name": "แอนตี้แฟน คาวาดะ", "picks": { "3": "◎", "4": "○", "1": "▲" } }   // marks: ◎ ○ ▲ △ ☆ ×, missing = "--"
  ],
  "runners": [
    {
      "number": 1, "draw": null,            // draw only matters when autoDraw is false
      "name": "Redentor", "country": "JP",  // flag before the name (ISO code)
      "profile": "5yo DB H", "rating": "E114",
      "sire": "Rulership", "dam": "Corcovado", "bms": "Stay Gold",
      "center": "MIHO",                     // MIHO | RITTO | ISO code: badge before the trainer
      "trainer": "Kimura Tetsuya",
      "blinkers": false,
      "runStyle": 3,                        // 1 front, 2 stalker, 3 closer, 4 deep closer, null = none
      "jockey": "Tom Marquand", "jockeyCountry": "GB", "weight": 58,
      "silks": "Carrot",                    // name from otamasing-broadcast-shared lib/silks, "" = none
      "scratched": false,
      "form": [                             // up to 3, newest first (RECENT PERFORMANCES)
        { "date": "2026-10-04", "round": "11R", "grade": "G2", "name": "Kyoto Daishoten",
          "course": "Kyoto", "surface": "Turf", "distanceM": 2400,
          "finish": 5, "field": 18, "rating": 113, "time": "2:24.3",
          "jockey": "H.Yoshida", "jockeyCountry": "JP", "weight": 58,
          "other": "Ecoro Dinos" }          // the winner, or the runner-up when this horse won (shown in brackets)
      ]
    }
  ],
  "photo": "data:image/jpeg;base64,…",    // top-left picture, or null
  "photoPos": { "x": 0, "y": 0, "zoom": 1, "rotate": 0 }  // optional: offset px, zoom (1 = fill), degrees
}
```

Colours: a past race cell is gold for 1st, blue for 2nd, peach for 3rd. Rating boxes are gold from 120, blue from 110,
bronze from 100, grey below.
