// src/main.ts

import path from "path";
import livereload from "livereload";
import connectLivereload from "connect-livereload";
import chalk from "chalk";
import express, { NextFunction, Request, Response } from "express";
import { createServer } from "http";
import { Namespace, Server } from "socket.io";
import { JSDOM } from "jsdom";
import { buildAll } from "./build.js";
import { layout } from "./layout.js";
import { manipulateSiteDom } from "./manipulateDom.js";
import { pathExists, collectFiles, getChildDirs } from "./helpers.js";
import { type JazelKitConfig } from "./JazelKitConfig.js";
import { log } from "console";

//* ////////////////////// *//
//*  TYPES AND INTERFACES  *//
//* ////////////////////// *//

export type SocketMiddleware = (
  io: Namespace,
  app: Express.Application,
) => void;
export type ExpressMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void;

//* //////////// *//
//*  MAIN LOGIC  *//
//* //////////// *//

const DEBUG = true;

export async function startServer(
  __dirname: string,
  config: JazelKitConfig = {},
) {
  const app = express();
  const port: number = (config.port || 80) as number;

  const VERSION = "Alpha v1.0.1";

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: `*` },
  });

  const randomChars = Math.random().toString(36).substring(2, 15);
  log(`Random chars: ${randomChars}`);

  const reloadServer = livereload.createServer({ port: 24680 });
  reloadServer.watch(__dirname + "/src");

  // Root für die HTML-Dateien
  const rootDir = path.join(__dirname, config.root || "./src");
  const publicDir = path.join(__dirname, config.assets || "./public");

  const ROUTES_DIR = path.join(rootDir, `/routes`);
  const ASSETS_DIR = path.join(publicDir, `/assets`);
  const CSS_DIR = path.join(rootDir, `/css`);
  const SOURCE_DIR = path.join(publicDir, `/src/`);
  // const ROUTES_SOURCE_DIR = path.join(publicDir, `/src/routes`);
  const COMPONENTS_DIR = path.join(rootDir, `/components`);
  const MODULES_DIR = path.join(rootDir, `/modules`);

  // app.get("/", (req, res) => {
  //   res.sendFile(path.join(ROUTES_DIR, "index.html"));
  // });
  app.use("/src", express.static(SOURCE_DIR));
  app.use("/assets", express.static(ASSETS_DIR));
  app.use("/css", express.static(CSS_DIR));
  app.use("/favicon.ico", express.static(path.join(ASSETS_DIR, "favicon.ico")));

  for (const [from, to] of Object.entries(config.paths || {})) {
    app.use(
      from,
      express.static(
        path.join(
          __dirname,
          to
            .replaceAll("$assets", ASSETS_DIR)
            .replaceAll("$src", SOURCE_DIR)
            .replaceAll("$root", rootDir),
        ),
      ),
    );
  }

  app.use(connectLivereload({ port: 24680, ignore: ["/socket.io/*"] }));

  app.use((_req, res, next) => {
    res.setHeader("DO_NOT_FOLLOW", `/${randomChars}`);
    next();
  });

  app.use((_req, res, next) => {
    res.setHeader("X-Powered-By", `JazelKit ${VERSION}`);
    next();
  });

  app.use((req, res, next) => {
    console.time(`[${req.method}] ${req.path}: `);
    res.on("finish", () => console.timeEnd(`[${req.method}] ${req.path}: `));
    next();
  });

  app.use(async (req, res, next) => {
    if (req.path === "/") {
      return next();
    }

    const assetPath = path.join(ASSETS_DIR, req.path);
    const publicPath = path.join(publicDir, req.path);

    if (await pathExists(assetPath)) return res.sendFile(assetPath);
    if (await pathExists(publicPath)) return res.sendFile(publicPath);

    next();
  });

  app.use(async (req, res) => {
    const routeHtmlPath = path.join(ROUTES_DIR, req.path, "+index.html");
    const layoutHtmlPath = path.join(ROUTES_DIR, "+layout.html");
    const pagePathTypeScript = path.join(ROUTES_DIR, req.path, "+page.ts");
    const pagePathJavaScript = path.join(ROUTES_DIR, req.path, "+page.js");

    if (await pathExists(routeHtmlPath)) {
      const pageScripts: Array<string> = [];
      const serverScripts: Array<string> = [];
      if (await pathExists(pagePathTypeScript))
        pageScripts.push(`/src/routes${req.path}/+page.ts`);
      if (await pathExists(pagePathJavaScript))
        pageScripts.push(`/src/routes${req.path}/+page.js`);
      if (await pathExists(path.join(ROUTES_DIR, req.path, "+page.server.ts")))
        serverScripts.push(`/src/routes${req.path}/+page.server.ts`);
      if (await pathExists(path.join(ROUTES_DIR, req.path, "+page.server.js")))
        serverScripts.push(`/src/routes${req.path}/+page.server.js`);

      // Nested Layouts unterstützen
      let parentPath = path.join(ROUTES_DIR, req.path);
      const layoutPaths: Array<string> = [];
      while (parentPath !== path.dirname(ROUTES_DIR)) {
        if (await pathExists(path.join(parentPath, "+layout.html"))) {
          layoutPaths.push(path.join(parentPath, "+layout.html"));
        }
        parentPath = path.dirname(parentPath);
      }

      let layoutDom = new JSDOM(
        `<!DOCTYPE html>
        <head>
          </head><html>
          <body></body>
        </html>`,
      );
      let currentContent = await JSDOM.fromFile(routeHtmlPath);
      const layoutScripts: Array<string> = [];

      for (const layoutPath of layoutPaths) {
        if (!(await pathExists(layoutPath))) continue;
        layoutDom = await JSDOM.fromFile(layoutPath);
        await layout(
          COMPONENTS_DIR,
          layoutDom.window.document,
          currentContent.window.document,
          config,
        );
        currentContent = layoutDom;
        if (await pathExists(path.join(layoutPath, "+layout.server.ts"))) {
          layoutScripts.push(`/src/routes${req.path}/+layout.server.ts`);
        }
        if (await pathExists(path.join(layoutPath, "+layout.server.js"))) {
          layoutScripts.push(`/src/routes${req.path}/+layout.server.js`);
        }
      }

      if (layoutScripts.length === 0) {
        layoutDom = new JSDOM(
          `<!DOCTYPE html><html><body><slot /></body></html>`,
        );
        await layout(
          COMPONENTS_DIR,
          layoutDom.window.document,
          currentContent.window.document,
          config,
        );
        currentContent = layoutDom;
      }

      manipulateSiteDom(currentContent.window.document, req, config, [
        ...layoutScripts,
        ...pageScripts,
        ...serverScripts,
      ]);
      const finalHtml = currentContent.serialize();

      return res.status(200).send(finalHtml);
    }

    const paths = req.path.split("/").filter(Boolean);

    let notAvailableLevel = 0;

    for (let i = paths.length; i > 0; i--) {
      const checkPath = path.join(ROUTES_DIR, ...paths.slice(0, i));
      if (!(await pathExists(checkPath))) {
        notAvailableLevel++;
      } else {
        break;
      }
    }

    const unavailableSincePath = paths
      .slice(0, paths.length - notAvailableLevel)
      .join("/");

    if (notAvailableLevel >= 1) {
      const availablePaths = await getChildDirs(
        path.join(ROUTES_DIR, unavailableSincePath),
        /^\[.*\]$/, // regex for dynamic paths (e.g. [id])
      );
      console.info(
        `Available dynamic paths at this level: ${availablePaths.join(", ")}`,
      );
    }

    console.info(
      `Path is not available. Level of unavailability: ${notAvailableLevel} (${unavailableSincePath})`,
    );

    const layoutDom = await JSDOM.fromFile(layoutHtmlPath);
    const html404Dom = await JSDOM.fromFile(path.join(ROUTES_DIR, "+404.html"));
    await layout(
      COMPONENTS_DIR,
      layoutDom.window.document,
      html404Dom.window.document,
      config,
    );

    manipulateSiteDom(layoutDom.window.document, req, config);
    const html404 = layoutDom.serialize();
    return res.status(404).send(html404);
  });

  function startServer(customPort: number = port) {
    httpServer
      .listen(customPort, async () => {
        console.log(
          `  ${chalk.green.bold("JazelKit ")} ${chalk.green(VERSION)}\n\n` +
            (customPort === 80
              ? "  ➜  Local:   http://localhost/ or http://localhost:80/\n"
              : `  ➜  Local:   http://localhost:${customPort}/\n`) +
            `  ➜  Network: use --host to expose` +
            `  ➜  press h + enter to show help`,
        );
      })
      .on("error", (err) => {
        if (err.name === "EADDRINUSE") {
          console.error(
            `Port ${customPort} is already in use! Trying ${customPort + 1}...`,
          );
          startServer(customPort + 1);
        } else if (err.name === "EACCES") {
          console.error(`No permission for port ${customPort}.`);
        } else {
          console.error("Server error:", err);
        }
      });
  }
  if ((config.build?.compile || true) == true) {
    await buildAll(rootDir, SOURCE_DIR, MODULES_DIR, config);
    console.log("Pages built.");
  }
  const allModuleFiles = await collectFiles(
    path.join(publicDir, "src/modules"),
    (name) => name.endsWith(".js"),
  );
  for (const moduleFile of allModuleFiles) {
    try {
      const importedModule = await import(moduleFile);
      if (importedModule && typeof importedModule.socket === "function") {
        if (importedModule && typeof importedModule.socketPath === "string") {
          const func: SocketMiddleware = importedModule.socket;
          console.log(`Imported module ${moduleFile} as Socket Module.`);
          // Hier wird ein Namensraum erstellt, wenn ein socketPath definiert ist
          const chatNamespace = io.of(importedModule.socketPath);
          // die Funktion `func` wird nun mit dem Namensraum aufgerufen
          func(chatNamespace, app);
        } else {
          console.error(
            `Error in ${moduleFile}\nModule ${moduleFile} is missing a socketPath export. (export const socketPath = "/your-path";)`,
          );
        }
      }
      if (importedModule && typeof importedModule.middleware === "function") {
        const func: ExpressMiddleware = importedModule.middleware;
        app.use(func);
        console.log(`Imported module ${moduleFile} as Express Middleware.`);
      } else {
        console.warn(
          `Module ${moduleFile} does not export a middleware function.`,
        );
      }
    } catch (error) {
      console.error(`Error importing module ${moduleFile}:`, error);
      continue;
    }

    app.use((req, res, next) => {
      if (DEBUG) {
        console.time(`[${req.method}] ${req.path}: `);
        res.on("finish", () =>
          console.timeEnd(`[${req.method}] ${req.path}: `),
        );
      }
      next();
    });
  }

  startServer();
}

//** /////////// **//
// *************** //
// **  EXPORTS  ** //
// *************** //
//** /////////// **//

export type * from "./build.d.ts";
export type * from "./helpers.d.ts";
export type * from "./JazelKitConfig.d.ts";
export type * from "./layout.d.ts";
export type * from "./main.d.ts";
export type * from "./manipulateDom.d.ts";
export type { Namespace, Socket } from "socket.io";
export type { Request, Response, NextFunction } from "express";
export * from "./helpers.js";
