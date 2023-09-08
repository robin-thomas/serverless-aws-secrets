export interface Serverless {
  service: {
    app: string;
    service: string;
    provider: {
      stage: string;
      region: string;
      environment: {
        [key: string]: string;
      };
    };
  };
}

export interface ServerlessSecretOptions {
  prefix?: string;
}

export interface ServerlessSecretHooks {
  [key: string]: () => void;
}
