function generateRandomString() {
  let randomTiny = '';
  let possibleChars = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

  let count = 0;

  while (count < 6) {
    let possibleValue = possibleChars[Math.round(Math.random() * (possibleChars.length))]
    if (possibleValue !== undefined) {
      randomTiny += possibleValue;
      count++;
    }
  }

  return randomTiny;

}

module.exports = generateRandomString