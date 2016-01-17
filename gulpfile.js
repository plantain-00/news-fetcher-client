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

gulp.task("pack-osx", shell.task(`rm -rf dist && electron-packager . "news" --out=dist --platform=darwin --arch=x64 --version=0.36.1 --icon=./news.ico`));

gulp.task("build-osx", shell.task(`electron-builder "dist/news.app" --platform=osx --out="dist" --config=builder.json`));
