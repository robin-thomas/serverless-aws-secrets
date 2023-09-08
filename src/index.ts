import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

import type { Serverless, ServerlessSecretHooks, ServerlessSecretOptions } from './index.types';

export default class ServerlessAWSSecret {
  private readonly hooks: ServerlessSecretHooks;
  private readonly prefix: string;
  private readonly providerCopy: Serverless['service']['provider'];
  private readonly region: string;
  private readonly secretId: string;

  constructor(serverless: Serverless, options: ServerlessSecretOptions) {
    const { app, service, provider } = serverless.service;
    this.secretId = `${provider.stage}/${app}-${service}`;

    this.prefix = options?.prefix ?? 'secret:';

    this.region = provider.region;
    this.providerCopy = provider;

    this.hooks = {
      'before:package:initialize': () => this.loadSecrets(),
      'offline:start:init': () => this.loadSecrets(),
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
      if (value?.startsWith(this.prefix)) {
        const secretKey = value.replace(this.prefix, '');

        if (!secrets[secretKey]) {
          throw new Error(`Secret ${secretKey} do not exist`);
        }

        this.providerCopy.environment[key] = secrets[secretKey];
      }
    }
  }
}
