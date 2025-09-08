// start.js
import { spawn } from "child_process";
import chalk from "chalk";
import path from "path";
import { fileURLToPath } from "url";
import { log } from "console";

export function logMessage(message, server = false, client = false) {
  log(
    `${chalk.gray(getCurrentTime())} ${chalk.cyan.bold("[JazelKit]")}${
      server ? chalk.blackBright(" (Server)") : ""
    }${client ? chalk.blackBright(" (Client)") : ""} ${message}\n`
  );
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serverProcess;

function startServerProcess() {
  logMessage("Starte Server...", true);
  const mainJsPath = path.join(__dirname, "main.js");

  serverProcess = spawn(process.execPath, [mainJsPath], {
    stdio: "inherit",
  });

  serverProcess.on("close", (code) => {
    if (code === 0) {
      log("Server wurde beendet.", true);
    } else {
      logMessage(`Server wurde unerwartet beendet. Exit Code: ${code}.`, true);
      // startServerProcess();
    }
  });
}

function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export { getCurrentTime };

// process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf8");

process.stdin.on("data", (data) => {
  const input = data.toString().trim().toLowerCase();

  if (input === "r") {
    log("Neustart-Befehl empfangen. Beende alten Prozess...");
    serverProcess.kill("SIGTERM");
  }

  if (input === "q") {
    log("Beende alle Prozesse...");
    serverProcess.kill("SIGTERM");
    process.exit();
  }

  if (input === "h") {
    log(
      `Shortcuts:\n${chalk.gray("press")} r + enter ${chalk.gray(
        "to restart server"
      )}\n${chalk.gray("press")} q + enter ${chalk.gray(
        "to quit server"
      )}\n${chalk.gray("press")} h + enter ${chalk.gray("to show this help")}`
    );
  }
});

startServerProcess();
