/**
 * @format
 */
import React from 'react'
import App from '../App'
import { shallow } from 'react-native-testing-library'

it('renders correctly', () => {
  const { output } = shallow(<App />)
  expect(output).toMatchSnapshot()
})
