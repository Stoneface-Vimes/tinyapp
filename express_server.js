const express = require('express');
const generateRandomString = require("./randomStringGenerator")
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
app.use(cookieSession({
  name: 'session',
  secret: 'correcthorsebatterystaple'
}))
const bodyParser = require("body-parser")
const PORT = 8080; // default port of 8080, redirects to 8000 in vagrant
const getUserByEmail = require("./getUserByEmail")

app.use(bodyParser.urlencoded({ extended: true }))
app.set("view engine", "ejs");

const urlsForUser = function (id) { //Takes a given user id and returns an array with every url that has that userID as a value
  const urlIDs = Object.keys(urlDatabase);
  const userURLs = [];
  for (let element of urlIDs) {
    if (urlDatabase[element].userID === id) {
      userURLs.push([element, urlDatabase[element].longURL]);
    }
  }
  return userURLs;
};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xk": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};
const hashedPassword1 = bcrypt.hashSync('123', 10)
const hashedPassword2 = bcrypt.hashSync('123', 10)
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: hashedPassword1
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: hashedPassword2
  }
};


/*
------------GETS----------------
*/

app.get('/login', (req, res) => {
  res.render("login")

});

app.get('/register', (req, res) => {
  res.render("register")
});

//If user is logged in, renders the page for creating a new tiny url
//if user is not logged in, redirects them to the login page
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    templateVars = { user: req.session.user_id }
  }
  res.render("urls_new", templateVars);
})
//If the user is logged in, displays the urls page with a table of their
//tinyurls, long urls as well as an edit and delete button
//if the user is not logged in displays the catch-all "Login Page"
app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    url = urlsForUser(req.session.user_id.id);
    console.log(url)
    const templateVars = {
      user: req.session.user_id,
      urls: url
    };
    res.render("urls_index", templateVars);
  } else {
    const templateVars = {
      user: null,
      urls: undefined
    }
    res.render("urls_index", templateVars);
  }
});
//Parses anything after the /u/ as a shortURL and redirects to the value that url has stored in
//The urlDatabase varible. If it's undefined a message is sent stating the URL is invalid
app.get(`/u/:shortURL`, (req, res) => {
  let red = req.params.shortURL
  if (urlDatabase[red]) {
    res.redirect(urlDatabase[red].longURL);
  } else {
    res.send("Invalid URL, you will be redirected when I implement it or when you hit the back arrow.")
  }
});

/*
------------------POSTS-----------------
*/

//Generates a random string to use as the user ID. Checks if the email or password are empty strings and returns the relevant message
//Checks if the given email exists already and if so returns the relevant method
//If the username and password pass those checks, a new user is added to the users database (password is hashed).
//After adding the new user, sets the cookie data to the users id and redirects the client to /urls
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;
  if (email === "" || password === "") {
    res.send("Status Code 400\nInvalid email or password")
    return;
  }
  if (getUserByEmail(email, users)) {
    res.send("Status Code 400\nEmail already in use")
    return;
  }
  const hashedPassword = bcrypt.hashSync(password, 10)
  users[id] = {
    id: id,
    email: email,
    password: hashedPassword
  }
  req.session.user_id = users[id];
  res.redirect("/urls");
});
// Logs the user out by clearing their cookie data from their res object
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect("/urls")
});
//Logs the user in by creating and sending them cookie data based on their login name
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  let potentialID = getUserByEmail(email, users)
  //Checks if the potential ID is defined (as getUserByEmail returns a value of undefined if no emails match the passed email)
  if (potentialID) {
    //checks the client password input against the stored password, on a true value sets the users cookie data and redirects
    if (bcrypt.compareSync(password, users[potentialID].password)) {
      req.session.user_id = users[potentialID];
      //res.cookie('user_id', req.session.user_id)
      res.redirect('/urls');

    } else { //Normally this error code would be more ambigious as this can give the client information they may not know already
      res.send('Error Code 403 Password does not match')
    }

  } else { ///Normally this error code would be more ambigious as this can give the client information they may not know already
    res.send('Error Code 403 Email is not registered')
  }
});
//Handles updating a long url value to a new user defined value,
//then returns the user back to the /urls page
app.post("/urls/:shortURL", (req, res) => {
  let placeholder = req.params['shortURL'];
  urlDatabase[placeholder].longURL = req.body['newLongURL'];
  res.redirect("/urls")
});
//Handles deleting a shortURL key/value pair from the URL database
//then redirects the user to the /urls page
app.post("/urls/:shortURL/delete", (req, res) => {
  const placeholder = req.params.shortURL;
  //Checks if the client is logged in, if they are not this will be false
  if (req.session.user_id) {
    //checks if the client user id matches the stored user id, if not sends the appropriate message
    if (req.session.user_id.id === urlDatabase[placeholder].userID) {
      const destroy = req.params.shortURL;
      delete urlDatabase[destroy];
      res.redirect("/urls");
    } else {
      res.send("You don't own this url, stop being sneaky.")
    }
  } else {
    res.send("Only owners of tinyURLs are allowed to delete said URLs.")
  }

});
//Handles generating a new shortURL key. The key is added to urlDatabase
//with it's value defined by the client.
app.post("/urls", (req, res) => {
  shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.newLongURL,
    userID: req.session.user_id.id
  }
  res.redirect(`urls/${shortURL}`)
});

//Checks the user defined router parameter against the urlDatabase and returns the relevant value
//Since anything following the : will be taken as an route parameter, needs to be the last route checked
//when working with 'urls/'
app.get("/urls/:shortURL", (req, res) => {
  const placeholder = req.params.shortURL;
  //Renders urls_show to display the "logged out" view
  if (req.session.user_id === undefined) {
    res.render("urls_show", {user: null});
  } else if (urlDatabase[placeholder] === undefined) {
    res.send("The requested tinyURL does not exist")
    //IF the client user id does not match the userID attached to the tinyURL, passes vars that make urls_show display the 'theif' view
  } else if (urlDatabase[placeholder].userID !== req.session.user_id.id) {
    res.render("urls_show", {user: 'thief'});
    //If the client user id matches the userID attached to the tinyURL, passes tempplatevars that make urls_show display the "default" view
  } else if (urlDatabase[placeholder].userID === req.session.user_id.id) {
    let templateVars = {
      user: req.session.user_id,
      shortURL: placeholder,
      longURL: urlDatabase[placeholder].longURL
    }
    console.log("session ID = stored ID")
    res.render("urls_show", templateVars);
  }
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Sending a response with html, that will be displayed as html in browser
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
})