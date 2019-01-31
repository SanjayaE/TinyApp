
/* **********Global variables*********** */

const express = require('express');

const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');

const cookieSession = require('cookie-session');

const bcrypt = require('bcrypt');

let usr;

/* **********Env Setup*********** */

/* The body-parser library will allow us to access POST request parameters,
such as req.body.longURL, which we will store in a variable called urlDatabase. */

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['key-1'],
}));

// URL Database
const urlDatabase = {
  b2xVn2: {
    url: 'http://www.lighthouselabs.ca',
    userID: 'userRandomID',
  },
  '9sm5xK': {
    url: 'http://www.google.com',
    userID: 'user2RandomID',
  },
};


// User Database
const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

// function to generate a random number
const generateRandomString = function () {
  return Math.random().toString(36).split('').filter((value, index, self) => self.indexOf(value) === index)
    .join('')
    .substr(2, 6);
  /* The javascript function ".toString()" does accept a parameter range from 2 to 36.
  Numbers from 2 to 10 represent: 0-9 values and 11 to 36 represent alphabets. */
};

/* function to return a subset of the URL database that belongs to the user with ID */

function urlsForUser(newUserId) {
  const userWithId = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === newUserId && urlDatabase[url].url) {
      userWithId[url] = urlDatabase[url];
    }
  }
  return userWithId;
}

/* **********Get request responses*********** */


// our main page
app.get('/urls', (req, res) => {
  const newUserId = req.session.newUserId;
  const urls = urlsForUser(newUserId);
  if (newUserId) {
    const templateVars = { urls, newUserId };
    res.render('urls_index', templateVars);
  } else {
    const newUserId = null;
    const err = "You are not allowed here, please login or register!";
    const templateVars = { newUserId, err };
    res.render('urls_index', templateVars);


  // res.status(403).send('You are not allowed here, please login or register');
  }
});

app.get('/urls/new', (req, res) => {
  const newUserId = req.session.newUserId;
  const urls = urlsForUser(newUserId);
  if (newUserId) {
    const templateVars = { urls, user: usr, newUserId };
    res.render('urls_new', templateVars);
  } else {
    res.redirect(302, '/login');
  }
});

// The order of route definitions matters! (added this before app.get("/urls/:id", ...) route definition.)


app.get('/login', (req, res) => {
  const templateVars = {
    shortURL: req.params.id, user: usr, urls: urlDatabase, newUserId: req.session.newUserId,
  };
  res.render('login', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = { urls: urlDatabase, user: usr, newUserId: req.session.newUserId };
  res.render('register', templateVars);
});

// assigning long URL to the key (short url)

app.get('/u/:shortURL', (req, res) => {
  const short = req.params.shortURL;
  if(!urlDatabase[short]) {
    res.sendStatus(404); /*if short url is not on the DB, this will prevent Cannot read property 'url' of undefined error. */
  }else{
    const longURL = urlDatabase[short].url;
    res.redirect(longURL);
  }
});

app.get('/urls/:id', (req, res) => {
  const newUserId = req.session.newUserId;
  const shortUrlId = req.params.id;
  if (urlDatabase[shortUrlId].userID === newUserId) {
    const urls = urlsForUser(newUserId);
    const templateVars = {
    shortURL: req.params.id, user: usr, longUrl: urls[req.params.id].url, urls: urls, newUserId: req.session.newUserId,
  };
    res.render('urls_show', templateVars);
  } else if (newUserId){
    res.redirect(401, '/urls/');

  } else {
    const newUserId = null;
    const err = "You are not allowed here, please login or register!";
    const templateVars = { newUserId, err };
    res.render('urls_show', templateVars);
  }
});

/* **********Post request responses*********** */


// We need to define the route that will match this POST request and handle it.
app.post('/urls', (req, res) => {
  const newUserId = req.session.newUserId;
  const urls = urlsForUser(newUserId);
  const longURL = req.body.longURL;
  const ranNum = generateRandomString();
  if (newUserId) {
    urlDatabase[ranNum] = { url: longURL, userID: newUserId };
    res.redirect(302, `/urls/${ranNum}`);
  } else {
    res.redirect(302, '/login');
  }
});

// deleting one url
app.post('/urls/:id/delete', (req, res) => {
  const newUserId = req.session.newUserId;
  const urls = urlsForUser(newUserId);
  if (urlDatabase[newUserId].userID === newUserId) {
    const urlDelete = req.params.id;
    delete urlDatabase[urlDelete];
    const templateVars = {
      urls, user: usr, shortURL: shortUrlId, newUserId,
    };
    res.render('urls_index', templateVars);
  } else {
    res.redirect(302, '/login');
  }
});

// editing one url and add new long urlS
app.post('/urls/:id', (req, res) => {
  const shortUrlId = req.params.id;
  const newUserId = req.session.newUserId;
  const urls = urlsForUser(newUserId);
  if (urlDatabase[shortUrlId].userID === newUserId) {
    const templateVars = {
      urls, user: usr, shortURL: shortUrlId, newUserId, longUrl: req.body.updatedlongURL
    };
    res.render('urls_show', templateVars);
  } else {
    res.redirect(302, '/login');
  }

  urlDatabase[shortUrlId].url = req.body.updatedlongURL;
  res.redirect(302, `/urls/${shortUrlId}`);
});

// User login function

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.redirect(400, '/urls/');
  } else {
    for (const RandomID in users) {
      const isValidPassword = bcrypt.compareSync(password, users[RandomID].password);
      if (users[RandomID].email === email && isValidPassword) {
        req.session.newUserId = email;
        res.redirect(302, '/urls/');
        return;
      }
    }
    res.status(403).send('login or password incorrect');
  }
});


// logout endpoint

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect(302, '/urls/');
});


// Registration Handler
app.post('/register', (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  let password = req.body.password;
  //password = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    res.redirect(400, '/urls/');
  } else {
    for (let RandomID in users) {
      if (users[RandomID].email === email) {
        res.status(400).send('You already have an account');
        break;
      }
    }
    req.session.newUserId = email;
    users[userID] = { id: userID, email: email, password :bcrypt.hashSync(password, 10) };
    res.redirect(302, '/urls/');
  }
});


app.listen(PORT, () => {
  console.log(`tinyapp listening on port ${PORT}!`);
});
