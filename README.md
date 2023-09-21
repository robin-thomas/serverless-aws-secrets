<p align="center">
  <h2 align="center">Serverless AWS Secrets</h2>
  <p align="center">A Serverless Plugin for the <a href="https://www.serverless.com">Serverless Framework</a>, which can replace environment variables with secrets from AWS Secrets Manager.</p>
  <div align="center">
    <img src="https://s3.amazonaws.com/assets.github.serverless/readme-serverless-framework.gif" width="70%" />
  </div>
</p>

<p align="center">
  <a href="http://www.serverless.com">
    <img src="http://public.serverless.com/badges/v3.svg" />
  </a>
  <a href="https://www.npmjs.com/package/serverless-aws-secrets">
    <img src="https://img.shields.io/npm/v/serverless-aws-secrets" />
  </a>
  <img src="https://img.shields.io/npm/dt/serverless-aws-secrets.svg?label=Downloads" />
  <img src="https://img.shields.io/bundlephobia/min/serverless-aws-secrets/latest" />
  <a href="https://github.com/robin-thomas/serverless-aws-secrets/actions">
    <img src="https://github.com/robin-thomas/serverless-aws-secrets/actions/workflows/post_release.yml/badge.svg" />
  </a>
  <a href="https://codecov.io/gh/robin-thomas/serverless-aws-secrets">
    <img src="https://codecov.io/gh/robin-thomas/serverless-aws-secrets/graph/badge.svg?token=I3FAWZETH9)" />
  </a>
  <img src="https://img.shields.io/npm/l/serverless-aws-secrets" />
</p>

## Introduction

If you are using a serverless plugin like [Serverless Dotenv Plugin](https://github.com/neverendingqs/serverless-dotenv-plugin), then you shall be having `.env.*` files that looks like:

```
MYSQL_USERNAME=username
MYSQL_PASSWORD=password
```

Rather than storing these secrets in your `.env.*` file, you can instead store them in [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/). This plugin will then replace the environment variables (that are already loaded into Serverless framework) with the secrets from AWS Secrets Manager.

You need to change your above `.env.*` files to:

```
MYSQL_USERNAME=secret:MYSQL_USERNAME
MYSQL_PASSWORD=secret:MYSQL_PASSWORD
```

The plugin will then search within AWS Secrets Manager (refer to `secretId` configuration) for a secret with the name `MYSQL_USERNAME` and `MYSQL_PASSWORD` and replace the environment variables with the secret value.

Secrets are recognized as environment variables whose name started with a pre-defined prefix. (refer to `secretPrefix` configuration below).

## Getting Started

These instructions will help you integrate this plugin into your serverless service.

### Prerequisites

You need to have the below softwares running on your system:

* [Node.js v18](https://nodejs.org/en) - You can use [NVM](https://github.com/nvm-sh/nvm) to setup Node.js in your system
* [Git](https://git-scm.com/) - You can download from [here](https://git-scm.com/downloads)
* [Serverless](https://www.serverless.com/) - Refer [here](https://github.com/serverless/serverless/blob/main/docs/getting-started.md) on how to get started

### Installing the plugin

Run below command to install the plugin:

```
$ npm install --save-dev serverless-aws-secrets
```

Add the plugin to `serverless.yml`:

```
plugins:
  - serverless-aws-secrets
```

This will run the plugin during the below serverless hooks:
* `before:package:initialize`
* `offline:start:init`

### Configuring the plugin

The plugin can be configured by:

```
custom:
  serverless-aws-secrets:
    secretId: ...
    secretPrefix: ...
```

* `secretId`: Location of the secret in AWS Secrets Manager. Default: `${provider.stage}/${app}-${service}`

* `secretPrefix`: Prefix of the secret name in AWS Secrets Manager. Default: `secret:`

## CLI commands

This plugin also exposes a CLI command that can be used along with serverless.

### Display the secret values

```
$ sls aws-secrets --verbose
```

This will display the output:

```
[serverless-aws-secrets]: Running the command: sls aws-secrets
[serverless-aws-secrets]: Loading secret: {secretId} in {provider.region}
✔ [serverless-aws-secrets]: Secret: {secretKey}, Value: {secretValue}
```

## Local Development

These instructions will help you to run the project in your local.

### Setup

Run the below commands to setup the project:

```
$ git clone git@github.com:robin-thomas/serverless-aws-secrets.git
$ cd serverless-aws-secrets
$ nvm use 18
$ npm install
```

### Running the tests

You can run the unit tests written in [Jest](https://github.com/jestjs/jest) by running:

```
$ npm run test
```

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/robin-thomas/serverless-aws-secrets/tags).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
