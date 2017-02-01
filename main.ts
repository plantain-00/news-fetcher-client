import * as libs from "./libs";
import * as types from "./types";

import { config } from "./config";

const schema = require("./schema.json");

libs.electron.crashReporter.start({
    companyName: "news-fetcher",
    submitURL: `${config.sync.serverUrl}/logs?key=${config.sync.key}`,
});

let mainWindow: Electron.BrowserWindow | undefined;

let history: {
    isSuccess: boolean;
    items?: string[];
    errorMessage?: string;
    rawSources?: types.RawSource[];
};
let localData: { url: string; createTime: number; }[];

const userDataPath = libs.electron.app.getPath("userData");
config.localFiles.historyPath = libs.path.resolve(userDataPath, "history.json");
config.localFiles.configurationPath = libs.path.resolve(userDataPath, "configuration.json");

try {
    const data = libs.fs.readFileSync(config.localFiles.configurationPath, "utf8");
    const {sync, rawSources} = JSON.parse(data);
    config.sync = sync;
    config.rawSources = rawSources;
} catch (error) {
    libs.fs.writeFile(config.localFiles.configurationPath, JSON.stringify(config, null, "    "));
}

type Source = {
    name: string;
    url: string;
    selector: string;
    getItem: (cheerio: Cheerio, $: CheerioStatic) => types.NewsItem;
    limit?: number;
};

const sources: Source[] = [];

function constructSources() {
    for (const rawSource of config.rawSources) {
        if (rawSource.disabled) {
            break;
        }
        if (rawSource.isMilestone) {
            sources.push({
                name: `${rawSource.name} milestone`,
                url: rawSource.url,
                selector: ".milestone-title-link > a",
                getItem: (cheerio: Cheerio, $: CheerioStatic) => {
                    const progress = cheerio.parent().parent().next().find(".progress-percent").text();
                    return {
                        href: "https://github.com" + cheerio.attr("href"),
                        title: cheerio.text() + " - " + progress,
                    };
                },
            });
        } else {
            sources.push({
                name: rawSource.name,
                url: rawSource.url,
                selector: rawSource.selector!,
                /* tslint:disable:no-eval */
                getItem: eval(rawSource.getItem!),
                /* tslint:enable:no-eval */
                limit: rawSource.limit,
            });
        }
    }
}

libs.electron.app.on("window-all-closed", () => {
    if (config.sync.willSync) {
        libs.electron.app.quit();
    } else if (localData) {
        const ExpiredMoment = Date.now() - 30 * 24 * 3600 * 1000;
        localData = localData.filter(d => d.createTime > ExpiredMoment);
        libs.fs.writeFile(config.localFiles.historyPath, JSON.stringify(localData, null, "    "), error => {
            if (error) {
                console.log(error);
            }

            libs.electron.app.quit();
        });
    }
});

libs.electron.ipcMain.on("hide", async (event, url) => {
    try {
        history.items!.push(url);

        if (config.sync.willSync) {
            await libs.requestAsync({
                url: `${config.sync.serverUrl}/items?key=${config.sync.key}`,
                method: "POST",
                form: { url },
            });
        } else {
            localData.push({
                url,
                createTime: Date.now(),
            });
        }
    } catch (error) {
        event.sender.send("error", {
            message: error.message,
        } as types.ErrorMessage);
    }
});

libs.electron.ipcMain.on("reload", async (event: Electron.IpcMainEvent, url: string) => {
    const source = sources.find(s => s.url === url);
    if (source) {
        await load(source, event);
    }
});

libs.electron.ipcMain.on("saveConfiguration", async (event: any, {sync, rawSources}: types.ConfigData) => {
    try {
        config.sync = sync;
        config.rawSources = rawSources;
        libs.fs.writeFileSync(config.localFiles.configurationPath, JSON.stringify({ sync, rawSources }, null, "    "), {
            encoding: "utf8",
        });
        await libs.requestAsync({
            method: "POST",
            url: `${config.sync.serverUrl}/sources?key=${config.sync.key}`,
            json: { rawSources },
        });
    } catch (error) {
        event.sender.send("error", {
            message: error.message,
        } as types.ErrorMessage);
    }
});

async function load(source: Source, event: Electron.IpcMainEvent) {
    try {
        const [, body] = await libs.requestAsync({
            url: source.url,
        });
        const $ = libs.cheerio.load(body);
        const items: types.NewsItem[] = [];
        $(source.selector).each((index, element) => {
            if (source.limit && index >= source.limit) {
                return;
            }
            const item = source.getItem($(element), $);
            if (item && history.items!.indexOf(item.href) === -1 && items.findIndex(i => i.href === item.href) === -1) {
                items.push(item);
            }
        });
        event.sender.send("items", {
            name: source.name,
            source: source.url,
            items,
        } as types.NewsCategory);
    } catch (error) {
        console.log(error);
        event.sender.send("items", {
            name: source.name,
            source: source.url,
            error: error.message,
        } as types.NewsCategory);
    }
}

libs.electron.ipcMain.on("items", async (event) => {
    try {
        if (config.sync.willSync) {
            const [, body] = await libs.requestAsync({
                url: `${config.sync.serverUrl}/items?key=${config.sync.key}`,
            });
            history = JSON.parse(body);
            if (history.rawSources) {
                config.rawSources = history.rawSources;
            }
        } else {
            try {
                localData = require(config.localFiles.historyPath);
                history = {
                    isSuccess: true,
                    items: localData.map(d => d.url),
                };
            } catch (error) {
                localData = [];
                history = {
                    isSuccess: true,
                    items: [],
                };
            }
        }

        if (!history.isSuccess) {
            console.log(history.errorMessage);
            return;
        }

        constructSources();

        event.sender.send("initialize", {
            startval: config,
            schema,
        } as types.InitialData);

        for (const source of sources) {
            await load(source, event);
        }
    } catch (error) {
        console.log(error);
    }
});

libs.electron.app.on("ready", () => {
    mainWindow = new libs.electron.BrowserWindow({ width: 1200, height: 800 });
    mainWindow.loadURL(`file://${__dirname}/index.html`);
    mainWindow.on("closed", () => {
        mainWindow = undefined;
    });
    // mainWindow.webContents.openDevTools();
});
