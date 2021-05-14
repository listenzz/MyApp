module.exports = {
  root: true,
  extends: ['@react-native-community', 'plugin:prettier/recommended', 'prettier/react'],
  overrides: [
    {
      files: ['jest/*'],
      env: {
        jest: true,
      },
    },
    {
      files: ['app/**/*'],
      rules: {
        'no-console': 2,
      },
    },
  ],
  rules: {
    'no-shadow': 0,
    'no-bitwise': 0,
    'react-native/no-inline-styles': 0,
  },
}
