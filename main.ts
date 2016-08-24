import * as libs from "./libs";
import * as types from "./types";

let config: types.Config = {
    sync: {
        key: "",
        serverUrl: "",
        willSync: false,
    },
    rawSources: [
        {
            name: "zhihu explore",
            url: "https://www.zhihu.com/explore/recommendations",
            selector: ".question_link",
            getItem: `(cheerio, $) => {
    return {
        href: "https://www.zhihu.com" + cheerio.attr("href"),
        title: cheerio.text(),
    };
}`,
        },
        {
            name: "v2ex hot",
            url: "https://v2ex.com/?tab=hot",
            selector: ".item_title > a",
            getItem: `(cheerio, $) => {
    const count = cheerio.parent().parent().next().find("a").text();
    return {
        href: "https://v2ex.com" + cheerio.attr("href").split("#")[0],
        title: cheerio.text() + " / " + count,
    };
}`,
        },
        {
            name: "github trending",
            url: "https://github.com/trending",
            selector: ".repo-list-name > a",
            getItem: `(cheerio, $) => {
    return {
        href: "https://github.com" + cheerio.attr("href"),
        title: cheerio.text() + " : " + cheerio.parent().next().text(),
    };
}`,
        },
        {
            name: "hacker news",
            url: "https://news.ycombinator.com/",
            selector: ".athing > .title > a",
            getItem: `(cheerio, $) => {
    const array = cheerio.parentsUntil("tr").next().find(".subtext > a");
    const a = array[array.length - 1];
    return {
        href: cheerio.attr("href"),
        title: cheerio.text(),
        detail: "https://news.ycombinator.com/" + $(a).attr("href"),
    };
}`,
        },
        {
            name: "cnode",
            url: "https://cnodejs.org/?tab=all",
            selector: ".topic_title",
            getItem: `(cheerio, $) => {
    const replyCount = cheerio.parent().prevUntil("span").find(".count_of_replies").text();
    const title = cheerio.text();
    return {
        href: "https://cnodejs.org" + cheerio.attr("href"),
        title: replyCount ? title + " / " + replyCount : title,
    };
}`,
        },
        {
            name: "extra torrent",
            url: `http://extratorrent.cc/`,
            selector: ".tli > a",
            getItem: `(cheerio, $) => {
    return {
        href: "http://extratorrent.cc/" + cheerio.attr("href"),
        title: cheerio.text(),
    };
}`,
            limit: 10,
        },
        {
            name: "eztv",
            url: "https://eztv.ag",
            selector: ".epinfo",
            getItem: `(cheerio, $) => {
    return {
        href: "https://eztv.ag" + cheerio.attr("href"),
        title: cheerio.text(),
    };
}`,
        },
        { name: "typescript", url: "https://github.com/microsoft/typescript/milestones", isMilestone: true },
        { name: "angular", url: "https://github.com/angular/angular/milestones", isMilestone: true },
        { name: "react", url: "https://github.com/facebook/react/milestones", isMilestone: true },
        { name: "vuejs", url: "https://github.com/vuejs/vue/milestones", isMilestone: true },
        { name: "corefx", url: "https://github.com/dotnet/corefx/milestones", isMilestone: true },
        { name: "coreclr", url: "https://github.com/dotnet/coreclr/milestones", isMilestone: true },
        { name: "aspnet MVC", url: "https://github.com/aspnet/Mvc/milestones", isMilestone: true },
        { name: "nodejs", url: "https://github.com/nodejs/node/milestones", isMilestone: true },
        { name: "expressjs", url: "https://github.com/expressjs/express/milestones", isMilestone: true },
        { name: "bootstrap", url: "https://github.com/twbs/bootstrap/milestones", isMilestone: true },
        { name: "NativeScript", url: "https://github.com/NativeScript/NativeScript/milestones", isMilestone: true },
        { name: "gogs", url: "https://github.com/gogits/gogs/milestones", isMilestone: true },
        { name: "letsencrypt", url: "https://github.com/letsencrypt/letsencrypt/milestones", isMilestone: true },
    ],
    localFiles: {
        historyPath: "",
        configurationPath: "",
    },
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

libs.electron.ipcMain.on(types.events.saveConfiguration, async (event: any, {sync, rawSources}: types.Config) => {
    try {
        config.sync = sync;
        config.rawSources = rawSources;
        libs.fs.writeFileSync(config.localFiles.configurationPath, JSON.stringify({ sync, rawSources }, null, "    "), {
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
                localData = require(config.localFiles.historyPath);
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
    mainWindow.on("closed", () => {
        mainWindow = undefined;
    });
    // mainWindow.webContents.openDevTools();
});
