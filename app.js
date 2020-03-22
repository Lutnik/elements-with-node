const express = require('express');
// const validator = require('express-validator');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const breadcrumbs = require('express-breadcrumbs');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const expressSession = require('express-session');

const app = express();
const port = 3000;

const User = require('./models/user');

const elementsRoutes = require('./routes/elements');
const commentsRoutes = require('./routes/comments');
const authRoutes = require('./routes/index');
const userPage = require('./routes/user');

// DATABASE CONFIG AND CONNECT
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect('mongodb://localhost/elements', {
  socketTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  keepAlive: true,
})
  .catch((err) => console.error(err));
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connection to the database established');
});

// PASSPORT CONFIG
app.use(expressSession({
  secret: 'Najtajniejsze hasło na świecie',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// APP SETTINGS
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(breadcrumbs.init());
app.use('/', breadcrumbs.setHome({
  name: 'Home',
  url: '/',
}));
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.currentPage = req.originalUrl;
  next();
});

// ROUTES
app.use('/elements', elementsRoutes);
app.use('/elements/:id', commentsRoutes);
app.use(userPage);
app.use(authRoutes);

app.listen(port, () => console.log(`Server is running on port ${port}`));
