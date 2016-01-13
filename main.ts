/// <reference path="typings/tsd.d.ts" />
"use strict";

import * as electron from "electron";
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
import * as request from "request";

electron.crashReporter.start({
    companyName: "yao"
});

let mainWindow: GitHubElectron.BrowserWindow = null;

app.on("window-all-closed", function() {
    if (process.platform != "darwin") {
        app.quit();
    }
});

app.on("ready", function() {
    mainWindow = new BrowserWindow({ width: 800, height: 600 });
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    mainWindow.webContents.openDevTools();
    mainWindow.on("closed", function() {
        mainWindow = null;
    });
});
