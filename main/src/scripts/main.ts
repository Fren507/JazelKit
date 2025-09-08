// Wrap body content in <main>
const bodyContent = document.body.innerHTML;
document.body.innerHTML = `<nav></nav><main>${bodyContent}</main><footer></footer>`;

// Helper: Inject components
async function inject(selector: string, file: string) {
  const el = document.querySelector(selector);
  if (!el) return;
  const res = await fetch(`/components/${file}`);
  if (!res.ok) return;
  const html = await res.text();
  el.outerHTML = html; // ersetzt Platzhalter
}

// Ensure styles are loaded
function ensureStyle(href: string) {
  let link = document.querySelector(
    `link[href='${href}']`
  ) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
}

// Sequential execution
(async () => {
  ensureStyle("/css/style.css");

  // Add to components to this list to be injected on every page!
  await Promise.all([inject("nav", "nav.html")]);

  // Highlight active link AFTER nav is injected
  const current = location.pathname;
  document.querySelectorAll("nav a").forEach((a) => {
    if (a.getAttribute("href") === current) a.classList.add("active");
  });
})();
