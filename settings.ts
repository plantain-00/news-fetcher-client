import * as types from "./types";

export let key: string;

export const serverUrl = "https://news.yorkyao.xyz";

const kickAssTorrentBaseUrl = "https://kat.cr";

export const sources: types.Source[] = [
    {
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
    "https://github.com/microsoft/typescript/milestones",
    "https://github.com/angular/angular/milestones",
    "https://github.com/facebook/react/milestones",
    "https://github.com/vuejs/vue/milestones",
    "https://github.com/dotnet/corefx/milestones",
    "https://github.com/dotnet/coreclr/milestones",
    "https://github.com/aspnet/Mvc/milestones",
    "https://github.com/nodejs/node/milestones",
    "https://github.com/expressjs/express/milestones",
];
for (const milestone of milestones) {
    sources.push({
        url: milestone,
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
