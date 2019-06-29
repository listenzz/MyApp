import App from './app/App'
import Black from './app/Black'
import { AppState } from 'react-native'
import { commit } from './app.json'
import { ReactRegistry, Garden, Navigator } from 'react-native-navigation-hybrid'
import { Sentry } from 'react-native-sentry'
import { ENVIRONMENT, BUILD_TYPE, BUILD_TYPE_RELEASE, VERSION_NAME, VERSION_CODE, APPLICATION_ID } from './app/AppInfo'
import CodePush from 'react-native-code-push'

if (BUILD_TYPE === BUILD_TYPE_RELEASE) {
  Sentry.config('https://2d17bb1ffde34fec963d29b4c3a29f99@sentry.io/1446147').install()
  Sentry.setTagsContext({
    environment: ENVIRONMENT,
    commit: commit,
  })

  CodePush.getUpdateMetadata()
    .then(update => {
      if (update) {
        Sentry.setVersion(update.appVersion + '-codepush:' + update.label)
      }
    })
    .catch(e => {
      Sentry.captureException(e)
    })

  CodePush.sync({
    installMode: CodePush.InstallMode.IMMEDIATE,
  })

  AppState.addEventListener('change', state => {
    state === 'active' &&
      CodePush.sync({
        installMode: CodePush.InstallMode.IMMEDIATE,
      })
  })
}

// 配置全局样式
Garden.setStyle({
  topBarStyle: 'dark-content',
})

// 重要必须
ReactRegistry.startRegisterComponent()

// 注意，你的每一个页面都需要注册
ReactRegistry.registerComponent('App', () => App)
ReactRegistry.registerComponent('Black', () => Black)

// 重要必须
ReactRegistry.endRegisterComponent()

Navigator.setRoot({
  stack: {
    children: [{ screen: { moduleName: 'App' } }],
  },
})
