import { Dimensions } from 'react-native'

export default function() {
  return { width: Dimensions.get('window').width, height: Dimensions.get('window').height }
}
