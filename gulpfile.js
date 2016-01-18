"use strict";

let gulp = require("gulp");
let shell = require("gulp-shell");
let tslint = require("gulp-tslint");

gulp.task("tslint", () => {
    return gulp.src(["scripts/**/*.tsx", "*.ts"])
        .pipe(tslint({
            tslint: require("tslint")
        }))
        .pipe(tslint.report("prose", { emitError: true }));
});

let version = "--version=0.36.1";
let ignore = `--ignore="node_modules/(gulp|gulp-shell|gulp-tslint|tslint|typescript)"`;
let appVersion = `--app-version="1.0.0"`;
let arch = "--arch=x64";
let out = "--out=dist";
let command = `electron-packager . "news" ${out} ${arch} ${version} ${ignore} ${appVersion}`;
let osx = `${command} --platform=darwin`;
let win = `${command} --platform=win32`;

gulp.task("pack-osx", shell.task(`rm -rf dist/news-darwin-x64 && ${osx}`));

gulp.task("pack-win", shell.task(`rm -rf dist/news-win32-x64 && ${win}`));
