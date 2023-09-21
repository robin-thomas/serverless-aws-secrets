import type {
  Serverless,
  ServerlessSecretCommands,
  ServerlessSecretHooks,
  ServerlessSecretOptions,
  ServerlessOptions,
  ServerlessCliOptions,
  ServerlessSecretObject,
} from './index.types';
import { getSecret } from './aws/secret';

class ServerlessAWSSecret {
  Error: ErrorConstructor;
  commands: ServerlessSecretCommands;
  hooks: ServerlessSecretHooks;
  log: NonNullable<ServerlessOptions['log']>;
  options: ServerlessSecretOptions;
  serverless: Serverless;

  constructor(serverless: Serverless, cliOptions: ServerlessCliOptions, options: ServerlessOptions) {
    this.setOptions(serverless);
    this.setLogger(options, cliOptions);

    this.serverless = serverless;
    this.Error = serverless.classes?.Error ?? Error;

    this.commands = {
      'aws-secrets': {
        lifecycleEvents: ['load'],
      },
    };

    this.hooks = {
      'before:package:initialize': this.loadSecrets.bind(this),
      'offline:start:init': this.loadSecrets.bind(this),
      'aws-secrets:load': this.loadSecrets.bind(this, true),
    };
  }

  async loadSecrets(cli = false) {
    const secrets = await getSecret(this.options.secretId!, this.serverless.service.provider.region, this.log.verbose);

    let replacedCount = 0;
    replacedCount += this.replaceSecrets(secrets, replacedCount, this.serverless.service.provider?.environment, cli);

    this.log.success(`[serverless-aws-secrets]: Replaced ${replacedCount} secrets in environment variables`);
  }

  replaceSecrets(
    secrets: ServerlessSecretObject,
    replacedCount: number,
    environment?: ServerlessSecretObject,
    cli?: boolean,
  ) {
    if (!environment) {
      return replacedCount;
    }

    for (const [key, value] of Object.entries(environment)) {
      if (value?.startsWith(this.options.secretPrefix!)) {
        const secretKey = value.replace(this.options.secretPrefix!, '');

        if (cli) {
          if (!secrets[secretKey]) {
            this.log.warning(`[serverless-aws-secrets]: Secret ${secretKey} do not exist`);
          } else {
            this.log.success(`[serverless-aws-secrets]: Secret: ${key}, Value: ${secrets[secretKey]}`);
          }
        } else {
          if (!secrets[secretKey]) {
            throw new this.Error(`Secret ${secretKey} do not exist`);
          }

          this.log.verbose(`[serverless-aws-secrets]: Replacing ${key} with secret of ${secretKey}`);
        }

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
      warning: options?.log?.warning ?? console.warn,
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
