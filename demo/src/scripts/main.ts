//* The comments are in german in the demo folder, if you want to see the version in english, check the main folder!

// Body in <main> kapseln
const bodyContent = document.body.innerHTML;
document.body.innerHTML = `<nav></nav><main>${bodyContent}</main><footer></footer>`;

// Helper: Komponenten injizieren
async function inject(selector: string, file: string) {
  const el = document.querySelector(selector);
  if (!el) return;
  const res = await fetch(`/components/${file}`);
  if (!res.ok) return;
  const html = await res.text();
  el.outerHTML = html; // ersetzt Platzhalter
}

// Styles sicherstellen
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

// Ablauf sequenziell
(async () => {
  ensureStyle("/css/style.css");

  await Promise.all([inject("nav", "nav.html")]);

  // Active-Link markieren NACHDEM nav injiziert ist
  const current = location.pathname;
  document.querySelectorAll("nav a").forEach((a) => {
    if (a.getAttribute("href") === current) a.classList.add("active");
  });
})();
