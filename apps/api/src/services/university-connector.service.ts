export type ConnectorConfig = {
  baseUrl: string;
  authType: 'apiKey' | 'oauth';
  apiKey?: string;
  clientId?: string;
};

export const buildUniversityConnector = (config: ConnectorConfig) => ({
  config,
  fetchStudent: async (registrationNumber: string) => ({
    registrationNumber,
    status: 'verified',
    source: config.baseUrl,
  }),
});
