import * as types from "./types";

export let key: string = process.env.NEWS_FETCHER_KEY;

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
    { name: "NativeScript", url: "https://github.com/NativeScript/NativeScript/milestones" },
    { name: "gogs", url: "https://github.com/gogits/gogs/milestones" },
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
