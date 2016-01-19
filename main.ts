import * as libs from "./libs";
import * as types from "./types";
import * as settings from "./settings";

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

interface Source {
    url: string;
    selector: string;
    getItem: ($: Cheerio) => types.Item;
}

const kissassTorrentBaseUrl = "https://kat.cr";

let sources: Source[] = [
    {
        url: "https://v2ex.com/?tab=hot",
        selector: ".item_title > a",
        getItem: (cheerio: Cheerio) => {
            return {
                href: "https://v2ex.com" + cheerio.attr("href").split("#")[0],
                title: cheerio.text(),
            };
        },
    },
    {
        url: "http://www.cnbeta.com",
        selector: ".title > a",
        getItem: (cheerio: Cheerio) => {
            return {
                href: "http://www.cnbeta.com" + cheerio.attr("href"),
                title: cheerio.text(),
            };
        },
    },
    {
        url: "https://github.com/trending",
        selector: ".repo-list-name > a",
        getItem: (cheerio: Cheerio) => {
            return {
                href: "https://github.com" + cheerio.attr("href"),
                title: cheerio.text(),
            };
        },
    },
    {
        url: "http://www.xart.com/videos",
        selector: ".show-for-touch > .cover > img",
        getItem: (cheerio: Cheerio) => {
            let name = cheerio.attr("alt");
            return {
                href: `${kissassTorrentBaseUrl}/usearch/${name}`,
                title: name,
                detail: cheerio.attr("src"),
            };
        },
    },
    {
        url: "https://news.ycombinator.com/",
        selector: ".athing > .title > a",
        getItem: (cheerio: Cheerio) => {
            return {
                href: cheerio.attr("href"),
                title: cheerio.text(),
            };
        },
    },
    {
        url: "https://cnodejs.org/?tab=all",
        selector: ".topic_title",
        getItem: (cheerio: Cheerio) => {
            return {
                href: "https://cnodejs.org" + cheerio.attr("href"),
                title: cheerio.text(),
            };
        },
    },
    {
        url: kissassTorrentBaseUrl,
        selector: ".filmType > a",
        getItem: (cheerio: Cheerio) => {
            return {
                href: kissassTorrentBaseUrl + cheerio.attr("href"),
                title: cheerio.text(),
            };
        },
    },
    {
        url: "https://eztv.ag",
        selector: ".epinfo",
        getItem: (cheerio: Cheerio) => {
            return {
                href: "https://eztv.ag" + cheerio.attr("href"),
                title: cheerio.text(),
            };
        },
    },
    {
        url: `${kissassTorrentBaseUrl}/usearch/czech%20massage/?field=time_add&sorder=desc`,
        selector: ".filmType > a",
        getItem: (cheerio: Cheerio) => {
            return {
                href: kissassTorrentBaseUrl + cheerio.attr("href"),
                title: cheerio.text(),
            };
        },
    },
];

let json: { isSuccess: boolean; errorMessage: string; items: string[]; };

libs.electron.ipcMain.on(types.events.hide, async (event, url) => {
    try {
        json.items.push(url);

        await libs.requestAsync({
            url: `${settings.serverUrl}/items?key=${settings.key}`,
            method: "POST",
            form: {
                url: url
            },
        });
    } catch (error) {
        console.log(error);
    }
});

libs.electron.ipcMain.on(types.events.reload, async (event, url) => {
    try {
        let source = sources.find(s => s.url === url);
        if (source) {
            await load(source, event);
        }
    } catch (error) {
        console.log(error);
    }
});

async function load(source: Source, event: GitHubElectron.IPCMainEvent) {
    try {
        let response = await libs.requestAsync({
            url: source.url
        });
        let $ = libs.cheerio.load(response.body);
        let result: types.Item[] = [];
        $(source.selector).each((index, element) => {
            let item = source.getItem($(element));
            if (json.items.indexOf(item.href) === -1) {
                result.push(item);
            }
        });
        event.sender.send(types.events.items, {
            source: source.url,
            items: result,
        });
    } catch (error) {
        console.log(error);
        event.sender.send(types.events.items, {
            source: source.url
        });
    }
}

libs.electron.ipcMain.on(types.events.items, async (event) => {
    try {
        let response = await libs.requestAsync({
            url: `${settings.serverUrl}/items?key=${settings.key}`
        });
        json = JSON.parse(response.body);
        if (!json.isSuccess) {
            console.log(json.errorMessage);
            return;
        }

        for (let source of sources) {
            await load(source, event);
        }
    } catch (error) {
        console.log(error);
    }
});

libs.electron.app.on("ready", () => {
    mainWindow = new libs.electron.BrowserWindow({ width: 1200, height: 800 });
    mainWindow.loadURL(`file://${__dirname}/index.html`);
    mainWindow.on("closed", function() {
        mainWindow = null;
    });
});
