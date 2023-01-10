import React, { useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import * as Sentry from '@sentry/react-native'
import { Navigator, withNavigationItem } from 'hybrid-navigation'
import { ENVIRONMENT, VERSION_NAME, VERSION_CODE, COMMIT_SHORT_SHA } from './AppInfo'
import { useCodePush } from './useCodePush'
import Logger, { upload, prune } from './log'

const Log = Logger.extend('App')

export default withNavigationItem({
  rightBarButtonItem: {
    icon: Image.resolveAssetSource(require('./images/ic_settings.png')),
    action: (navigator: Navigator) => {
      navigator.push('Blank')
    },
  },
})(App)

function App() {
  useCodePush()

  useEffect(() => {
    prune()
  }, [])

  const version = `${VERSION_NAME}-${VERSION_CODE}`

  function sentryNativeCrash() {
    Sentry.nativeCrash()
  }

  function jsCrash() {
    const array = ['x', 'y', 'z', 'a']
    const a = array[9].length + 8
    Log.i(`${Number(a) + 1}`)
  }

  function throwError() {
    throw new Error('主动抛出异常')
  }

  function reject() {
    Promise.reject(new Error('promise 被拒绝了'))
  }

  async function log() {
    Log.i('打印日志', { a: 1, b: 2, c: 3 })
    try {
      await upload()
    } catch (e) {
      Log.e(e)
    }
  }

  return (
    <View style={[styles.container]}>
      <Text style={styles.welcome}>
        环境: {`${ENVIRONMENT}`} 版本: {version} commit: {COMMIT_SHORT_SHA}
      </Text>
      <Text style={styles.welcome}>按下一个按钮，让 APP 崩溃!</Text>

      <TouchableOpacity onPress={sentryNativeCrash} activeOpacity={0.2} style={styles.button}>
        <Text style={styles.buttonText}>Sentry native crash</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={jsCrash} activeOpacity={0.2} style={styles.button}>
        <Text style={styles.buttonText}>数组越界</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={throwError} activeOpacity={0.2} style={styles.button}>
        <Text style={styles.buttonText}>主动抛出异常</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={reject} activeOpacity={0.2} style={styles.button}>
        <Text style={styles.buttonText}>promise reject</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={log} activeOpacity={0.2} style={styles.button}>
        <Text style={styles.buttonText}>上传日志</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingTop: 16,
  },
  welcome: {
    backgroundColor: 'transparent',
    fontSize: 17,
    textAlign: 'center',
    margin: 8,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },

  buttonText: {
    backgroundColor: 'transparent',
    color: 'rgb(34,88,220)',
  },
})
