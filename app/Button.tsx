import React, { Component } from 'react'
import { Text, TouchableOpacity, StyleSheet, Linking } from 'react-native'

interface Props {
  onPress?: () => void
  label: string
  url?: string
  primary?: boolean
}

class Button extends Component<Props> {
  static defaultProps = {
    primary: true,
  }

  constructor(props: Props) {
    super(props)
  }

  onPressHandler = () => {
    const { onPress, url } = this.props
    if (url) {
      Linking.openURL(url)
    }
    onPress && onPress()
  }

  render() {
    const { buttonStyle, textStyle } = styles
    const { label, primary } = this.props

    const newButtonStyle = primary
      ? buttonStyle
      : [buttonStyle, { backgroundColor: '#f34541', borderBottomColor: '#a43532' }]

    return (
      <TouchableOpacity onPress={this.onPressHandler} style={newButtonStyle} testID="touchable">
        <Text testID="text" style={textStyle}>
          {label}
        </Text>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  textStyle: {
    alignSelf: 'center',
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  buttonStyle: {
    height: 45,
    alignSelf: 'stretch',
    justifyContent: 'center',
    backgroundColor: '#38ba7d',
    borderBottomWidth: 6,
    borderBottomColor: '#1e6343',
    borderWidth: 1,
    marginLeft: 15,
    marginRight: 15,
  },
})

export default Button
