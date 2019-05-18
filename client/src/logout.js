import React from 'react'
import Header from './header'
import Footer from './footer'
import './logout.css';
import Cookies from 'universal-cookie';

class logout extends React.Component {

  componentDidMount () {

  const cookies = new Cookies();

  if (cookies.get('user'))
  {
    cookies.remove('user', { path: '/'});
    this.props.history.push('/home');
  }
  else {
    this.props.history.push('/sign_up');
  }
}

render() {
  return (
    <div>
    <Header />
    <Footer />
    </div>
  );
}

}

export default logout
