import React from 'react'
import Header from './header'
import Footer from './footer'
import hash  from 'object-hash';
import Cookies from 'universal-cookie';
import './settings.css';

class settings extends React.Component {

  constructor () {
    super();
    this.state = {
      name: "",
      password: "",
      mail: "",
      new: "",
      notification: ""
    }
    this.handleChange = this.handleChange.bind(this);
    this.handlePChange = this.handlePChange.bind(this);
    this.handleSubmit0 = this.handleSubmit0.bind(this);
    this.handleSubmit1 = this.handleSubmit1.bind(this);
    this.handleSubmit2 = this.handleSubmit2.bind(this);
    this.handleSubmit3 = this.handleSubmit3.bind(this);
  }

  componentDidMount () {
    var get_user;

    const cookies = new Cookies();
    get_user = cookies.get('user');

    console.log(get_user);

    this.setState({name: get_user})

    console.log(this.state.name)

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

handleSubmit0 = function(e) {
    e.preventDefault();

    const cookies = new Cookies();

    if (cookies.get('user')){
      cookies.remove('user', { path: '/'});
    }

    fetch('/db_send_mail_modify?name=' + this.state.name + '&mail=' + this.state.mail + '&password=' + this.state.password)

    this.props.history.push('/settings');
}

handleSubmit1 = function(e) {
  e.preventDefault();
  fetch('/db_modify_mail?name=' + this.state.name + '&mail=' + this.state.mail)
    .then(res => res.json())
    this.props.history.push('/settings')
}

handleSubmit2 = event => {
  event.preventDefault();


  fetch('/db_modify_name?name=' + this.state.name + '&new=' + this.state.new)
    .then(res => res.json())
    .then(result => {
      if (result === "false") {
        alert('Username already exists! Please choose another one.');
        window.location.reload();
      }
      else {
        const cookies = new Cookies();
        cookies.remove('user', { path: '/'});
        cookies.set('user', this.state.new, { path: '/', maxAge:31000000 });
        window.location.reload();
      }
    })
}

handleSubmit3 = function(e) {
  e.preventDefault();

  fetch('/db_modify_notification?name=' + this.state.name + '&notification=' + this.state.notification)

  //this.props.history.push('/settings')
}

  render() {
    return (
      <div>
      <Header />
      <div id="login">
      <h1 id ="first"> Modify your username! </h1>
      <form onSubmit={this.handleSubmit2}>
        <input type="text" name="name" onChange={this.handleChange}  placeholder="Name" required/> <br />
        <input type="text" name="new" onChange={this.handleChange}  placeholder="New Name" reqired/> <br /> <br />
        <button type="submit"> Modify </button>
      </form>
      <h1> Modify your password! </h1>
      <form onSubmit={this.handleSubmit0}>
        <input type="text" name="name" onChange={this.handleChange}  placeholder="Name" required/> <br />
        <input type="text" name="mail" onChange={this.handleChange}  placeholder="Mail" required/> <br />
        <input type="password" name="password" onBlur={this.handlePChange}  placeholder="New Password" reqired/> <br /> <br />
        <button type="submit"> Modify </button>
      </form>
      <h1> Modify your mail! </h1>
      <form onSubmit={this.handleSubmit1}>
        <input type="text" name="name" onChange={this.handleChange}  placeholder="Name" required/> <br />
        <input type="text" name="old_mail" onChange={this.handleChange}  placeholder="Old Mail" required/> <br />
        <input type="text" name="mail" onChange={this.handleChange}  placeholder="New Mail" reqired/> <br /> <br />
        <button type="submit"> Modify </button>
      </form>
      <h1> Mail Notifications</h1>
      <form onSubmit={this.handleSubmit3}>
        <input type="radio" name="notification" onClick={this.handleChange} value="yes"/> On <br />
        <input type="radio" name="notification" onClick={this.handleChange} value="no"/> Off <br />
        <button type="submit"> Modify </button>
      </form>
      </div>
      <Footer />
      </div>
    );
  }
}

export default settings
