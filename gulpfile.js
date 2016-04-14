"use strict";

const gulp = require("gulp");
const shell = require("gulp-shell");
const tslint = require("gulp-tslint");

gulp.task("tslint", () => {
    return gulp.src(["scripts/**/*.tsx", "*.ts"])
        .pipe(tslint({
            tslint: require("tslint")
        }))
        .pipe(tslint.report("prose", { emitError: true }));
});

const version = "--version=0.36.1";
const ignore = `--ignore="node_modules/(gulp|gulp-shell|gulp-tslint|tslint|typescript)"`;
const appVersion = `--app-version="1.0.4"`;
const arch = "--arch=x64";
const out = "--out=dist";
const command = `electron-packager . "news" ${out} ${arch} ${version} ${ignore} ${appVersion}`;
const osx = `${command} --platform=darwin`;
const win = `${command} --platform=win32`;

gulp.task("pack-osx", shell.task(`rm -rf dist/news-darwin-x64 && ${osx}`));

gulp.task("pack-win", shell.task(`rm -rf dist/news-win32-x64 && ${win}`));
