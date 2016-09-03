#### from backend to frontend

##### items: give the news data

```ts
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

```ts
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

```ts
void
```

##### hide: hide a url

```ts
string
```

##### reload: reload a source

```ts
string
```

##### saveConfiguration: save configuration command

```ts
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

#### error: show error

```ts
{
    message: string;
}
```

#### from backend to server

common parameter:

```ts
{
    key: string;
}
```

##### GET /items: get history

```ts
{
    isSuccess: boolean;
    items?: string[];
    errorMessage?: string;
    rawSources?: {
        name: string;
        url: string;
        selector?: string;
        getItem?: string;
        limit?: number;
        isMilestone?: boolean;
        disabled?: boolean;
    }[];
    sourceVersion?: number;
}
```

##### POST /items: record history

Content-Type: application/json or application/x-www-form-urlencoded

```ts
{
    url: string;
}
```

```ts
{
    isSuccess: boolean;
    errorMessage?: string;
}
```

##### POST /logs: submit logs

Content-Type: multipart/form-data

##### POST /sources: submit raw sources

Content-Type: application/json or application/x-www-form-urlencoded

```ts
{
    rawSources: {
        name: string;
        url: string;
        selector?: string;
        getItem?: string;
        limit?: number;
        isMilestone?: boolean;
        disabled?: boolean;
    }[];
}
```
