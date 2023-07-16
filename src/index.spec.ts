import nock from 'nock';

import ServerlesssAwsSecrets from './index';
import type { Serverless } from './index.types';

const getServerless = (): Serverless => ({
  service: {
    app: 'app',
    service: 'service',
    provider: { stage: 'stage', region: 'eu-west-1', environment: {} },
  },
});

describe('index.ts', () => {
  describe('default options are set', () => {
    test('secretId and secretPrefix are not set', () => {
      const serverless = getServerless();

      const plugin = new ServerlesssAwsSecrets(serverless);
      expect(plugin.getSecretId(serverless)).toBe('stage/app-service');
      expect(plugin.getSecretPrefix()).toBe('SECRET:');
    });

    test('secretPrefix is not set', () => {
      const serverless = getServerless();
      serverless.service.custom = { 'serverless-aws-secrets': { secretPrefix: 'PREFIX:' } };

      const plugin = new ServerlesssAwsSecrets(serverless);
      expect(plugin.getSecretId(serverless)).toBe('stage/app-service');
      expect(plugin.getSecretPrefix()).toBe('PREFIX:');
    });

    test('secretId is not set', () => {
      const serverless = getServerless();
      serverless.service.custom = { 'serverless-aws-secrets': { secretId: 'secretId' } };

      const plugin = new ServerlesssAwsSecrets(serverless);
      expect(plugin.getSecretId(serverless)).toBe('secretId');
      expect(plugin.getSecretPrefix()).toBe('SECRET:');
    });

    test('All options are not set', () => {
      const serverless = getServerless();
      serverless.service.custom = { 'serverless-aws-secrets': { secretId: 'secretId', secretPrefix: 'PREFIX:' } };

      const plugin = new ServerlesssAwsSecrets(serverless);
      expect(plugin.getSecretId(serverless)).toBe('secretId');
      expect(plugin.getSecretPrefix()).toBe('PREFIX:');
    });
  });

  describe('loading the secrets', () => {
    test('failed to connect to AWS', async () => {
      nock(/secretsmanager.eu-west-1.amazonaws.com/)
        .post('/')
        .reply(400);

      const plugin = new ServerlesssAwsSecrets(getServerless());
      await expect(plugin.loadSecrets()).rejects.toThrowError();
    });

    test('failed to find the secret', async () => {
      nock(/secretsmanager.eu-west-1.amazonaws.com/)
        .post('/')
        .reply(200);

      const plugin = new ServerlesssAwsSecrets(getServerless());
      await expect(plugin.loadSecrets()).rejects.toThrowError('Failed to retrieve the secret: stage/app-service');
    });

    test('found the secret, but secret key missing', async () => {
      const serverless = getServerless();
      serverless.service.provider.environment = { MYSQL_PASSWORD: 'SECRET:MYSQL_PASSWORD' };

      nock(/secretsmanager.eu-west-1.amazonaws.com/)
        .post('/')
        .reply(200, { SecretString: JSON.stringify({}) });

      const plugin = new ServerlesssAwsSecrets(serverless);
      await expect(plugin.loadSecrets()).rejects.toThrowError('Secret MYSQL_PASSWORD do not exist');
    });

    test('found the secret, secret key is present', async () => {
      const serverless = getServerless();
      serverless.service.provider.environment = { MYSQL_PASSWORD: 'SECRET:MYSQL_PASSWORD' };

      nock(/secretsmanager.eu-west-1.amazonaws.com/)
        .post('/')
        .reply(200, { SecretString: JSON.stringify({ MYSQL_PASSWORD: 'SECRET_MYSQL_PASSWORD' }) });

      const plugin = new ServerlesssAwsSecrets(serverless);

      await plugin.loadSecrets();
      expect(serverless.service.provider.environment.MYSQL_PASSWORD).toBe('SECRET_MYSQL_PASSWORD');
    });
  });
});
