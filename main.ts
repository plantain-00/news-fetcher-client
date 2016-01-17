import * as libs from "./libs";
import * as types from "./types";
const app = libs.electron.app;
const BrowserWindow = libs.electron.BrowserWindow;

libs.electron.crashReporter.start({
    companyName: "yao"
});

let mainWindow: GitHubElectron.BrowserWindow = null;

app.on("window-all-closed", function() {
    if (process.platform != "darwin") {
        app.quit();
    }
});

app.on("ready", () => {
    mainWindow = new BrowserWindow({ width: 1200, height: 800 });
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    mainWindow.webContents.openDevTools();
    mainWindow.on("closed", function() {
        mainWindow = null;
    });

    libs.electron.ipcMain.on(types.sources.v2ex_hot, async (event) => {
        const baseUrl = "https://v2ex.com";
        let response = await libs.requestAsync({
            url: `${baseUrl}/?tab=hot`
        });
        let $ = libs.cheerio.load(response.body);
        let items = $(".item_title");
        let result: types.Item[] = [];
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let a = $($(item).children()[0]);
            result.push({
                href: baseUrl + a.attr("href"),
                title: a.text(),
            });
        }
        event.sender.send(types.sources.v2ex_hot, result);
    });
});
