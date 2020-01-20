function generateRandomString() {
  let randomTiny = '';
  let possibleChars = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

  for (let i = 0; i < 6; i++) {
    randomTiny += possibleChars[Math.round(Math.random() * (possibleChars.length))]
  }

  return randomTiny;

}

module.exports = generateRandomString