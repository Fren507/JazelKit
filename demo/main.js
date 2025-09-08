import express from "express";
import path from "path";
import livereload from "livereload";
import connectLivereload from "connect-livereload";
import { fileURLToPath } from "url";
import { readFile, access } from "fs/promises";
import { createServer } from "http";
import { Server } from "socket.io";
import { buildAll } from "./build.js";
import { log } from "console";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5173;

const httpServer = createServer(app); // Express-Server in HTTP-Server packen
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:5173" }, // falls Frontend lokal läuft
});

const liveServer = livereload.createServer({
  exts: ["html", "css", "js", "ts"],
  port: 35729,
  headers: {
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/javascript; charset=utf-8",
  },
});

liveServer.watch(path.join(__dirname, "src"));

// Root für die HTML-Dateien
const ROUTES_DIR = path.join(__dirname, "./src/routes");
const ASSETS_DIR = path.join(__dirname, "./public/assets");
const CSS_DIR = path.join(__dirname, "./src/others/css");
const SOURCE_DIR = path.join(__dirname, "./public/src/scripts");
const COMPONENTS_DIR = path.join(__dirname, "./src/components");

function changeSiteContent(html, otherScripts = ["/src/main.js"]) {
  let site = html.replace(
    "</body>",
    `<script src="/src/main.js" async></script>
    ${otherScripts
      .map((src) => `<script type="module" src="${src}"></script>`)
      .join("\n")}
    </body>`
  );
  site = site.replaceAll('.ts"', '.js"').replaceAll(".ts'", ".js'");
  site = site.replaceAll("<script src=", '<script type="module" src=');
  return site;
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

// app.get("/", (req, res) => {
//   res.sendFile(path.join(ROUTES_DIR, "index.html"));
// });
app.use("/src", express.static(SOURCE_DIR));
app.use("/assets", express.static(ASSETS_DIR));
app.use("/css", express.static(CSS_DIR));
app.use("/components", express.static(COMPONENTS_DIR));

app.use(connectLivereload({ port: 35729 }));

app.use((req, res, next) => {
  console.time(`[${req.method}] ${req.path}`);
  res.on("finish", () => console.timeEnd(`[${req.method}] ${req.path}`));
  next();
});

app.use(async (req, res) => {
  const routeHtmlPath = path.join(ROUTES_DIR, req.path, "+index.html");
  const pageServerPath = path.join(ROUTES_DIR, req.path, "+page.ts");

  if (await fileExists(routeHtmlPath)) {
    const pageScripts = (await fileExists(pageServerPath))
      ? [`/src/routes${req.path}/+page.js`]
      : [];
    log("Page Scripts:", pageScripts);

    const html = await readFile(routeHtmlPath, "utf8");
    const site = changeSiteContent(html, pageScripts);
    return res.status(200).send(site);
  }

  const html404 = await readFile(path.join(ROUTES_DIR, "+404.html"), "utf8");
  const notFound = changeSiteContent(html404);
  return res.status(404).send(notFound);
});

httpServer.listen(port, async () => {
  console.log(`Server läuft auf http://localhost:${port}`);
  await buildAll();
  console.log("Seiten gebaut.");
});

io.on("connection", (socket) => {
  console.log("Neuer Socket verbunden:", socket.id);

  // Beispiel: Nachricht vom Client empfangen
  socket.on("clientMessage", (data) => {
    console.log("Client sagt:", data);

    // Broadcast an alle Clients
    io.emit("serverMessage", `Server hat es erhalten: ${data}`);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("Socket getrennt:", socket.id);
  });
});
