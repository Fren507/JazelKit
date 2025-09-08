// main/src/scripts/main.ts
var bodyContent = document.body.innerHTML;
document.body.innerHTML = `<nav></nav><main>${bodyContent}</main><footer></footer>`;
async function inject(selector, file) {
  const el = document.querySelector(selector);
  if (!el) return;
  const res = await fetch(`/components/${file}`);
  if (!res.ok) return;
  const html = await res.text();
  el.outerHTML = html;
}
function ensureStyle(href) {
  let link = document.querySelector(
    `link[href='${href}']`
  );
  if (!link) {
    link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
}
(async () => {
  ensureStyle("/css/style.css");
  await Promise.all([inject("nav", "nav.html")]);
  const current = location.pathname;
  document.querySelectorAll("nav a").forEach((a) => {
    if (a.getAttribute("href") === current) a.classList.add("active");
  });
})();
//# sourceMappingURL=main.js.map
