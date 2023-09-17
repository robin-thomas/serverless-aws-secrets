import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

import type {
  Serverless,
  ServerlessSecretHooks,
  ServerlessSecretOptions,
  ServerlessOptions,
  ServerlessCliOptions,
} from './index.types';

class ServerlessAWSSecret {
  Error: ErrorConstructor;
  hooks: ServerlessSecretHooks;
  log: NonNullable<ServerlessOptions['log']>;
  options: ServerlessSecretOptions;
  serverless: Serverless;

  constructor(serverless: Serverless, cliOptions: ServerlessCliOptions, options: ServerlessOptions) {
    this.setOptions(serverless);
    this.setLogger(options, cliOptions);

    this.serverless = serverless;
    this.Error = serverless.classes?.Error ?? Error;

    this.hooks = {
      'before:package:initialize': this.loadSecrets.bind(this),
      'offline:start:init': this.loadSecrets.bind(this),
    };
  }

  async loadSecrets() {
    const client = new SecretsManagerClient({ region: this.serverless.service.provider.region });
    const command = new GetSecretValueCommand({ SecretId: this.options.secretId });

    const { SecretString } = await client.send(command);

    if (!SecretString) {
      throw new this.Error(`Failed to retrieve the secret: ${this.options.secretId}`);
    }

    const secrets = JSON.parse(SecretString);

    let replaceCount = 0;
    for (const [key, value] of Object.entries(this.serverless.service.provider.environment)) {
      if (value?.startsWith(this.options.secretPrefix!)) {
        const secretKey = value.replace(this.options.secretPrefix!, '');

        if (!secrets[secretKey]) {
          throw new this.Error(`Secret ${secretKey} do not exist`);
        }

        this.log.verbose(`[serverless-aws-secrets]: Replacing ${key} with secret of ${secretKey}`);

        this.serverless.service.provider.environment[key] = secrets[secretKey];

        ++replaceCount;
      }
    }

    this.log.success(`[serverless-aws-secrets]: Replaced ${replaceCount} secrets in environment variables`);
  }

  setOptions(serverless: Serverless) {
    this.options = serverless.service.custom?.['serverless-aws-secrets'] ?? {};

    this.options.secretId = this.getSecretId(serverless);
    this.options.secretPrefix = this.getSecretPrefix();
  }

  setLogger(options?: ServerlessOptions, cliOptions?: ServerlessCliOptions) {
    this.log = {
      verbose: options?.log?.verbose ?? cliOptions?.verbose ? console.log : () => {},
      success: options?.log?.success ?? console.log,
    };
  }

  getSecretId(serverless: Serverless) {
    if (this.options?.secretId) {
      return this.options.secretId;
    }

    const { app, service, provider } = serverless.service;

    return `${provider.stage}/${app}-${service}`;
  }

  getSecretPrefix() {
    return this.options?.secretPrefix ?? 'secret:';
  }
}

export = ServerlessAWSSecret;
