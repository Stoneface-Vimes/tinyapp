const express = require('express');
const generateRandomString = require("./randomStringGenerator")
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser())
const bodyParser = require("body-parser")
const PORT = 8080; // default port of 8080, redirects to 8000 in vagrant

app.use(bodyParser.urlencoded({ extended: true }))
app.set("view engine", "ejs");

const urlsForUser = function(id) {
  const urlIDs = Object.keys(urlDatabase);
  const userURLs = [];
  for (let element of urlIDs) {
    if (urlDatabase[element].userID === id) {
      userURLs.push(urlDatabase[element].longURL);
    }
  }
  return userURLs;
};


const emailAlreadyExists = function(check) {
  for (element in users) {
    if (users[element].email === check) {
      return element;
    }
  }
}
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

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "123"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "123"
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

//Renders the page for creating a new tiny url
app.get("/urls/new", (req, res) => {
  //console.log(req.cookies['user_id'])
  if (req.cookies['user_id'] === undefined) {
    res.redirect("/login");
  } else {
    templateVars = { user: req.cookies['user_id'] }
  }
  //console.log("The template vars are: ", templateVars)
  res.render("urls_new", templateVars);
})

app.get("/urls", (req, res) => {

  if (req.cookies['user_id']) {

    urls = urlsForUser(req.cookies['user_id'].id);
    //console.log("Here are the urls in array format", urls)
    const templateVars = {
      user: req.cookies['user_id'],
      urls: urlDatabase
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
//The urlDatabase varible. If it's undefined an message is sent stating the URL is invalid
app.get(`/u/:shortURL`, (req, res) => {
  let red = req.params.shortURL
  if (urlDatabase[red]) {
    res.redirect(urlDatabase[red][longURL]);
  } else {
    res.send("Invalid URL, you will be redirected when I implement it or when you hit the back arrow.")
  }
});

/*
------------------POSTS-----------------
*/


app.post('/register', (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;
  if (email === "" || password === "") {
    res.send("Status Code 400\nInvalid email or password")
    return;
  }
  if (emailAlreadyExists(email)) {
    res.send("Status Code 400\nEmail already in use")
    return;
  }
  const user = {
    id: id,
    email: email,
    password: password
  }
  users[id] = {
    id: id,
    email: email,
    password: password
  }

  // console.log(user)
  res.cookie('user_id', user)
  // console.log(users);
  res.redirect("/urls");
});
// Logs the user out by clearing their cookie data from their res object
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls")
});
//Logs the user in by creating and sending them cookie data based on their login name
app.post("/login", (req, res) => {
  //Returns the ID of a given email if it exists and undefined if it does not
  const { email, password } = req.body;
  let potentialID = emailAlreadyExists(email)
  //console.log("PotentialID = ", users[potentialID])
  if (potentialID) {
    // console.log(`potentialID password = ${users[potentialID].password}`)
    // console.log(`given password = ${password}`)
    if (password === users[potentialID].password) {
      res.cookie('user_id', users[potentialID])
      res.redirect('/urls');

    } else {
      res.send('Error Code 403 Password does not match')
    }

  } else {
    res.send('Error Code 403 Email is not registered')
  }
});
//Handles updating a long url value to a new user defined value,
//then returns the user back to the /urls page
app.post("/urls/:shortURL/update", (req, res) => {
  // console.log(urlDatabase)
  let placeholder = req.params['shortURL'];
  urlDatabase[placeholder].longURL = req.body['newLongURL']; //append userID to left side of argument
  // console.log(urlDatabase)
  res.redirect("/urls")
});
//Handles deleting a shortURL key/value pair from the URL database
//then redirects the user to the /urls page
app.post("/urls/:shortURL/delete", (req, res) => {
  const destroy = req.params.shortURL;
  delete urlDatabase[destroy];
  res.redirect("/urls");
});
//Handles generating a new shortURL key. The key is added to urlDatabase
//with it's value defined by the client.
app.post("/urls", (req, res) => {
  shortURL = generateRandomString();
  console.log("This is the request body", req.body)
  console.log("This is the request cookies", req.cookies)
  urlDatabase[shortURL] = {
    longURL: req.body.newLongURL,
    userID: req.cookies.user_id.id
  } //
  console.log("This is the updated database", urlDatabase)
  res.redirect(`urls/${shortURL}`)
  app.get(`/urls/:shortURL`, (req, res) => {
    let placeholder = req.params.shortURL;
    let templateVars = {
      user: users[req.cookies['user_id']],
      shortURL: shortURL,
      longURL: urlDatabase[shortURL[longURL]]
    }
    res.render("urls_show", templateVars);
  });
});

//Checks the user defined router parameter against the urlDatabase and returns the relevant value
//Since anything following the : will be taken as an route parameter, needs to be the last route checked
//when working with 'urls/'
app.get("/urls/:shortURL", (req, res) => {

  const placeholder = req.params.shortURL;
  console.log(placeholder)

  let templateVars = {
    user: req.cookies['user_id'],
    shortURL: placeholder,
    longURL: urlDatabase[placeholder].longURL
  };
  res.render("urls_show", templateVars);
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