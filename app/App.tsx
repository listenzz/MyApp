import React, { Component } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import * as Sentry from '@sentry/react-native'
import { Navigator, NavigationItem } from 'react-native-navigation-hybrid'
import { ENVIRONMENT, VERSION_NAME, VERSION_CODE } from './AppInfo'
import CodePush from 'react-native-code-push'

interface Props {}
interface State {
  version: string
}
export default class App extends Component<Props, State> {
  static navigationItem: NavigationItem = {
    rightBarButtonItem: {
      icon: Image.resolveAssetSource(require('./images/ic_settings.png')),
      action: (navigator: Navigator) => {
        navigator.push('Black')
      },
    },
  }

  constructor(props: Props) {
    super(props)
    this.sentryNativeCrash = this.sentryNativeCrash.bind(this)
    this.jsCrash = this.jsCrash.bind(this)
    this.throw = this.throw.bind(this)
    this.reject = this.reject.bind(this)
    this.state = {
      version: `${VERSION_NAME} - ${VERSION_CODE}`,
    }
  }

  componentDidMount() {
    CodePush.getUpdateMetadata()
      .then(update => {
        if (update) {
          this.setState({
            version: `${update.appVersion}-codepush:${update.label}`,
          })
        }
      })
      .catch(e => {
        Sentry.captureException(e)
      })
  }

  componentDidAppear() {
    CodePush.allowRestart()
  }

  componentDidDisappear() {
    CodePush.disallowRestart()
  }

  sentryNativeCrash() {
    Sentry.nativeCrash()
  }

  jsCrash() {
    const array = ['x', 'y', 'z', 'a']
    const a = array[5].length + 5
    console.log(`${Number(a) + 1}`)
  }

  async throw() {
    throw new Error('主动抛出异常 123')
  }

  async reject() {
    Promise.reject(new Error('promise 被拒绝了哈'))
  }

  render() {
    return (
      <View style={[styles.container]}>
        <Text style={styles.welcome}>
          环境: {`${ENVIRONMENT}`} 版本: {this.state.version}
        </Text>
        <Text style={styles.welcome}>按下一个按钮，让 APP 崩溃!</Text>

        <TouchableOpacity
          onPress={this.sentryNativeCrash}
          activeOpacity={0.2}
          style={styles.button}>
          <Text style={styles.buttonText}>Sentry native crash</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={this.jsCrash} activeOpacity={0.2} style={styles.button}>
          <Text style={styles.buttonText}>数组越界</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={this.throw} activeOpacity={0.2} style={styles.button}>
          <Text style={styles.buttonText}>主动抛出异常</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={this.reject} activeOpacity={0.2} style={styles.button}>
          <Text style={styles.buttonText}>promise reject</Text>
        </TouchableOpacity>
      </View>
    )
  }
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
