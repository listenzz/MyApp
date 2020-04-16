import App from './app/App'
import Blank from './app/Blank'
import { AppState } from 'react-native'
import { commit, version_code } from './app.json'
import { ReactRegistry, Garden, Navigator } from 'react-native-navigation-hybrid'
import * as Sentry from '@sentry/react-native'
import {
  APPLICATION_ID,
  ENVIRONMENT,
  BUILD_TYPE,
  BUILD_TYPE_RELEASE,
  VERSION_CODE,
  VERSION_NAME,
} from './app/AppInfo'
import CodePush from 'react-native-code-push'

if (BUILD_TYPE === BUILD_TYPE_RELEASE) {
  Sentry.init({
    dsn: 'https://2d17bb1ffde34fec963d29b4c3a29f99@sentry.io/1446147',
    environment: ENVIRONMENT,
    release: `${APPLICATION_ID}-${VERSION_NAME}`,
    dist: `${VERSION_CODE}`,
  })

  Sentry.setTag('commit', commit)
  Sentry.setRelease(`${APPLICATION_ID}-${VERSION_NAME}`)
  // 如果是热更新 version_code != VERSION_CODE
  Sentry.setDist(`${version_code}`)

  CodePush.getUpdateMetadata()
    .then(update => {
      if (update) {
        Sentry.setRelease(`${APPLICATION_ID}-${update.appVersion}-codepush:${update.label}`)
      }
    })
    .catch(e => {
      Sentry.captureException(e)
    })

  CodePush.sync({
    installMode: CodePush.InstallMode.IMMEDIATE,
  })

  AppState.addEventListener('change', async state => {
    if (state === 'active') {
      try {
        await CodePush.sync({
          installMode: CodePush.InstallMode.IMMEDIATE,
        })
      } catch (e) {
        // ignore
      }
    }
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
ReactRegistry.registerComponent('Blank', () => Blank)

// 重要必须
ReactRegistry.endRegisterComponent()

Navigator.setRoot({
  stack: {
    children: [{ screen: { moduleName: 'App' } }],
  },
})
