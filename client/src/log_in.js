import React from 'react'
import Header from './header'
import Footer from './footer'
import './log_in.css';
import hash  from 'object-hash';
import Cookies from 'universal-cookie';

class log_user extends React.Component {

  constructor () {
    super();
    this.state = {
      name: "",
      password: "",
    }
    this.handleChange = this.handleChange.bind(this);
    this.handlePChange = this.handlePChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange = event =>{
    this.setState({ [event.target.name]:event.target.value })
  }

  handlePChange = event =>{
    this.setState({ [event.target.name]:hash(event.target.value) })
}

  handleSubmit = function(e) {
    e.preventDefault();

    var bool;
    const cookies = new Cookies();

    fetch('/db_login?name=' + this.state.name + '&password=' + this.state.password)
    .then(res => res.json())
    .then(function (res) {
      console.log('Request success: ', res);
      bool = res;
    })
    .then(() => {
        if (bool === "true") {
          cookies.set('user', this.state.name, { path: '/', maxAge:31000000 });
          this.props.history.push('/home')
          console.log(bool, 'let do that', this.state.name)
          console.log(cookies.get('user'));
        }
        else {
          this.props.history.push('/sign_up')
          console.log(bool, 'noooope')
        }
    });
}

  render() {
    return (
      <div>
      <Header />
      <h1 id="title"> Just log in to see what your friends share! </h1>
      <div id="login">
      <form onSubmit={this.handleSubmit}>
        <input type="text" name="name" onChange={this.handleChange}  placeholder="Login" required/> <br />
        <input type="password" name="password" onChange={this.handlePChange}  placeholder="Password" reqired/> <br /> <br />
        <button type="submit"> Log In </button>
      </form>
      </div>
      <Footer />
      </div>
    );
  }
}

export default log_user
