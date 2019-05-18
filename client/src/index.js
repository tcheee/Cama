import React from 'react'
import ReactDOM from 'react-dom'
import { Route, BrowserRouter as Router } from 'react-router-dom'
import Home from './home'
import Pictures from './pictures'
import sign_up from './sign_up'
import login from './log_in'
import settings from './settings'
import logout from './logout'
import cookie_signup from './cookie_signup'

const routing = (
  <Router>
    <div>
      <Route exact path="/" component={Home} />
      <Route path="/home" component={Home} />
      <Route path="/sign_up" component={sign_up} />
      <Route path="/login" component={login} />
      <Route path="/settings" component={settings} />
      <Route path="/pictures" component={Pictures} />
      <Route path="/logout" component={logout} />
      <Route path="/verify" component={cookie_signup} />
    </div>
  </Router>
)

ReactDOM.render(routing, document.getElementById('root'))
