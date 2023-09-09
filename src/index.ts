import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

import type { Serverless, ServerlessSecretHooks, ServerlessSecretOptions } from './index.types';

class ServerlessAWSSecret {
  private readonly hooks: ServerlessSecretHooks;
  readonly options: ServerlessSecretOptions;
  private readonly providerCopy: Serverless['service']['provider'];
  private readonly region: string;
  private readonly secretId: string;
  private readonly secretPrefix: string;

  constructor(serverless: Serverless) {
    const { custom, provider } = serverless.service;
    this.options = custom?.['serverless-aws-secrets'] ?? {};

    this.secretId = this.getSecretId(serverless);
    this.secretPrefix = this.getSecretPrefix();

    this.region = provider.region;
    this.providerCopy = provider;

    this.hooks = {
      'before:package:initialize': this.loadSecrets.bind(this),
      'offline:start:init': this.loadSecrets.bind(this),
    };
  }

  async loadSecrets() {
    const client = new SecretsManagerClient({ region: this.region });
    const command = new GetSecretValueCommand({ SecretId: this.secretId });

    const { SecretString } = await client.send(command);

    if (!SecretString) {
      throw new Error(`Failed to retrieve the secret: ${this.secretId}`);
    }

    const secrets = JSON.parse(SecretString);

    for (const [key, value] of Object.entries(this.providerCopy.environment)) {
      if (value?.startsWith(this.secretPrefix)) {
        const secretKey = value.replace(this.secretPrefix, '');

        if (!secrets[secretKey]) {
          throw new Error(`Secret ${secretKey} do not exist`);
        }

        this.providerCopy.environment[key] = secrets[secretKey];
      }
    }
  }

  getSecretId(serverless: Serverless) {
    if (this.options?.secretId) {
      return this.options.secretId;
    }

    const { app, service, provider } = serverless.service;

    return `${provider.stage}/${app}-${service}`;
  }

  getSecretPrefix() {
    return this.options?.secretPrefix ?? 'SECRET:';
  }
}

export = ServerlessAWSSecret;
