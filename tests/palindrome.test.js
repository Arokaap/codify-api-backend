const { palindrome } = require('../utils/for_testing')

test('Palindrome of midudev', () => {
  const result = palindrome('midudev')

  expect(result).toBe('vedudim')
})

test('Palindrome of empty string', () => {
  const result = palindrome('')

  expect(result).toBe('')
})

test('Palindrome of undefined', () => {
  const result = palindrome()

  expect(result).toBeUndefined()
})
