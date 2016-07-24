export interface Item {
    href: string;
    title: string;
    detail?: string;
    hidden?: boolean;
}

export interface News {
    name: string;
    source: string;
    items: Item[];
    error: string | null;
    key: string;
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

export interface Source {
    name: string;
    url: string;
    selector: string;
    getItem: (cheerio: Cheerio, $: CheerioStatic) => Item;
}
