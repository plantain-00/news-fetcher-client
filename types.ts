export type Item = {
    href: string;
    title: string;
    detail?: string;
    hidden?: boolean;
}

export const events = {
    items: "items",
    hide: "hide",
    reload: "reload",
    initialize: "initialize",
    saveConfiguration: "saveConfiguration",
};

type RawSource = {
    name: string;
    url: string;
    selector?: string;
    getItem?: string;
    limit?: number;
    isMilestone?: boolean;
    disabled?: boolean;
}

export type Config = {
    sync: {
        key: string;
        serverUrl: string;
        willSync: boolean;
    };
    rawSources: RawSource[];
    localFiles: {
        historyPath: string;
        configurationPath: string;
    };
};
