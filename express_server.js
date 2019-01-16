// server.js
// load the things we need

var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
//The body-parser library will allow us to access POST request parameters, such as req.body.longURL, which we will store in a variable called urlDatabase.
app.use(bodyParser.urlencoded({extended: true}));

// set the view engine to ejs
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

var generateRandomString = function() {
    return Math.random().toString(36).split('').filter( function(value, index, self) {
        return self.indexOf(value) === index;
    }).join('').substr(2,6);
  //The javascript function ".toString()" does accept a parameter range from 2 to 36. Numbers from 2 to 10 represent: 0-9 values and 11 to 36 represent alphabets.

}


// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");


// hello_world page
app.get("/hello", (req, res) => {  // basically replacing the code above
  let templateVars = { greeting: 'Hello World!' };
  // use res.render to load up an ejs view file
  res.render("hello_world", templateVars);
});


app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_new");
});

//The order of route definitions matters! (added this before app.get("/urls/:id", ...) route definition.)

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id , urls: urlDatabase };
  res.render("urls_show", templateVars);
});

//We need to define the route that will match this POST request and handle it.
app.post("/urls", (req, res) => {
  console.log(req.body.longURL);  // debug statement to see POST parameters
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
  //this result is the work of the bodyParser.urlEncoded() middleware
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//console.log(generateRandomString());