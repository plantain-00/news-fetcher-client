import * as libs from './libs'
import * as types from './types'

import { config } from './config'

import schema = require('./schema.json')

import packageJson = require('./package.json')

libs.electron.crashReporter.start({
  companyName: 'news-fetcher',
  submitURL: `${config.sync.serverUrl}/logs?key=${config.sync.key}`
})

let mainWindow: Electron.BrowserWindow | undefined

let history: {
  isSuccess: boolean;
  items?: string[];
  errorMessage?: string;
  rawSources?: types.RawSource[];
}
let localData: { url: string; createTime: number; }[]

const userDataPath = libs.electron.app.getPath('userData')
config.localFiles.historyPath = libs.path.resolve(userDataPath, 'history.json')
config.localFiles.configurationPath = libs.path.resolve(userDataPath, 'configuration.json')

try {
  const data = libs.fs.readFileSync(config.localFiles.configurationPath, 'utf8')
  const { sync, rawSources } = JSON.parse(data)
  config.sync = sync
  config.rawSources = rawSources
} catch (error) {
  libs.fs.writeFile(config.localFiles.configurationPath, JSON.stringify(config, null, '    '), error => {
    libs.printInConsole(error)
  })
}

type Source = {
  name: string;
  url: string;
  selector: string;
  getItem: (cheerio: Cheerio, $: CheerioStatic) => types.NewsItem;
  limit?: number;
}

const sources: Source[] = []

function constructSources() {
  for (const rawSource of config.rawSources) {
    if (rawSource.disabled) {
      break
    }
    if (rawSource.isMilestone) {
      sources.push({
        name: `${rawSource.name} milestone`,
        url: rawSource.url,
        selector: '.milestone-title-link > a',
        getItem: (cheerio: Cheerio, $: CheerioStatic) => {
          const progress = cheerio.parent().parent().next().find('.progress-percent').text()
          return {
            href: 'https://github.com' + cheerio.attr('href'),
            title: cheerio.text() + ' - ' + progress
          }
        }
      })
    } else {
      sources.push({
        name: rawSource.name,
        url: rawSource.url,
        selector: rawSource.selector!,
        // tslint:disable-next-line:no-eval
        getItem: eval(rawSource.getItem!),
        limit: rawSource.limit
      })
    }
  }
}

libs.electron.app.on('window-all-closed', () => {
  if (config.sync.willSync) {
    libs.electron.app.quit()
  } else if (localData) {
    const ExpiredMoment = Date.now() - 30 * 24 * 3600 * 1000
    localData = localData.filter(d => d.createTime > ExpiredMoment)
    libs.fs.writeFile(config.localFiles.historyPath, JSON.stringify(localData, null, '    '), error => {
      if (error) {
        libs.printInConsole(error)
      }

      libs.electron.app.quit()
    })
  }
})

libs.electron.ipcMain.on('hide', async(event: Electron.Event, url: string) => {
  try {
    history.items!.push(url)

    if (config.sync.willSync) {
      await libs.requestAsync({
        url: `${config.sync.serverUrl}/items?key=${config.sync.key}`,
        method: 'POST',
        form: { url }
      })
    } else {
      localData.push({
        url,
        createTime: Date.now()
      })
    }
  } catch (error) {
    const errorMessage: types.ErrorMessage = {
      message: error.message
    }
    event.sender.send('error', errorMessage)
  }
})

libs.electron.ipcMain.on('reload', async(event: Electron.Event, url: string) => {
  const source = sources.find(s => s.url === url)
  if (source) {
    await load(source, event)
  }
})

libs.electron.ipcMain.on('saveConfiguration', async(event: Electron.Event, { sync, rawSources }: types.ConfigData) => {
  try {
    config.sync = sync
    config.rawSources = rawSources
    libs.fs.writeFileSync(config.localFiles.configurationPath, JSON.stringify({ sync, rawSources }, null, '    '), {
      encoding: 'utf8'
    })
    await libs.requestAsync({
      method: 'POST',
      url: `${config.sync.serverUrl}/sources?key=${config.sync.key}`,
      json: { rawSources }
    })
  } catch (error) {
    const errorMessage: types.ErrorMessage = {
      message: error.message
    }
    event.sender.send('error', errorMessage)
  }
})

async function load(source: Source, event: Electron.Event) {
  try {
    const [, body] = await libs.requestAsync({
      url: source.url
    })
    const $ = libs.cheerio.load(body)
    const items: types.NewsItem[] = []
    $(source.selector).each((index, element) => {
      if (source.limit && index >= source.limit) {
        return
      }
      const item = source.getItem($(element), $)
      if (item && history.items!.indexOf(item.href) === -1 && items.findIndex(i => i.href === item.href) === -1) {
        items.push(item)
      }
    })
    const newsCategory: types.NewsCategory = {
      name: source.name,
      source: source.url,
      items
    }
    event.sender.send('items', newsCategory)
  } catch (error) {
    libs.printInConsole(error)
    const newsCategory: types.NewsCategory = {
      name: source.name,
      source: source.url,
      error: error.message
    }
    event.sender.send('items', newsCategory)
  }
}

type Release = {
  tag_name: string;
  prerelease: boolean;
  draft: boolean;
  assets: libs.Asset[];
}

// tslint:disable-next-line:cognitive-complexity
async function checkUpdate() {
  try {
    const [, body] = await libs.requestAsync({
      method: 'GET',
      url: `https://api.github.com/repos/plantain-00/news-fetcher-client/releases`
    })
    const releases: Release[] = JSON.parse(body)
    for (const release of releases) {
      if (!release.prerelease && !release.draft && libs.semver.gt(release.tag_name, packageJson.version)) {
        for (const asset of release.assets) {
          if (process.platform === 'darwin') {
            if (asset.name.endsWith('.dmg')) {
              libs.downloadThenOpen(asset)
              break
            }
          } else if (process.platform === 'win32' && asset.name.endsWith('.exe')) {
            libs.downloadThenOpen(asset)
            break
          }
        }
        break
      }
    }
  } catch (error) {
    libs.printInConsole(error)
  }
}

checkUpdate()

libs.electron.ipcMain.on('items', async(event: Electron.Event) => {
  try {
    if (config.sync.willSync) {
      const [, body] = await libs.requestAsync({
        url: `${config.sync.serverUrl}/items?key=${config.sync.key}`
      })
      history = JSON.parse(body)
      if (history.rawSources) {
        config.rawSources = history.rawSources
      }
    } else {
      try {
        localData = require(config.localFiles.historyPath)
        history = {
          isSuccess: true,
          items: localData.map(d => d.url)
        }
      } catch (error) {
        localData = []
        history = {
          isSuccess: true,
          items: []
        }
      }
    }

    if (!history.isSuccess) {
      libs.printInConsole(history.errorMessage)
      return
    }

    constructSources()

    const initialData: types.InitialData = {
      startval: config,
      schema,
      version: packageJson.version
    }
    event.sender.send('initialize', initialData)

    for (const source of sources) {
      await load(source, event)
    }
  } catch (error) {
    libs.printInConsole(error)
  }
})

libs.electron.app.on('ready', () => {
  mainWindow = new libs.electron.BrowserWindow({ width: 1200, height: 800 })
  mainWindow.loadURL(`file://${__dirname}/static/index.html`)
  mainWindow.on('closed', () => {
    mainWindow = undefined
  })
})
