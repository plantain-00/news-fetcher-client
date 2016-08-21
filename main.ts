import * as libs from "./libs";
import * as types from "./types";
import * as settings from "./settings";

let config: types.Config = {
    sync: {
        key: "",
        serverUrl: "",
        willSync: false,
    },
    rawSources: settings.rawSources,
};

const schema = require("./schema.json");

libs.electron.crashReporter.start({
    companyName: "news-fetcher",
    submitURL: `${config.sync.serverUrl}/logs?key=${config.sync.key}`,
});

let mainWindow: Electron.BrowserWindow | undefined = undefined;

let json: { isSuccess: boolean; errorMessage?: string; items: string[]; };
let localData: { url: string; createTime: number; }[];

const userDataPath = libs.electron.app.getPath("userData");
const historyPath = libs.path.resolve(userDataPath, "history.json");
const configurationPath = libs.path.resolve(userDataPath, "configuration.json");

try {
    const data = libs.fs.readFileSync(configurationPath, "utf8");
    config = JSON.parse(data);
} catch (error) {
    console.log(error);
    libs.fs.writeFile(configurationPath, JSON.stringify(config, null, "    "));
}

type Source = {
    name: string;
    url: string;
    selector: string;
    getItem: (cheerio: Cheerio, $: CheerioStatic) => types.Item;
    limit?: number;
}

const sources: Source[] = [];

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

libs.electron.app.on("window-all-closed", function () {
    if (config.sync.willSync) {
        libs.electron.app.quit();
    } else if (localData) {
        const ExpiredMoment = Date.now() - 30 * 24 * 3600 * 1000;
        localData = localData.filter(d => d.createTime > ExpiredMoment);
        libs.fs.writeFile(historyPath, JSON.stringify(localData, null, "    "), error => {
            if (error) {
                console.log(error);
            }

            libs.electron.app.quit();
        });
    }
});

libs.electron.ipcMain.on(types.events.hide, async (event, url) => {
    try {
        json.items.push(url);

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
        console.log(error);
    }
});

libs.electron.ipcMain.on(types.events.reload, async (event, url) => {
    try {
        const source = sources.find(s => s.url === url);
        if (source) {
            await load(source, event);
        }
    } catch (error) {
        console.log(error);
    }
});

libs.electron.ipcMain.on(types.events.saveConfiguration, async (event, newConfiguration) => {
    try {
        config = newConfiguration;
        libs.fs.writeFileSync(configurationPath, JSON.stringify(config, null, "    "), {
            encoding: "utf8",
        });
    } catch (error) {
        console.log(error);
    }
});

async function load(source: Source, event: Electron.IpcMainEvent) {
    try {
        const [, body] = await libs.requestAsync({
            url: source.url,
        });
        const $ = libs.cheerio.load(body);
        const items: types.Item[] = [];
        $(source.selector).each((index, element) => {
            if (source.limit && index >= source.limit) {
                return;
            }
            const item = source.getItem($(element), $);
            if (item && json.items.indexOf(item.href) === -1 && items.findIndex(i => i.href === item.href) === -1) {
                items.push(item);
            }
        });
        event.sender.send(types.events.items, {
            name: source.name,
            source: source.url,
            items,
        });
    } catch (error) {
        console.log(error);
        event.sender.send(types.events.items, {
            name: source.name,
            source: source.url,
            error: error.message,
        });
    }
}

libs.electron.ipcMain.on(types.events.items, async (event) => {
    try {
        if (config.sync.willSync) {
            const [, body] = await libs.requestAsync({
                url: `${config.sync.serverUrl}/items?key=${config.sync.key}`,
            });
            json = JSON.parse(body);
        } else {
            try {
                localData = require(historyPath);
                json = {
                    isSuccess: true,
                    items: localData.map(d => d.url),
                };
            } catch (error) {
                localData = [];
                json = {
                    isSuccess: true,
                    items: [],
                };
            }
        }

        if (!json.isSuccess) {
            console.log(json.errorMessage);
            return;
        }

        event.sender.send(types.events.initialize, {
            startval: config,
            schema,
        });

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
    mainWindow.on("closed", function () {
        mainWindow = undefined;
    });
    // mainWindow.webContents.openDevTools();
});
