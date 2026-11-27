import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "@otamasing/broadcast-shared/fonts.css";
// the race number box ("12R") is set in Alumni Sans (Nopphorn's pick)
// Figma's board fonts: Alumni Sans (Latin text), Noto Serif JP (Japanese race name), IBM Plex Mono (BK / PP); Thai falls back to Otamasing Display
import "@fontsource-variable/alumni-sans";
import "@fontsource-variable/noto-serif-jp";
import "@fontsource/ibm-plex-mono/700.css";
import "./styles/app.css";

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
