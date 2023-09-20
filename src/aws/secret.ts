import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export const getSecret = async (secretId: string, region: string): Promise<string> => {
  const client = new SecretsManagerClient({ region });
  const command = new GetSecretValueCommand({ SecretId: secretId });

  const { SecretString } = await client.send(command);
  if (!SecretString) {
    throw new Error(`Failed to retrieve the secret: ${secretId}`);
  }

  return SecretString;
};
