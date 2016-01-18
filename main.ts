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
    fetchCzechMassage(event);
    fetchXart(event);
});

async function fetchV2exHot(event: GitHubElectron.IPCMainEvent) {
    let source = types.sources.v2ex_hot;
    try {
        let response = await libs.requestAsync({
            url: source
        });
        let $ = libs.cheerio.load(response.body);
        let result: types.Item[] = [];
        $(".item_title > a").each((index, a) => {
            result.push({
                href: "https://v2ex.com" + $(a).attr("href"),
                title: $(a).text(),
            });
        });
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
            url: source
        });
        let $ = libs.cheerio.load(response.body);
        let result: types.Item[] = [];
        $(".filmType > a").each((index, a) => {
            result.push({
                href: "https://kat.cr" + $(a).attr("href"),
                title: $(a).text(),
            });
        });
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
        let result: types.Item[] = [];
        $(".epinfo > a").each((index, a) => {
            result.push({
                href: "https://eztv.ag" + $(a).attr("href"),
                title: $(a).text(),
            });
        });
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
        let result: types.Item[] = [];
        $(".title > a").each((index, a) => {
            result.push({
                href: "http://www.cnbeta.com" + $(a).attr("href"),
                title: $(a).text(),
            });
        });
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
        let result: types.Item[] = [];
        $(".repo-list-name > a").each((index, a) => {
            result.push({
                href: "https://github.com" + $(a).attr("href"),
                title: $(a).text(),
            });
        });
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

async function fetchCzechMassage(event: GitHubElectron.IPCMainEvent) {
    let source = types.sources.czech_massage;
    try {
        let response = await libs.requestAsync({
            url: source,
            gzip: true,
        });
        let $ = libs.cheerio.load(response.body);
        let result: types.Item[] = [];
        $(".filmType > a").each((index, a) => {
            result.push({
                href: "https://kat.cr" + $(a).attr("href"),
                title: $(a).text(),
            });
        });
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

async function fetchXart(event: GitHubElectron.IPCMainEvent) {
    let source = types.sources.xart;
    try {
        let response = await libs.requestAsync({
            url: source
        });
        let $ = libs.cheerio.load(response.body);
        let result: types.Item[] = [];
        $(".show-for-touch > .cover > img").each((index, img) => {
            let name = $(img).attr("alt");
            result.push({
                href: "https://kat.cr/usearch/" + name,
                title: name,
                detail: $(img).attr("src"),
            });
        });
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
