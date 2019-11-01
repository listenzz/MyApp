import React, { Component } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import * as Sentry from '@sentry/react-native'
import { Navigator, NavigationItem } from 'react-native-navigation-hybrid'
import { ENVIRONMENT, VERSION_NAME, VERSION_CODE } from './AppInfo'
import CodePush from 'react-native-code-push'

interface Props {}
interface State {
  x: string
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
    this.captureMessage = this.captureMessage.bind(this)
    this.captureException = this.captureException.bind(this)
    this.captureBreadcrumb = this.captureBreadcrumb.bind(this)
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
    const a = array[4].length + 4
    console.log(`${Number(a) + 1}`)
  }

  throw() {
    throw new Error('something wrong!')
  }

  reject() {
    Promise.reject(new Error('promise reject'))
  }

  captureMessage() {
    Sentry.captureMessage('message to capture')
  }

  captureException() {
    try {
      throw new Error('error for capture!')
    } catch (e) {
      Sentry.captureException(e)
    }
  }
  captureBreadcrumb() {
    // type?: string;
    // level?: Severity;
    // event_id?: string;
    // category?: string;
    // message?: string;
    // data?: {
    //     [key: string]: any;
    // };
    // timestamp?: number;
    Sentry.addBreadcrumb({
      message: 'something bad happen.',
      level: Sentry.Severity.Warning,
      type: 'http',
    })
  }

  render() {
    return (
      <View style={[styles.container]}>
        <Text style={styles.welcome}>
          环境: {`${ENVIRONMENT}`} 版本: {`${VERSION_NAME} - ${VERSION_CODE}`}
        </Text>
        <Text style={styles.welcome}>按下一个按钮，让 APP 崩溃!</Text>

        <TouchableOpacity onPress={this.sentryNativeCrash} activeOpacity={0.2} style={styles.button}>
          <Text style={styles.buttonText}>Sentry native crash</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={this.jsCrash} activeOpacity={0.2} style={styles.button}>
          <Text style={styles.buttonText}>jsCrash</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={this.throw} activeOpacity={0.2} style={styles.button}>
          <Text style={styles.buttonText}>throw</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={this.reject} activeOpacity={0.2} style={styles.button}>
          <Text style={styles.buttonText}>promise reject</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={this.captureMessage} activeOpacity={0.2} style={styles.button}>
          <Text style={styles.buttonText}>captureMessage</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={this.captureException} activeOpacity={0.2} style={styles.button}>
          <Text style={styles.buttonText}>captureException</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={this.captureBreadcrumb} activeOpacity={0.2} style={styles.button}>
          <Text style={styles.buttonText}>captureBreadcrumb</Text>
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
