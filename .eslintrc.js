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
  ],
}
