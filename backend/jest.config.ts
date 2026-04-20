import type { Config } from 'jest';
import { getJestProjectsAsync } from '@nx/jest';
import path from 'path';

const legacyLibs: Config = {
  displayName: 'libs-infra-providers',
  rootDir: 'libs',
  roots: ['<rootDir>/infra', '<rootDir>/providers'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: path.join(process.cwd(), 'coverage'),
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@healthflow/infra/(.*)$': '<rootDir>/infra/$1',
    '^@healthflow/infra$': '<rootDir>/infra/index.ts',
    '^@healthflow/providers/(.*)$': '<rootDir>/providers/src/$1',
    '^@healthflow/providers$': '<rootDir>/providers/src/index.ts',
    '^@healthflow/shared/(.*)$': '<rootDir>/modules/shared/src/$1',
    '^@healthflow/shared$': '<rootDir>/modules/shared/src/index.ts',
    '^@healthflow/auth/(.*)$': '<rootDir>/modules/auth/src/$1',
    '^@healthflow/auth$': '<rootDir>/modules/auth/src/index.ts',
    '^@healthflow/medical/(.*)$': '<rootDir>/modules/medical/src/$1',
    '^@healthflow/medical$': '<rootDir>/modules/medical/src/index.ts',
    '^@healthflow/analytics/(.*)$': '<rootDir>/modules/analytics/src/$1',
    '^@healthflow/analytics$': '<rootDir>/modules/analytics/src/index.ts',
  },
};

export default async (): Promise<Config> => ({
  projects: [legacyLibs, ...(await getJestProjectsAsync())],
});
