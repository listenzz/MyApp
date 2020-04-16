import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import * as Sentry from '@sentry/react-native'
import {
  Navigator,
  withNavigationItem,
  useVisibleEffect,
  InjectedProps,
} from 'react-native-navigation-hybrid'
import { ENVIRONMENT, VERSION_NAME, VERSION_CODE } from './AppInfo'
import { version_name, version_code } from '../app.json'
import CodePush from 'react-native-code-push'

interface State {
  version: string
}

export default withNavigationItem({
  rightBarButtonItem: {
    icon: Image.resolveAssetSource(require('./images/ic_settings.png')),
    action: (navigator: Navigator) => {
      navigator.push('Blank')
    },
  },
})(App)

function App({ sceneId }: InjectedProps) {
  const [version, setVersion] = useState(
    `${version_name || VERSION_NAME}-${version_code || VERSION_CODE}`,
  )

  useEffect(() => {
    CodePush.getUpdateMetadata()
      .then(update => {
        if (update) {
          setVersion(
            `${update.appVersion}-codepush:${update.label}-${version_code || VERSION_CODE}`,
          )
        }
      })
      .catch(e => {
        Sentry.captureException(e)
      })
  }, [])

  useVisibleEffect(sceneId, () => {
    CodePush.allowRestart()
    return () => {
      CodePush.disallowRestart()
    }
  })

  function sentryNativeCrash() {
    Sentry.nativeCrash()
  }

  function jsCrash() {
    const array = ['x', 'y', 'z', 'a']
    const a = array[27].length + 5
    console.log(`${Number(a) + 1}`)
  }

  function throwError() {
    throw new Error('主动抛出异常 125')
  }

  function reject() {
    Promise.reject(new Error('promise 被拒绝了哈!!'))
  }

  return (
    <View style={[styles.container]}>
      <Text style={styles.welcome}>
        环境: {`${ENVIRONMENT}`} 版本: {version}
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
