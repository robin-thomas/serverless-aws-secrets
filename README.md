<p align="center">
  <h2 align="center">Serverless AWS Secrets</h2>
  <p align="center">A Serverless Plugin for the <a href="https://www.serverless.com">Serverless Framework</a>, which can replace environment variables with secrets from AWS Secrets Manager.</p>
</p>

<p align="center">
  <img src="https://img.shields.io/npm/l/serverless-aws-secrets" />
  <img src="https://img.shields.io/npm/dt/serverless-aws-secrets.svg?label=Downloads" />
  <img src="https://img.shields.io/bundlephobia/min/serverless-aws-secrets/latest" />
  <a href="https://github.com/robin-thomas/serverless-aws-secrets/actions">
    <img src="https://github.com/robin-thomas/serverless-aws-secrets/actions/workflows/post_release.yml/badge.svg" />
  </a>
  <a href="https://codecov.io/gh/robin-thomas/serverless-aws-secrets">
    <img src="https://codecov.io/gh/robin-thomas/serverless-aws-secrets/graph/badge.svg?token=I3FAWZETH9)" />
  </a>
</p>

Rather than storing secrets in your `.env.*` file in your GitHub repo, you can instead store them in AWS Secrets Manager. This plugin will then replace the environment variables (that are already loaded into Serverless framework) with the secrets from AWS Secrets Manager.

For example, assume there are environment variables in your `.env.*` file like:

```
MYSQL_USERNAME=secret:MYSQL_USERNAME
MYSQL_PASSWORD=secret:MYSQL_PASSWORD
```

The plugin will then search within AWS Secrets Manager (refer to `secretId` configuration) for a secret with the name `MYSQL_USERNAME` and `MYSQL_PASSWORD` and replace the environment variables with the secret value.

Secrets are recognized as environment variables whose name started with a pre-defined prefix. (refer to `secretPrefix` configuration below).

### Installation

Run below command to install the plugin:

```
$ npm install --save-dev serverless-aws-secrets
```

Add the plugin to `serverless.yml`:

```
plugins:
  - serverless-aws-secrets
```

### Configuration

The plugin can be configured by:

```
custom:
  serverless-aws-secrets:
    secretId: ...
    secretPrefix: ...
    verbose: ...
```

* `secretId`: Location of the secret in AWS Secrets Manager. Default: `${provider.stage}/${app}-${service}`

* `secretPrefix`: Prefix of the secret name in AWS Secrets Manager. Default: `secret:`

* `verbose`: Enable verbose logging. Default: `false`
