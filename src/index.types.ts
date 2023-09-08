export interface Serverless {
  service: {
    app: string;
    service: string;
    custom?: {
      'serverless-aws-secrets': ServerlessSecretOptions;
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

export interface ServerlessSecretOptions {
  /** @dev Environment variables with values that start with this prefix are treated as secrets */
  secretPrefix?: string;

  /** @dev Secret to search for within AWS Secrets Manager */
  secretId?: string;
}
