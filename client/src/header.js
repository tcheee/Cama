import { Link } from 'react-router-dom'
import './header.css';
import Cookies from 'universal-cookie';
const React = require('react');

class Header extends React.Component {
  render() {
    const cookies = new Cookies();
    var name;
    var val1;
    var val2;
    var link1;
    var link2

    if (cookies.get('user')) {
        name = cookies.get('user');
        val1 = "Settings"
        val2 = "Log Out"
        link1 = "/settings"
        link2 = "/logout"
    }
    else {
      name = "Account"
      val1 = "Log In"
      val2 = "Sign Up"
      link1 = "/login"
      link2 = "/sign_up"
    }


    return(
      <header>
        <Link to="/home" id='home'> <h3> Home </h3> </Link>
        <Link to="/pictures"> <img id="camera" src="http://aux.iconspalace.com/uploads/camera-icon-256-803400574.png" alt="camera"/> </Link>
        <div id="dropdown">
          <h3 className="dropbtn">{name}</h3>
          <div className="dropdown-content">
            <Link to={link1}> <p> {val1} </p> </Link>
            <Link to={link2}> <p> {val2}</p> </Link>
          </div>
        </div>
      </header>
    );
  }
}

export default Header
