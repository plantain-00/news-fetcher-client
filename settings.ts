import * as types from "./types";

export let key: string;

export const serverUrl = "https://news.yorkyao.xyz";

const kickAssTorrentBaseUrl = "https://kat.cr";

export const sources: types.Source[] = [
    {
        name: "zhihu explore",
        url: "https://www.zhihu.com/explore/recommendations",
        selector: ".question_link",
        getItem: (cheerio: Cheerio, $: CheerioStatic) => {
            return {
                href: "https://www.zhihu.com" + cheerio.attr("href"),
                title: cheerio.text(),
            };
        },
    },
    {
        name: "v2ex hot",
        url: "https://v2ex.com/?tab=hot",
        selector: ".item_title > a",
        getItem: (cheerio: Cheerio, $: CheerioStatic) => {
            const count = cheerio.parent().parent().next().find("a").text();
            return {
                href: "https://v2ex.com" + cheerio.attr("href").split("#")[0],
                title: cheerio.text() + " / " + count,
            };
        },
    },
    {
        name: "cnbeta",
        url: "http://www.cnbeta.com",
        selector: ".title > a",
        getItem: (cheerio: Cheerio, $: CheerioStatic) => {
            const array = cheerio.parent().parent().next().next().find("em");
            const count = $(array[0]).text();
            return {
                href: "http://www.cnbeta.com" + cheerio.attr("href"),
                title: cheerio.text() + " / " + count,
            };
        },
    },
    {
        name: "github trending",
        url: "https://github.com/trending",
        selector: ".repo-list-name > a",
        getItem: (cheerio: Cheerio, $: CheerioStatic) => {
            return {
                href: "https://github.com" + cheerio.attr("href"),
                title: cheerio.text() + " : " + cheerio.parent().next().text(),
            };
        },
    },
    {
        name: "xart",
        url: "http://www.xart.com/videos",
        selector: ".show-for-touch > .cover > img",
        getItem: (cheerio: Cheerio, $: CheerioStatic) => {
            const detail = cheerio.attr("data-interchange").split(",")[0].substring(1);
            const name = $(cheerio.parent().next().find("h1")[0]).text();
            return {
                href: `${kickAssTorrentBaseUrl}/usearch/${name}`,
                title: name,
                detail: detail,
            };
        },
    },
    {
        name: "hacker news",
        url: "https://news.ycombinator.com/",
        selector: ".athing > .title > a",
        getItem: (cheerio: Cheerio, $: CheerioStatic) => {
            const array = cheerio.parentsUntil("tr").next().find(".subtext > a");
            const a = array[array.length - 1];
            return {
                href: cheerio.attr("href"),
                title: cheerio.text(),
                detail: "https://news.ycombinator.com/" + $(a).attr("href"),
            };
        },
    },
    {
        name: "cnode",
        url: "https://cnodejs.org/?tab=all",
        selector: ".topic_title",
        getItem: (cheerio: Cheerio, $: CheerioStatic) => {
            const replyCount = cheerio.parent().prevUntil("span").find(".count_of_replies").text();
            const title = cheerio.text();
            return {
                href: "https://cnodejs.org" + cheerio.attr("href"),
                title: replyCount ? `${title} / ${replyCount}` : title,
            };
        },
    },
    {
        name: "kickass torrent",
        url: `${kickAssTorrentBaseUrl}/full`,
        selector: ".filmType > a",
        getItem: (cheerio: Cheerio, $: CheerioStatic) => {
            return {
                href: kickAssTorrentBaseUrl + cheerio.attr("href"),
                title: cheerio.text(),
            };
        },
    },
    {
        name: "eztv",
        url: "https://eztv.ag",
        selector: ".epinfo",
        getItem: (cheerio: Cheerio, $: CheerioStatic) => {
            return {
                href: "https://eztv.ag" + cheerio.attr("href"),
                title: cheerio.text(),
            };
        },
    },
    {
        name: "czech massage",
        url: `${kickAssTorrentBaseUrl}/usearch/czech%20massage/?field=time_add&sorder=desc`,
        selector: ".filmType > a",
        getItem: (cheerio: Cheerio, $: CheerioStatic) => {
            return {
                href: kickAssTorrentBaseUrl + cheerio.attr("href"),
                title: cheerio.text(),
            };
        },
    },
];

const milestones = [
    { name: "typescript", url: "https://github.com/microsoft/typescript/milestones" },
    { name: "angular", url: "https://github.com/angular/angular/milestones" },
    { name: "react", url: "https://github.com/facebook/react/milestones" },
    { name: "vuejs", url: "https://github.com/vuejs/vue/milestones" },
    { name: "corefx", url: "https://github.com/dotnet/corefx/milestones" },
    { name: "coreclr", url: "https://github.com/dotnet/coreclr/milestones" },
    { name: "aspnet MVC", url: "https://github.com/aspnet/Mvc/milestones" },
    { name: "nodejs", url: "https://github.com/nodejs/node/milestones" },
    { name: "expressjs", url: "https://github.com/expressjs/express/milestones" },
    { name: "bootstrap", url: "https://github.com/twbs/bootstrap/milestones" },
];
for (const milestone of milestones) {
    sources.push({
        name: `${milestone.name} milestone`,
        url: milestone.url,
        selector: ".milestone-title-link > a",
        getItem: (cheerio: Cheerio, $: CheerioStatic) => {
            const progress = cheerio.parent().parent().next().find(".progress-percent").text();
            return {
                href: "https://github.com" + cheerio.attr("href"),
                title: cheerio.text() + " - " + progress,
            };
        },
    });
}

try {
    const secret = require("./secret");
    secret.load();
} catch (error) {
    console.log(error);
}
