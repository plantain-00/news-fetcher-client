import * as types from "./types";

export const config: types.ConfigData = {
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
        { name: "roslyn", url: "https://github.com/dotnet/roslyn/milestones", isMilestone: true },
        { name: "koa", url: "https://github.com/koajs/koa/milestones", isMilestone: true },
        { name: "rust", url: "https://github.com/rust-lang/rust/milestones", isMilestone: true },
    ],
    localFiles: {
        historyPath: "",
        configurationPath: "",
    },
};
