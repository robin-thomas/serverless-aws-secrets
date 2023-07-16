import type { Config } from 'jest';

const config: Config = {
  rootDir: 'src',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageThreshold: {
    global: {
      branches: 99,
      statements: 99,
    },
  },
  testEnvironment: 'node',
  collectCoverage: true,
}

export default config;
