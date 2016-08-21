export type Item = {
    href: string;
    title: string;
    detail?: string;
    hidden?: boolean;
}

export const events = {
    /**
     * 前端准备好后，通过这个事件发送给后端，要求开始爬取数据
     * 后端请求到数据后，通过这个事件发送给前端，传输的数据是`types.News`类型
     */
    items: "items",
    /**
     * 前端点击hide按钮后，通过这个事件发送给后端，传输的数据是`string`类型
     */
    hide: "hide",
    /**
     * 前端点击reload按钮后，通过这个事件发送给后端，传输的数据是`string`类型
     */
    reload: "reload",
    /**
     * 后端初始化数据，通过这个事件发送给前端，传输的数据是配置的初始数据和json schema
     */
    initialize: "initialize",
    /**
     * 前端点击保存配置按钮后，通过这个事件发送给后端，传输的数据是配置的数据
     */
    saveConfiguration: "saveConfiguration",
};

export type RawSource = {
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
};
