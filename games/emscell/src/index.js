import React from "react";
import { createRoot } from "react-dom/client";
import Emscell from "./emscell";

if (typeof document !== "undefined") {
  const container = document.querySelector("#container");
  const root = createRoot(container);
  root.render(<Emscell />);
}
