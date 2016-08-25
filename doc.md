#### from backend to frontend

##### items: give the news data

```
{
    name: string,
    source: string,
    items?: {
        href: string;
        title: string;
        detail?: string;
        hidden?: boolean;
    }[],
    error?: string
}
```

##### initialize: give initial data

```
{
    schema: any,
    startval: {
        sync: {
            key: string;
            serverUrl: string;
            willSync: boolean;
        };
        rawSources: {
            name: string;
            url: string;
            selector?: string;
            getItem?: string;
            limit?: number;
            isMilestone?: boolean;
            disabled?: boolean;
        }[];
        localFiles: {
            historyPath: string;
            configurationPath: string;
        };
    }
}
```

#### from frontend to backend

##### items: ready to show items

```
void
```

##### hide: hide a url

```
string
```

##### reload: reload a source

```
string
```

##### saveConfiguration: save configuration command

```
{
    sync: {
        key: string;
        serverUrl: string;
        willSync: boolean;
    };
    rawSources: {
        name: string;
        url: string;
        selector?: string;
        getItem?: string;
        limit?: number;
        isMilestone?: boolean;
        disabled?: boolean;
    }[];
    localFiles: {
        historyPath: string;
        configurationPath: string;
    };
}
```

#### from backend to server
