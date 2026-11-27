import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "@otamasing/broadcast-shared/fonts.css";
// the race number box ("12R") is set in Alumni Sans (Nopphorn's pick)
import "@fontsource/alumni-sans/latin-700.css";
import "./styles/app.css";

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
