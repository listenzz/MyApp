import React from 'react'
import Button from '../Button'
import { render, shallow, fireEvent } from 'react-native-testing-library'

let mockOpenURL = jest.fn()
jest.mock('Linking', () => ({
  openURL: mockOpenURL,
}))

describe('Button', () => {
  describe('Rendering', () => {
    it('should match to snapshot - Primary', () => {
      const { output } = shallow(<Button label="test" primary />)
      expect(output).toMatchSnapshot('Primary button snapshot')
    })

    it('should match to snapshot - Secondary', () => {
      const { output } = shallow(<Button label="test" primary={false} />)
      expect(output).toMatchSnapshot('Secondary button snapshot')
    })

    it('should render a Text', () => {
      const { getByTestId } = render(<Button label="test" primary={false} />)
      const text = getByTestId('text')
      expect(text.props.children).toEqual('test')
    })
  })

  describe('Event Handling', () => {
    const mockOnPress = jest.fn()
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should call onPress', () => {
      const { getByTestId } = render(<Button label="test label" onPress={mockOnPress} />)
      fireEvent.press(getByTestId('touchable'))

      expect(mockOnPress).toHaveBeenCalled()
      expect(mockOnPress).toHaveBeenCalledTimes(1)
    })

    it('should call openURL if url is provided', () => {
      const { getByTestId } = render(<Button label="test label" url="https://www.test.com" />)
      fireEvent.press(getByTestId('touchable'))

      expect(mockOpenURL).toHaveBeenCalled()
      expect(mockOpenURL).toHaveBeenCalledTimes(1)
      expect(mockOpenURL).toHaveBeenCalledWith('https://www.test.com')
    })

    it('should not call openURL if url is nor provided', () => {
      const { getByTestId } = render(<Button label="test label" />)
      fireEvent.press(getByTestId('touchable'))

      expect(mockOpenURL).not.toHaveBeenCalled()
    })
  })
})
