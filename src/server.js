'use strict';

// 3rd Party Resources
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const base64 = require('base-64');
const { Sequelize, DataTypes } = require('sequelize');

// Prepare the express app
const app = express();

// Process JSON input and put the data on req.body
app.use(express.json());

const DATABASE_URL = process.env.NODE_ENV === 'test'
  ? 'sqlite:memory'
  : process.env.DATABASE_URL;

const sequelizeDatabase = new Sequelize(DATABASE_URL);

// Process FORM intput and put the data on req.body
app.use(express.urlencoded({ extended: true }));

// Create a Sequelize model
const Users = sequelizeDatabase.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Users.beforeCreate((user) => {
  console.log('our user:', user);
});

// Signup Route -- create a new user
// Two ways to test this route with httpie
// echo '{"username":"john","password":"foo"}' | http post :3000/signup
// http post :3000/signup username=john password=foo
app.post('/signup', async (req, res) => {

  try {
    // console.log(req.body);
    const newUsername = req.body.username;
    const newPassword = await bcrypt.hash(req.body.password, 5);
    
    console.log(newUsername);
    console.log(newPassword);

    let newUser = await Users.create({
      username: newUsername,
      password: newPassword,
    });
    console.log('this is new User: ', newUser);
    res.status(201).json(newUser);
  } catch (e) { res.status(403).send('Error Creating User'); }
});


// Signin Route -- login with username and password
// test with httpie
// http post :3000/signin -a john:foo
const basicAuth = async (req, res, next) => {

  console.log(' here: ', req.headers.authorization);
  let {authorization} = req.headers;
  let authString = authorization.split(' ')[1];
  let decodedAuth = base64.decode(authString);
  let [username, password] = decodedAuth.split(':');
  console.log(username, password);
  try {
    let user = await Users.findOne({ where: { username } });

    console.log('user: ', user);

    let validUser = await bcrypt.compare(password, user.password);
    console.log(validUser);

    if (validUser) {
      req.user = user;
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(403).send('user invalid');
  }
};

app.post('/signin', basicAuth, (req, res, next) => {
  res.status(200).send(req.user);
});

// make sure our tables are created, start up the HTTP server.

module.exports = { start:(PORT) => {
  app.listen(PORT, () => console.log('server running on port', PORT));
}, app, sequelizeDatabase };

// sequelizeDatabase.sync()
//   .then(() => {
//     console.log('successful connection');
//     app.listen(PORT, () => console.log('listening on port: ', PORT));
//   })
//   .catch(e => console.error(e));