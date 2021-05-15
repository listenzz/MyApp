import size from '../demention'

test('demention', () => {
  const { width, height } = size()
  expect(width).toBe(750)
  expect(height).toBe(1334)
})
