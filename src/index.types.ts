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
      environment?: {
        [key: string]: string;
      };
    };
  };
  classes?: {
    Error: ErrorConstructor;
  };
}

export interface ServerlessCliOptions {
  verbose?: boolean;
}

export interface ServerlessSecretHooks {
  [key: string]: () => void;
}

export interface ServerlessOptions {
  log?: {
    verbose: (message: string) => void;
    success: (message: string) => void;
  };
}

export interface ServerlessSecretOptions {
  /**
   * @dev Environment variables with values that start with this prefix are treated as secrets
   * @default "SECRET:"
   */
  secretPrefix?: string;

  /**
   * @dev Secret to search for within AWS Secrets Manager
   * @default `${stage}/${app}-${service}`
   */
  secretId?: string;
}
