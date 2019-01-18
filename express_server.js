// server.js
// load the things we need

var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var ranNum;
//var usr = "noname";

//The body-parser library will allow us to access POST request parameters, such as req.body.longURL, which we will store in a variable called urlDatabase.
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


// set the view engine to ejs
app.set("view engine", "ejs");

//URL Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// User Database
const users = {
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


// function to generate a random number
var generateRandomString = function() {
    return Math.random().toString(36).split('').filter( function(value, index, self) {
        return self.indexOf(value) === index;
    }).join('').substr(2,6);
  //The javascript function ".toString()" does accept a parameter range from 2 to 36. Numbers from 2 to 10 represent: 0-9 values and 11 to 36 represent alphabets.
};

// our main page
app.get("/urls", (req, res) => {
  usr = res.cookie.user_id;
  let templateVars = { urls: urlDatabase, user:users[usr], user_id: req.cookies[ "user_id"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  usr = res.cookie.user_id;
  if(usr === undefined){
    res.redirect(302,"/login");
  }
  let templateVars = { urls: urlDatabase , user:users[usr], user_id: req.cookies["user_id"] };
  res.render("urls_new", templateVars);
});

//The order of route definitions matters! (added this before app.get("/urls/:id", ...) route definition.)

app.get("/urls/:id", (req, res) => {
  usr = res.cookie.user_id;
  let templateVars = { shortURL: req.params.id ,user:users[usr], urls: urlDatabase ,user_id: req.cookies[ "user_id"]};
  res.render("urls_show", templateVars);
});

app.get("/login", (req, res) => {
  usr = res.cookie.user_id;
  let templateVars = { shortURL: req.params.id ,user:users[usr], urls: urlDatabase ,user_id:req.cookies[ "user_id"]};
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  usr = res.cookie.user_id;
  let templateVars = { urls: urlDatabase , user:users[usr], user_id: req.cookies[ "user_id"],  };
  res.render("register", templateVars);
});

//We need to define the route that will match this POST request and handle it.
app.post("/urls", (req, res) => {
  //console.log(req.body.longURL);  // debug statement to see POST parameters
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  //this result is the work of the bodyParser.urlEncoded() middleware
  ranNum = generateRandomString();
  urlDatabase[ranNum] = req.body.longURL;
  //console.log(urlDatabase);
  //res.send(302); //Temporary moved
  res.redirect(302,"/u/" + ranNum);
});

//deleting one url
app.post("/urls/:id/delete", (req, res) => {
  var delurl = req.params.id;
  delete urlDatabase[delurl];
  console.log(urlDatabase);
  res.redirect(302,"/urls");
});

 //editing one url and add new long urlS
app.post("/urls/:id", (req, res) => {
var ed = req.params.id
urlDatabase[ed] =  req.body.updatedlongURL;
console.log(urlDatabase);
res.redirect(302,"/urls/"+ed);


});

//assigning long URL to the key (short url)

app.get("/u/:shortURL", (req, res) => {
  let short =  req.params.shortURL ;
  let longURL =  urlDatabase[short] ;
  res.redirect(longURL);
});


//User login function

app.post("/login", (req, res) => {
var email2 = req.body.email;
var password2 = req.body.password;

if (!email2 || !password2){
  res.redirect(400,"/urls/");
} else {
    for (RandomID in users){
      if (users[RandomID].email === email2){
        //console.log("You already have an account");
        if(users[RandomID].password !== password2){
          res.status(403).send('login or password incorrect');
          break;
        }else{
          res.cookie('user_id', email2);
          res.redirect(302,"/urls/");
        }

        // res.send(400,'You already have an account');
        // res.redirect(400,"/urls/");
      }else{
         res.status(403).send('login or password incorrect');
      }
    }

  }
});


// logout endpoint

app.post("/logout", (req, res) => {
res.clearCookie('user_id');
res.redirect(302,"/urls/");

});




//Registration Handler
app.post("/register", (req, res) => {
let userID = generateRandomString();
let email = req.body.email;
let password = req.body.password;
// res.cookie('username', userID);

if (!email || !password){
  res.redirect(400,"/urls/");
} else {
    for (RandomID in users){
      if (users[RandomID].email === email){
        //console.log("You already have an account");
        res.status(400).send('You already have an account');
        // res.send(400,'You already have an account');
        // res.redirect(400,"/urls/");
        break;
      }
    }
  res.cookie('user_id', email);
  users[userID] = {id: userID, email: email, password: password}
  console.log(users);
  res.redirect(302,"/urls/");
  return;
}

});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


