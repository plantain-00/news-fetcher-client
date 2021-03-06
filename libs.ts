import electron = require('electron')
export { electron }

import * as http from 'http'

import request from 'request'

export interface Asset {
  browser_download_url: string;
  name: string;
  size: number;
}

export function printInConsole(message: unknown) {
  console.log(message)
}

export function downloadThenOpen(asset: Asset) {
  const result = tmp.dirSync()
  const filePath = path.resolve(result.name, asset.name)

  const readableStream = request(asset.browser_download_url)
  let downloadedSize = 0
  readableStream.on('data', data => {
    downloadedSize += data.length
    const percent = Math.round(downloadedSize * 100.0 / asset.size)
    printInConsole(`${percent}% ${downloadedSize} / ${asset.size}`)
  })

  const writableStream = fs.createWriteStream(filePath)
  writableStream.on('finish', () => {
    childProcess.execFile(filePath)
  })

  readableStream.pipe(writableStream)
}

export function requestAsync<T = string>(options: request.Options) {
  return new Promise<[http.IncomingMessage, T]>((resolve, reject) => {
    options.headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36'
    }
    options.timeout = 10000
    options.gzip = true
    request(options, (error: Error | null, response, body: T) => {
      if (error) {
        reject(error)
      } else {
        resolve([response, body])
      }
    })
  })
}

import cheerio from 'cheerio'
export { cheerio }

import * as fs from 'fs'
export { fs }

import * as path from 'path'
export { path }

import { __awaiter } from 'tslib'
export { __awaiter }

import * as semver from 'semver'
export { semver }

import * as tmp from 'tmp'
export { tmp }

import * as childProcess from 'child_process'
