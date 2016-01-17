/// <reference path="typings/tsd.d.ts" />

import * as electron from "electron";
export {electron};

import * as http from "http";

import * as request from "request";

export function requestAsync(options: request.Options): Promise<{ response: http.IncomingMessage; body: any; }> {
    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                resolve({
                    response: response,
                    body: body,
                });
            }
        });
    });
}

import * as cheerio from "cheerio";
export {cheerio};
