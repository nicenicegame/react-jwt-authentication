require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const checkAuth = require('./checkAuth')
const app = express()

const { Client } = require('pg')
const client = new Client({
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
})

client.connect((err) => {
  if (err) {
    console.log(err)
  } else {
    console.log('Connected to database')
  }
})

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.header('Access-Control-Allow-Methods', 'POST, GET')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/users', checkAuth, (req, res) => {
  client
    .query('SELECT * FROM users')
    .then((result) => {
      res.json(result)
    })
    .catch((err) => console.log(err))
})

app.post('/register', (req, res) => {
  const { username, password } = req.body.user

  bcrypt
    .hash(password, 10)
    .then((hash) => {
      client
        .query('INSERT INTO users (username, password) VALUES ($1, $2)', [
          username,
          hash,
        ])
        .then((result) => {
          res.json(result)
        })
        .catch((err) => console.log(err))
    })
    .catch((err) => {
      console.log(err)
    })
})

app.post('/login', (req, res) => {
  const { username, password } = req.body.user

  client
    .query('SELECT * FROM users WHERE (username=$1);', [username])
    .then((result) => {
      const user = result.rows[0]
      if (!user) res.status(404)

      bcrypt
        .compare(password, user.password)
        .then((matched) => {
          if (!matched) res.status(404)
          const token = jwt.sign(
            { username: user.username },
            process.env.ASSCESS_TOKEN_SECRET
          )
          res.json({
            message: 'Login successfully',
            loginStatus: matched,
            username: user.username,
            token,
          })
        })
        .catch((err) => res.status(404).send(err))
    })
    .catch((err) => console.log(err))
})

app.listen(3001, () => {
  console.log('listening to port 3001')
})
