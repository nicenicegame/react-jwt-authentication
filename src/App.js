import React, { useState } from 'react'
import './style.css'
import axios from 'axios'

function App() {
  const [users, setUsers] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState({
    username: '',
    password: '',
  })
  const [user, setUser] = useState({
    username: null,
    token: undefined,
  })
  const [error, setError] = useState('')

  const changeHandler = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    })
  }

  const register = (e) => {
    e.preventDefault()

    if (!userData.username || !userData.password) return

    axios
      .post('http://localhost:3001/register', { user: userData })
      .then((response) => {
        console.log(response)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const login = (e) => {
    e.preventDefault()

    if (!userData.username || !userData.password) return

    axios
      .post('http://localhost:3001/login', { user: userData })
      .then((response) => response.data)
      .then((data) => {
        setUser({
          username: data.username,
          token: data.token,
        })
        setIsLoggedIn(data.loginStatus)
        setError('')
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const fetchUsers = () => {
    axios
      .get('http://localhost:3001/users', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
      .then((response) => {
        console.log(response.data.rows)
        setUsers(response.data.rows)
      })
      .catch((err) => {
        console.log(err)
        setError('You must login first.')
      })
  }

  return (
    <div className="App">
      <header>
        <h1>React JWT Authentication</h1>
        <h2>
          Hello, {isLoggedIn ? `${user.username}. You are logged in!` : 'React'}
        </h2>
      </header>

      <form onChange={changeHandler}>
        <div className="form-control">
          <label htmlFor="username">Username</label>
          <input type="text" name="username" />
        </div>
        <div className="form-control">
          <label htmlFor="password">Password</label>
          <input type="password" name="password" />
        </div>
        <div className="btn-group">
          <button onClick={register}>Register</button>
          <button onClick={login}>Login</button>
        </div>
      </form>

      <div className="users">
        <button onClick={fetchUsers}>Fetch data</button>
        {error && !isLoggedIn && <p>{error}</p>}
        <div className="users-list">
          {users && !error
            ? users.map((user, index) => {
                return (
                  <div className="user" key={index}>
                    <p>User: {user.username}</p>
                  </div>
                )
              })
            : null}
        </div>
      </div>
    </div>
  )
}

export default App
