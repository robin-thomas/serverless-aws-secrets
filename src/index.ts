import type {
  Serverless,
  ServerlessSecretHooks,
  ServerlessSecretOptions,
  ServerlessOptions,
  ServerlessCliOptions,
} from './index.types';
import { getSecret } from './aws/secret';

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
    this.log.verbose(
      `[serverless-aws-secrets]: Loading secret: ${this.options.secretId} in ${this.serverless.service.provider.region}`,
    );

    const secretString = await getSecret(this.options.secretId!, this.serverless.service.provider.region);
    const secrets = JSON.parse(secretString);

    let replaceCount = 0;
    replaceCount += this.replaceSecrets(this.serverless.service.provider.environment, secrets);

    this.log.success(`[serverless-aws-secrets]: Replaced ${replaceCount} secrets in environment variables`);
  }

  replaceSecrets(environment: { [key: string]: string }, secrets: { [key: string]: string }, replacedCount = 0) {
    if (!environment) {
      return replacedCount;
    }

    for (const [key, value] of Object.entries(environment)) {
      if (value?.startsWith(this.options.secretPrefix!)) {
        const secretKey = value.replace(this.options.secretPrefix!, '');

        if (!secrets[secretKey]) {
          throw new this.Error(`Secret ${secretKey} do not exist`);
        }

        this.log.verbose(`[serverless-aws-secrets]: Replacing ${key} with secret of ${secretKey}`);

        environment[key] = secrets[secretKey];

        ++replacedCount;
      }
    }

    return replacedCount;
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
