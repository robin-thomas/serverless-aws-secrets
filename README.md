# Serverless AWS Secrets

A Serverless Plugin for the [Serverless Framework](https://www.serverless.com/), which can replace environment variables with secrets from AWS Secrets Manager.

Secrets are recognized as environment variables whose name started with `SECRET:`.

It will then try to download the secret from AWS Secrets Manager under the location: `${provider.stage}/${app}-${service}`.

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
