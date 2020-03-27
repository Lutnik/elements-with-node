const express = require('express');
// const validator = require('express-validator');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const breadcrumbs = require('express-breadcrumbs');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const expressSession = require('express-session');
const mongoSanitize = require('express-mongo-sanitize');

const User = require('./models/user');

const elementsRoutes = require('./routes/elements');
const commentsRoutes = require('./routes/comments');
const indexRoutes = require('./routes/index');
const userRoutes = require('./routes/user');

const app = express();

// DATABASE CONFIG AND CONNECT
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect(process.env.DATABASEURL, {
  socketTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  keepAlive: true,
})
  .catch((err) => console.error(err));
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('Connection to the database established'));

// PASSPORT CONFIG
app.use(expressSession({
  secret: process.env.SECRET,
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
app.use(flash());
app.use(breadcrumbs.init());
app.use('/', breadcrumbs.setHome({
  name: 'Home',
  url: '/',
}));
app.use(mongoSanitize({
  replaceWith: '_',
}));
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.currentPage = req.originalUrl;
  res.locals.breadcrumbs = req.breadcrumbs();
  res.locals.flashError = req.flash('error');
  res.locals.flashSuccess = req.flash('success');
  next();
});

// ROUTES
app.use('/elements', elementsRoutes);
app.use('/elements/:id', commentsRoutes);
app.use('/user', userRoutes);
app.use(indexRoutes);

app.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`));
