import * as libs from "./libs";
import * as types from "./types";
import * as settings from "./settings";

let config = {
    key: "",
    serverUrl: "",
    willSync: false,
}

libs.electron.crashReporter.start({
    companyName: "news-fetcher",
    submitURL: "http://localhost",
});

let mainWindow: GitHubElectron.BrowserWindow = null;

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

console.log({
    config: config,
});

libs.electron.app.on("window-all-closed", function () {
    if (config.willSync) {
        libs.electron.app.quit();
    } else {
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

        if (config.willSync) {
            await libs.requestAsync({
                url: `${config.serverUrl}/items?key=${config.key}`,
                method: "POST",
                form: {
                    url: url,
                },
            });
        } else {
            localData.push({
                url: url,
                createTime: Date.now(),
            });
        }
    } catch (error) {
        console.log(error);
    }
});

libs.electron.ipcMain.on(types.events.reload, async (event, url) => {
    try {
        const source = settings.sources.find(s => s.url === url);
        if (source) {
            await load(source, event);
        }
    } catch (error) {
        console.log(error);
    }
});

async function load(source: types.Source, event: GitHubElectron.IPCMainEvent) {
    try {
        const [response, body] = await libs.requestAsync({
            url: source.url,
        });
        const $ = libs.cheerio.load(body);
        const result: types.Item[] = [];
        $(source.selector).each((index, element) => {
            const item = source.getItem($(element), $);
            if (item && json.items.indexOf(item.href) === -1) {
                result.push(item);
            }
        });
        event.sender.send(types.events.items, {
            name: source.name,
            source: source.url,
            items: result,
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
        if (config.willSync) {
            const [response, body] = await libs.requestAsync({
                url: `${config.serverUrl}/items?key=${config.key}`,
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

        for (const source of settings.sources) {
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
        mainWindow = null;
    });
    // mainWindow.webContents.openDevTools();
});
