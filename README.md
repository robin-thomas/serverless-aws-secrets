# Serverless AWS Secrets

A Serverless Plugin for the [Serverless Framework](https://www.serverless.com/), which can replace environment variables with secrets from AWS Secrets Manager.

Secrets are recognized as environment variables whose name started with a pre-defined prefix. Refer to `secretPrefix` configuration below.

It will then try to download the secret from AWS Secrets Manager under the location set in `secretId`.

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
```

* `secretId`: Location of the secret in AWS Secrets Manager. Default: `${provider.stage}/${app}-${service}`

* `secretPrefix`: Prefix of the secret name in AWS Secrets Manager. Default: `SECRET:`
