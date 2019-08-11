export interface NewsItem {
  href: string;
  title: string;
  detail?: string;
  hidden?: boolean;
}

export interface NewsCategory {
  name: string;
  source: string;
  items?: NewsItem[];
  error?: string;
  key?: string;
}

export interface InitialData {
  schema: any,
  startval: ConfigData,
  version: string;
}

export interface RawSource {
  name: string;
  url: string;
  selector?: string;
  getItem?: string;
  limit?: number;
  isMilestone?: boolean;
  disabled?: boolean;
}

export interface ConfigData {
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

export interface ErrorMessage {
  message: string;
}
