import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("electron-app", process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient("electron-app");
}

process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;
let splashScreen: BrowserWindow | null;

function createSplashWindow() {
  splashScreen = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
  });

  // Load splash screen HTML
  if (VITE_DEV_SERVER_URL) {
    splashScreen.loadURL(`${VITE_DEV_SERVER_URL}/splash-screen.html`);
  } else {
    splashScreen.loadFile(path.join(RENDERER_DIST, "splash-screen.html"));
  }

  splashScreen.on("closed", () => {
    splashScreen = null;
  });
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "react.svg"),
    width: 1024,
    height: 768,
    minWidth: 1024,
    minHeight: 768,
    frame: false,
    titleBarStyle: "hidden",
    show: false, // Don't show until ready
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // Listen for window state changes
  win.on("maximize", () => {
    win?.webContents.send("window-state-changed", { isMaximized: true });
  });

  win.on("unmaximize", () => {
    win?.webContents.send("window-state-changed", { isMaximized: false });
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }

  win.once("ready-to-show", () => {
    if (splashScreen) {
      splashScreen.close();
    }
    win?.show();
  });
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine) => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  // Create mainWindow when app is ready
  app.whenReady().then(() => {
    createSplashWindow();
    createWindow();
  });

  app.on("open-url", (event, url) => {
    dialog.showErrorBox("Welcome Back", `You arrived from: ${url}`);
  });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createSplashWindow();
    createWindow();
  }
});

// IPC handlers
ipcMain.handle("window-maximize", () => {
  if (win?.isMaximized()) {
    win.unmaximize();
    return false;
  } else {
    win?.maximize();
    return true;
  }
});

ipcMain.handle("window-unmaximize", () => {
  win?.unmaximize();
});

ipcMain.handle("window-minimize", () => {
  win?.minimize();
});

ipcMain.handle("window-close", () => {
  win?.close();
});

ipcMain.handle("window-is-maximized", () => {
  return win?.isMaximized() || false;
});
