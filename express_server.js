// server.js
// load the things we need

var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
var ranNum;
var usr ;

//The body-parser library will allow us to access POST request parameters, such as req.body.longURL, which we will store in a variable called urlDatabase.
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
// set the view engine to ejs
app.set("view engine", "ejs");

//URL Database
const urlDatabase = {
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    url: "http://www.google.com",
    userID: "user2RandomID"
  }
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

/* **********Get request responses*********** */


// our main page
app.get("/urls", (req, res) => {
  usr = req.cookies.user_id;
  if(usr !== undefined){
  let templateVars = { urls: urlDatabase, user:usr, user_id: req.cookies[ "user_id"] };
  res.render("urls_index", templateVars);

  }else{
     res.redirect(302,"/login");
  }

});

app.get("/urls/new", (req, res) => {
  let user_id = req.cookies.user_id;
  let urls = urlsForUser(user_id);
  if(usr !== undefined){
    let templateVars = { urls: urls , user:usr, user_id: req.cookies["user_id"] };
    res.render("urls_new", templateVars);

  }else{
     res.redirect(302,"/login");
  }

});

//The order of route definitions matters! (added this before app.get("/urls/:id", ...) route definition.)

app.get("/urls/:id", (req, res) => {
  let user_id = req.cookies.user_id;
  let templateVars = { shortURL: req.params.id , user:usr, urls: urlDatabase ,user_id: req.cookies[ "user_id"]};
  if(user_id){
    res.render("urls_show", templateVars);

  }else{
     res.redirect(302,"/login");
  }
});

app.get("/login", (req, res) => {
  let templateVars = { shortURL: req.params.id ,user:usr, urls: urlDatabase , user_id:req.cookies[ "user_id"]};
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = { urls: urlDatabase , user:usr, user_id: req.cookies[ "user_id"],  };
  res.render("register", templateVars);
});

//assigning long URL to the key (short url)

app.get("/u/:shortURL", (req, res) => {
  let short =  req.params.shortURL ;
  let longURL =  urlDatabase[short] ;
  res.redirect(longURL);
});


/* **********Post request responses*********** */



//We need to define the route that will match this POST request and handle it.
app.post("/urls", (req, res) => {
  //console.log(req.body.longURL);  // debug statement to see POST parameters
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  //this result is the work of the bodyParser.urlEncoded() middleware

   let user_id = req.cookies.user_id;
   let urls = urlsForUser(user_id);
   let longURL = req.body.longURL;
   let ranNum = generateRandomString();
   if(user_id){
    urlDatabase[ranNum] = { url : longURL , userID :user_id };
    res.redirect(302,"/urls/" + ranNum);
   } else{
     res.redirect(302,"/login");
   }

});

//deleting one url
app.post("/urls/:id/delete", (req, res) => {
  usr = req.cookies.user_id;
  if(usr !== undefined){
    var delurl = req.params.id;
    delete urlDatabase[delurl];
  let templateVars = { urls: urlDatabase, user:usr, user_id: req.cookies[ "user_id"] };
  res.render("urls_index", templateVars);

  }else{
     res.redirect(302,"/login");
  }
});

 //editing one url and add new long urlS
app.post("/urls/:id", (req, res) => {
 let ed = req.params.id
 let userId = req.cookies.user_id;
 if(urlDatabase[ed].userID === userId){

    res.render("urls_show", templateVars);

  }else{
     res.redirect(302,"/login");
  }

urlDatabase[ed].url =  req.body.updatedlongURL;
//console.log(urlDatabase);
res.redirect(302,"/urls/"+ed);


});

//User login function

app.post("/login", (req, res) => {
var email2 = req.body.email;
var password2 = req.body.password;
// bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword);


if (!email2 || !password2){
  res.redirect(400,"/urls/");
} else {
  //console.log(RandomID, users)
   for (let RandomID in users){
    // bcrypt.compareSync(password, users[user].password))
    let true1 = bcrypt.compareSync(password2,users[RandomID].password);
      if (users[RandomID].email === email2 && true1) {
        //console.log("You already have an account");
          res.cookie('user_id', email2);
          res.redirect(302,"/urls/");
          return;
      }
    }
    //console.log("You already have an ??");
    res.status(403).send('login or password incorrect');

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
password = bcrypt.hashSync(password, 10);
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
  console.log(`tinyapp listening on port ${PORT}!`);
});


//ALL is fine

//ubset of the URL database that belongs to the user with ID

function urlsForUser(user_id) {
  let userWithId = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === user_id) {
      userWithId[url] = urlDatabase[url];
    }
  }
  return userWithId;
}