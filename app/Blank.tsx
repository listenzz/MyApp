import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { ENVIRONMENT, VERSION_NAME, VERSION_CODE } from './AppInfo'

export default function Blank() {
  return (
    <View style={[styles.container]}>
      <Text style={styles.welcome}>
        环境: {`${ENVIRONMENT}`} 版本: {`${VERSION_NAME} - ${VERSION_CODE}`}
      </Text>
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
