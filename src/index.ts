import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

import type { Serverless, ServerlessSecretHooks, ServerlessSecretOptions } from './index.types';

class ServerlessAWSSecret {
  hooks: ServerlessSecretHooks;
  options: ServerlessSecretOptions;
  providerCopy: Serverless['service']['provider'];
  region: string;

  constructor(serverless: Serverless) {
    this.setOptions(serverless);

    const { provider } = serverless.service;
    this.region = provider.region;
    this.providerCopy = provider;

    this.hooks = {
      'before:package:initialize': this.loadSecrets.bind(this),
      'offline:start:init': this.loadSecrets.bind(this),
    };
  }

  async loadSecrets() {
    const client = new SecretsManagerClient({ region: this.region });
    const command = new GetSecretValueCommand({ SecretId: this.options.secretId });

    const { SecretString } = await client.send(command);

    if (!SecretString) {
      throw new Error(`Failed to retrieve the secret: ${this.options.secretId}`);
    }

    const secrets = JSON.parse(SecretString);

    for (const [key, value] of Object.entries(this.providerCopy.environment)) {
      if (value?.startsWith(this.options.secretPrefix!)) {
        const secretKey = value.replace(this.options.secretPrefix!, '');

        if (!secrets[secretKey]) {
          throw new Error(`Secret ${secretKey} do not exist`);
        }

        this.providerCopy.environment[key] = secrets[secretKey];
      }
    }
  }

  setOptions(serverless: Serverless) {
    this.options = serverless.service.custom?.['serverless-aws-secrets'] ?? {};

    this.options.secretId = this.getSecretId(serverless);
    this.options.secretPrefix = this.getSecretPrefix();
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
