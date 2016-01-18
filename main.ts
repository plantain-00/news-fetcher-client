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

interface Source {
    url: string;
    selector: string;
    getItem: ($: Cheerio) => types.Item;
}

let sources: Source[] = [
    {
        url: "https://v2ex.com/?tab=hot",
        selector: ".item_title > a",
        getItem: (cheerio: Cheerio) => {
            return {
                href: "https://v2ex.com" + cheerio.attr("href"),
                title: cheerio.text(),
            };
        },
    },
    {
        url: "https://kat.cr",
        selector: ".filmType > a",
        getItem: (cheerio: Cheerio) => {
            return {
                href: "https://kat.cr" + cheerio.attr("href"),
                title: cheerio.text(),
            };
        },
    },
    {
        url: "https://eztv.ag",
        selector: ".epinfo > a",
        getItem: (cheerio: Cheerio) => {
            return {
                href: "https://eztv.ag" + cheerio.attr("href"),
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
        url: "https://kat.cr/usearch/czech%20massage/?field=time_add&sorder=desc",
        selector: ".filmType > a",
        getItem: (cheerio: Cheerio) => {
            return {
                href: "https://kat.cr" + cheerio.attr("href"),
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
                href: "https://kat.cr/usearch/" + name,
                title: name,
                detail: cheerio.attr("src"),
            };
        },
    },
];

libs.electron.ipcMain.on(types.events.items, async (event) => {
    for (let source of sources) {
        try {
            let response = await libs.requestAsync({
                url: source.url
            });
            let $ = libs.cheerio.load(response.body);
            let result: types.Item[] = [];
            $(source.selector).each((index, element) => {
                result.push(source.getItem($(element)));
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
});

libs.electron.app.on("ready", () => {
    mainWindow = new libs.electron.BrowserWindow({ width: 1200, height: 800 });
    mainWindow.loadURL(`file://${__dirname}/index.html`);
    mainWindow.webContents.openDevTools();
    mainWindow.on("closed", function() {
        mainWindow = null;
    });
});
