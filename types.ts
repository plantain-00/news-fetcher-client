/// <reference path="./typings/tsd.d.ts" />

export interface Item {
    href: string;
    title: string;
}

export interface News {
    source: string;
    items: Item[];
}

export interface Self<T> {
    state?: T;
    setState?: (state: T, callback?: () => void) => void;
    replaceState?: (state: T, callback?: () => void) => void;
    isMounted?: () => boolean;
    componentDidMount?: () => void;
    componentWillUnmount?: () => void;
    getInitialState?: () => T;
    render: () => any;
}

export const sources = {
    v2ex_hot: "https://v2ex.com/?tab=hot",
    kickass_torrents: "https://kat.cr",
    eztv: "https://eztv.ag",
    cnbeta: "http://www.cnbeta.com",
    github_trending: "https://github.com/trending",
};

export const events = {
    items: "items"
};
