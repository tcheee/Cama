import React from 'react'
import Header from './header'
import Footer from './footer'
import './sign_up.css';
import hash  from 'object-hash';

class create_user extends React.Component {

  constructor () {
    super();
    this.state = {
      name: "",
      password: "",
      mail: ""
    }
    this.handleChange = this.handleChange.bind(this);
    this.handlePChange = this.handlePChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange = event => {
    this.setState({ [event.target.name]:event.target.value })
  }

  handlePChange = event => {
    var pass;
    var number;
    var letter;

    number = /[0-9]/
    letter = /[a-zA-Z]/
    pass = event.target.value;

    if (pass.match(number) && pass.match(letter))
    {
      console.log("regex works")
      this.setState({ [event.target.name]:hash(event.target.value) });
    }
    else {
      console.log("regex not work")
      alert('Please use at least one letter and one number in your password!');
      window.location.reload();
    }
}

  handleSubmit = event => {
    event.preventDefault();

    fetch('/db_add_users?name=' + this.state.name + '&password=' + this.state.password + '&mail=' + this.state.mail)
      .then(res => res.json())
      .then(result => {
        if (result === "false") {
          alert('Username already exists! Please choose another one.');
          window.location.reload();
        }
        else {
          fetch('/send_mail?name=' + this.state.name + '&mail=' + this.state.mail);
          this.props.history.push('/home');
        }
      })
}

  render() {
    return (
      <div>
      <Header />
      <h1 id="title"> Just sign up to see what people share! </h1>
      <div id="login">
      <form onSubmit={this.handleSubmit}>
        <input type="text" name="name" onChange={this.handleChange}  placeholder="Login" required/> <br />
        <input type="text" name="mail" onChange={this.handleChange}  placeholder="Mail" required/> <br />
        <input type="password" name="password" onBlur={this.handlePChange}  placeholder="Password" reqired/> <br /> <br />
        <button type="submit"> Sign Up </button>
      </form>
      </div>
      <Footer />
      </div>
    );
  }
}

export default create_user
