import * as libs from "./libs";
import * as types from "./types";

libs.electron.crashReporter.start({
    companyName: "yao"
});

let mainWindow: GitHubElectron.BrowserWindow = null;

libs.electron.app.on("window-all-closed", function() {
    if (process.platform !== "darwin") {
        libs.electron.app.quit();
    }
});

function fetchV2exHot() {
    libs.electron.ipcMain.on(types.sources.v2ex_hot, async (event) => {
        try {
            let response = await libs.requestAsync({
                url: types.sources.v2ex_hot
            });
            let $ = libs.cheerio.load(response.body);
            let items = $(".item_title");
            let result: types.Item[] = [];
            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                let a = $($(item).children()[0]);
                result.push({
                    href: "https://v2ex.com" + a.attr("href"),
                    title: a.text(),
                });
            }
            event.sender.send(types.sources.v2ex_hot, result);
        } catch (error) {
            console.log(error);
        }
    });
}

function fetchKickassTorrents() {
    libs.electron.ipcMain.on(types.sources.kickass_torrents, async (event) => {
        try {
            let response = await libs.requestAsync({
                url: types.sources.kickass_torrents
            });
            console.log(response.body);
            let $ = libs.cheerio.load(response.body);
            let items = $(".filmType");
            console.log(items.length);
            let result: types.Item[] = [];
            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                let a = $($(item).children()[0]);
                result.push({
                    href: "https://kat.cr" + a.attr("href"),
                    title: a.text(),
                });
            }
            event.sender.send(types.sources.kickass_torrents, result);
        } catch (error) {
            console.log(error);
        }
    });
}

function fetchEztv() {
    libs.electron.ipcMain.on(types.sources.eztv, async (event) => {
        try {
            let response = await libs.requestAsync({
                url: types.sources.eztv
            });
            let $ = libs.cheerio.load(response.body);
            let items = $(".epinfo");
            let result: types.Item[] = [];
            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                let a = $(item);
                result.push({
                    href: "https://eztv.ag" + a.attr("href"),
                    title: a.text(),
                });
            }
            event.sender.send(types.sources.eztv, result);
        } catch (error) {
            console.log(error);
        }
    });
}

libs.electron.app.on("ready", () => {
    mainWindow = new libs.electron.BrowserWindow({ width: 1200, height: 800 });
    mainWindow.loadURL(`file://${__dirname}/index.html`);
    mainWindow.webContents.openDevTools();
    mainWindow.on("closed", function() {
        mainWindow = null;
    });

    fetchV2exHot();
    fetchKickassTorrents();
    fetchEztv();
});
