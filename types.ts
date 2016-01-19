/// <reference path="./typings/tsd.d.ts" />

export interface Item {
    href: string;
    title: string;
    detail?: string;
    hidden?: boolean;
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

export const events = {
    items: "items",
    hide: "hide",
    reload: "reload",
};
