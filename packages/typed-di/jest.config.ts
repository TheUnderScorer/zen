/* eslint-disable */

export default {
  displayName: 'typed-di',
  preset: 'ts-jest/presets/default-esm',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json', useESM: true }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|uuid|moti|tamagui|@tamagui?/.*|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|emittery|@sentry/.*|native-base|react-native-svg)'
  ],
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  testEnvironment: 'node',
  coverageDirectory: '../../coverage/typed-di',
  testEnvironmentOptions: {}
};
