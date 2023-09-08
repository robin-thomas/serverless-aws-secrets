export interface Serverless {
  service: {
    app: string;
    service: string;
    custom: {
      'serverless-aws-secret': {
        prefix?: string;
        secretId?: string;
      };
    };
    provider: {
      stage: string;
      region: string;
      environment: {
        [key: string]: string;
      };
    };
  };
}

export interface ServerlessSecretHooks {
  [key: string]: () => void;
}
