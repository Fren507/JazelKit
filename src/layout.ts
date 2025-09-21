// src/layout.ts

import { fileExists } from "./main.js";
import path from "path";
import { readFile } from "fs/promises";
import { JazelKitConfig } from "./JazelKitConfig.js";

export async function layout(
  COMPONENTS_DIR: string,
  layout: Document,
  content: Document,
  config: JazelKitConfig
) {
  if (!content) {
    layout.querySelector("slot")?.replaceWith("");
    return;
  }

  // Find the template in the content
  const template = content.querySelector("template");

  // If there's a title in the template, remove any existing title in layout
  const existingTitle = layout.head.querySelectorAll("title");
  if (existingTitle) existingTitle.forEach((t) => t.remove());

  // Merge head content only if a template exists
  if (template) {
    layout.head.append(...Array.from(template.content.childNodes));
    template.remove(); // Remove template from content
  } else {
    // This case is for nested layouts. Merge the entire head from the content.
    const contentHead = content.querySelector("head");
    if (contentHead) {
      layout.head.append(...Array.from(contentHead.childNodes));
    }
  }

  // If no title was added from the template, add a default title from config
  if (!layout.head.querySelector("title")) {
    const title = config.title || "JazelKit App";
    const titleElement = layout.createElement("title");
    titleElement.textContent = title;
    layout.head.appendChild(titleElement);
  }

  // Replace <slot> with body content (deep import, only ELEMENT_NODEs and TEXT_NODEs)
  const slot = layout.querySelector("slot");
  if (slot) {
    // Only import safe node types (ELEMENT_NODE=1, TEXT_NODE=3, COMMENT_NODE=8)
    const nodes = Array.from(content.body.childNodes).filter(
      (n) => n.nodeType === 1 || n.nodeType === 3 || n.nodeType === 8
    );
    slot.replaceWith(...nodes.map((n) => layout.importNode(n, true)));
  }

  // Replace <component name="..."> with component HTML
  const components = layout.querySelectorAll("component");
  for (const component of Array.from(components)) {
    const name = component.getAttribute("name");
    if (!name) {
      component.replaceWith("");
      continue;
    }
    const componentFilePath = path.join(COMPONENTS_DIR, name + ".html");
    if (await fileExists(componentFilePath)) {
      const componentFile = await readFile(componentFilePath, "utf8");
      // Insert as HTML (parse into nodes for safety)
      const tmpDoc = layout.implementation.createHTMLDocument("");
      tmpDoc.body.innerHTML = componentFile;
      const frag = layout.createDocumentFragment();
      for (const node of Array.from(tmpDoc.body.childNodes)) {
        if (node.nodeType === 1 || node.nodeType === 3 || node.nodeType === 8) {
          frag.appendChild(layout.importNode(node, true));
        }
      }
      component.replaceWith(frag);
    } else {
      component.replaceWith("");
    }
  }
}
