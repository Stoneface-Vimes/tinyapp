const express = require('express');
const generateRandomString = require("./randomStringGenerator")
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser())
const bodyParser = require("body-parser")
const PORT = 8080; // default port of 8080, redirects to 8000 in vagrant

app.use(bodyParser.urlencoded({ extended: true }))
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};

//GETS

app.get("/urls/new", (req, res) => {
  templateVars = {username: req.cookies["username"]}
  res.render("urls_new", templateVars);
})

app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get(`/u/:shortURL`, (req, res) => {
  let red = req.params.shortURL
  // console.log(urlDatabase)
  // console.log(red)
  //console.log(red in urlDatabase);
  if (urlDatabase[red]) {
    //console.log(urlDatabase[red])
    res.redirect(urlDatabase[red]);
  } else {
    res.send("Invalid URL, you will be redirected when I implement it or when you hit the back arrow.")
  }
});

//POSTS

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls")
});

app.post("/login", (req, res) => {
  console.log(req.body.username);
  res.cookie('username', req.body.username)
  res.redirect('/urls');
});

app.post("/urls/:shortURL/update", (req, res) => {
  urlDatabase[req.params['shortURL']] = req.body['newLongURL'];
  res.redirect("/urls")
});

app.post("/urls/:shortURL/delete", (req, res) => {

  const destroy = req.params.shortURL;
  delete urlDatabase[destroy];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  //console.log(req.body); //Log the POST request body to the console
  shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`urls/${shortURL}`)
  app.get(`/urls/:shortURL`, (req, res) => {
    let templateVars = {
      username: req.cookies["username"],
      shortURL: shortURL,
      longURL: urlDatabase[shortURL]
    }
    res.render("urls_show", templateVars);
  });
});

//Checks the user defined router parameter against the urlDatabase and returns the relevant value
//Since anything following the : will be taken as an route parameter, needs to be the last route checked
//when working with 'urls/'
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
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