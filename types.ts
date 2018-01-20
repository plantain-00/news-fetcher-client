export type NewsItem = {
  href: string;
  title: string;
  detail?: string;
  hidden?: boolean;
}

export type NewsCategory = {
  name: string;
  source: string;
  items?: NewsItem[];
  error?: string;
  key?: string;
}

export type InitialData = {
  schema: any,
  startval: ConfigData,
  version: string;
}

export type RawSource = {
  name: string;
  url: string;
  selector?: string;
  getItem?: string;
  limit?: number;
  isMilestone?: boolean;
  disabled?: boolean;
}

export type ConfigData = {
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
}

export type ErrorMessage = {
  message: string;
}
