import * as libs from "./libs";
import * as types from "./types";

libs.electron.crashReporter.start({
    companyName: "yao",
    submitURL: "http://localhost",
});

let mainWindow: GitHubElectron.BrowserWindow = null;

libs.electron.app.on("window-all-closed", function() {
    if (process.platform !== "darwin") {
        libs.electron.app.quit();
    }
});

libs.electron.ipcMain.on(types.events.items, async (event) => {
    fetchV2exHot(event);
    fetchKickassTorrents(event);
    fetchEztv(event);
    fetchCnbeta(event);
    fetchGithubTrending(event);
});

async function fetchV2exHot(event: GitHubElectron.IPCMainEvent) {
    let source = types.sources.v2ex_hot;
    try {
        let response = await libs.requestAsync({
            url: source
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
        event.sender.send(types.events.items, {
            source: source,
            items: result,
        });
    } catch (error) {
        console.log(error);
        event.sender.send(types.events.items, {
            source: source
        });
    }
}

async function fetchKickassTorrents(event: GitHubElectron.IPCMainEvent) {
    let source = types.sources.kickass_torrents;
    try {
        let response = await libs.requestAsync({
            url: source,
            gzip: true,
        });
        let $ = libs.cheerio.load(response.body);
        let items = $(".filmType");
        console.log(items);
        let result: types.Item[] = [];
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let a = $($(item).children()[0]);
            result.push({
                href: "https://kat.cr" + a.attr("href"),
                title: a.text(),
            });
        }
        console.log(result);
        event.sender.send(types.events.items, {
            source: source,
            items: result,
        });
    } catch (error) {
        console.log(error);
        event.sender.send(types.events.items, {
            source: source
        });
    }
}

async function fetchEztv(event: GitHubElectron.IPCMainEvent) {
    let source = types.sources.eztv;
    try {
        let response = await libs.requestAsync({
            url: source
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
        event.sender.send(types.events.items, {
            source: source,
            items: result,
        });
    } catch (error) {
        console.log(error);
        event.sender.send(types.events.items, {
            source: source
        });
    }
}

async function fetchCnbeta(event: GitHubElectron.IPCMainEvent) {
    let source = types.sources.cnbeta;
    try {
        let response = await libs.requestAsync({
            url: source
        });
        let $ = libs.cheerio.load(response.body);
        let items = $(".title");
        let result: types.Item[] = [];
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let a = $($(item).children()[0]);
            result.push({
                href: "http://www.cnbeta.com" + a.attr("href"),
                title: a.text(),
            });
        }
        event.sender.send(types.events.items, {
            source: source,
            items: result,
        });
    } catch (error) {
        console.log(error);
        event.sender.send(types.events.items, {
            source: source
        });
    }
}

async function fetchGithubTrending(event: GitHubElectron.IPCMainEvent) {
    let source = types.sources.github_trending;
    try {
        let response = await libs.requestAsync({
            url: source
        });
        let $ = libs.cheerio.load(response.body);
        let items = $(".repo-list-name");
        let result: types.Item[] = [];
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let a = $($(item).children()[0]);
            result.push({
                href: "https://github.com" + a.attr("href"),
                title: a.text(),
            });
        }
        event.sender.send(types.events.items, {
            source: source,
            items: result,
        });
    } catch (error) {
        console.log(error);
        event.sender.send(types.events.items, {
            source: source
        });
    }
}

libs.electron.app.on("ready", () => {
    mainWindow = new libs.electron.BrowserWindow({ width: 1200, height: 800 });
    mainWindow.loadURL(`file://${__dirname}/index.html`);
    mainWindow.webContents.openDevTools();
    mainWindow.on("closed", function() {
        mainWindow = null;
    });
});
