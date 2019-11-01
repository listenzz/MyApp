module.exports = {
  dependencies: {
    'react-native-code-push': {
      platforms: {
        android: {
          packageInstance: 'new CodePush(BuildConfig.CODEPUSH_KEY, getApplicationContext(), BuildConfig.DEBUG)',
        },
      },
    },
  },
}
