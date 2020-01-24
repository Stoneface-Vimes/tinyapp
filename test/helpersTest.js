const { assert } = require('chai');
//The below line breaks the script when I put getUserByEmail in {}, which is odd since that's
//how it's given to us. the test crashes and says it's not a function. Assert works fine though
const getUserByEmail = require("../getUserByEmail")

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};
console.log(getUserByEmail)
describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert(user === expectedOutput, 'The user equals the expected output')
  });
  it('should return undefined when there is no matching email in the database', function(){
    const user = undefined;
    const expectedOutput = getUserByEmail("user@example.commmmm", testUsers)
    assert(user === expectedOutput, 'They should both read undefined as neither are in the database')
  });
});
