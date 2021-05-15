module.exports = {
  root: true,
  extends: ['@react-native-community', 'plugin:prettier/recommended', 'prettier/react'],
  plugins: ['workspaces'],
  overrides: [
    {
      files: ['jest/*'],
      env: {
        jest: true,
      },
    },
    {
      files: ['app/**/*', 'packages/**/*'],
      rules: {
        'no-console': 2,
      },
    },
  ],
  rules: {
    'workspaces/no-relative-imports': 'error',
    'workspaces/require-dependency': 'error',
    'no-shadow': 0,
    'no-bitwise': 0,
    'react-native/no-inline-styles': 0,
  },
}
