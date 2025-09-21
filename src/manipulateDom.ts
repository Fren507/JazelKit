// src/manipulateDom.ts

import express from "express";
export function manipulateSiteDom(
  dom: Document,
  req: express.Request,
  otherScripts: string[] = []
) {
  // Füge hier deine DOM-Manipulationen hinzu
  // Beispiel: Füge ein Meta-Tag hinzu
  const metaWidth = dom.createElement("meta");
  metaWidth.name = "viewport";
  metaWidth.content = "width=device-width, initial-scale=1";
  dom.head.appendChild(metaWidth);

  const metaCharset = dom.createElement("meta");
  metaCharset.setAttribute("charset", "UTF-8");
  dom.head.appendChild(metaCharset);

  const globalVarsScript = dom.createElement("script");
  globalVarsScript.textContent = `
    const pathname = "${req.path || "/"}";
    const search = "${req.url.split("?")[1] || ""}";
    const host = "${req.get("host") || ""}";
    const origin = "${req.protocol}://${req.get("host") || ""}";
    var pageData = {
      pathname,
      search,
      host,
      origin
    };
  `;
  dom.body.appendChild(globalVarsScript);

  const mainScript = dom.createElement("script");
  mainScript.src = "/src/scripts/main.js";
  mainScript.async = true;
  dom.body.appendChild(mainScript);

  for (const src of otherScripts) {
    const script = dom.createElement("script");
    script.type = "module";
    script.src = src.replaceAll("ts", "js");
    dom.body.appendChild(script);
  }
}
