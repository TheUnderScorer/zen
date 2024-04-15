/* eslint-disable */

import { JestConfigWithTsJest } from 'ts-jest';

export default {
  displayName: 'rpc-react',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s?(x)$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.spec.json' },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'html'],
  testEnvironment: 'jsdom',
  coverageDirectory: '../../coverage/rpc-react',
} satisfies JestConfigWithTsJest;
