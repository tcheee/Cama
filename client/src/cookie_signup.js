import React from 'react'
import Header from './header'
import Footer from './footer'
import './logout.css';
import Cookies from 'universal-cookie';
import queryString from 'query-string';

class cookie_signup extends React.Component {

  componentDidMount () {
  console.log('good')
  const cookies = new Cookies();
  let url = this.props.location.search;
  let params = queryString.parse(url);
  let user=params.name;

  cookies.set('user', user, { path: '/', maxAge:31000000 });
  this.props.history.push('/home');
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

export default cookie_signup
