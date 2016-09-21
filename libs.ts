import * as electron from "electron";
export { electron };

import * as http from "http";

import * as request from "request";

export function requestAsync(options: request.Options) {
    return new Promise<[http.IncomingMessage, any]>((resolve, reject) => {
        options.headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36",
        };
        options.timeout = 10000;
        options.gzip = true;
        request(options, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                resolve([response, body]);
            }
        });
    });
}

import * as cheerio from "cheerio";
export { cheerio };

import * as fs from "fs";
export { fs };

import * as path from "path";
export { path };

import { __awaiter } from "tslib";
export { __awaiter };
