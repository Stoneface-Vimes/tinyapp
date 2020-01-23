const getUserByEmail = function (check, database) {
  for (element in database) {
    if (database[element].email === check) {
      return element;
    }
  }
}

module.exports = getUserByEmail