import App from './app/App'
import Blank from './app/Blank'
import { ReactRegistry, Garden, Navigator } from 'react-native-navigation-hybrid'
import * as Sentry from '@sentry/react-native'
import {
  ENVIRONMENT,
  APPLICATION_ID,
  VERSION_NAME,
  VERSION_CODE,
  COMMIT_SHORT_SHA,
  CI,
} from './app/AppInfo'

// 配置 Sentry
if (CI) {
  // 只有通过 CI 打的包，才集成 Sentry
  Sentry.init({
    dsn: 'https://2d17bb1ffde34fec963d29b4c3a29f99@sentry.io/1446147',
    enableAutoSessionTracking: true,
    environment: ENVIRONMENT,
    release: `${APPLICATION_ID}@${VERSION_NAME}+${VERSION_CODE}`,
    dist: `${VERSION_CODE}`,
  })

  Sentry.setTag('commit', COMMIT_SHORT_SHA)
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
