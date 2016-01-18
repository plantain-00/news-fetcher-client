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

gulp.task("pack-osx", shell.task(`rm -rf dist/news-darwin-x64 && electron-packager . "news" --out=dist --platform=darwin --arch=x64 --version=0.36.1 --package="(node_modules/gulp*|node_modules/tslint|node_modules/typescript|*.ts|*.tsx)"`));

gulp.task("pack-win", shell.task(`rm -rf dist && electron-packager . "news" --out=dist --platform=win32 --arch=x64 --version=0.36.1 --package="(node_modules/gulp*|node_modules/tslint|node_modules/typescript|*.ts|*.tsx)"`));
