import React from 'react'
import Header from './header'
import Footer from './footer'
import Cookies from 'universal-cookie';
import './home.css';


class Home extends React.Component {

  constructor () {
    super();
    this.state = {
      photos: [],
      comments: [],
      totallikes: [],
      new_comment: "",
      name: "",
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount () {
    fetch('/db_get_photos')
      .then(res => res.json())
      .then(photos => this.setState({photos}, () => console.log('photos fetched', photos)));

    fetch('/db_get_comments')
    .then(res => res.json())
    .then(comments => this.setState({comments}, () => console.log('comments fetched', comments)));

    fetch('/db_get_totallikes')
    .then(res => res.json())
    .then(totallikes => this.setState({totallikes}, () => console.log('total_likes fetched', totallikes)));
  }

  handleChange = event => {
    this.setState({new_comment: event.target.value});
    this.setState({name: event.target.name});
  }

  handleSubmit = event => {
      event.preventDefault();
      const cookies = new Cookies();
      var active_user = cookies.get('user');

      if (active_user && this.state.new_comment !== "") {
        console.log(this.state.new_comment, active_user, event.target.id);
        fetch('/add_comment?name=' + active_user + '&new_comment=' + this.state.new_comment + '&id=' + event.target.id + '&time=' + Date.now())
        console.log("to:", event.target.name);
        fetch('/send_notification?to=' + event.target.name);
        fetch('/db_get_comments')
        .then(res => res.json())
        .then(comments => this.setState({comments}, () => console.log('comments fetched', comments)));
      }
      else if (!active_user){
        alert('You need to login or to sign up if you want to comment!');
      }
}

  handleLike = event => {
    event.preventDefault();
    const cookies = new Cookies();
    var active_user = cookies.get('user');

    if (active_user) {
      console.log(active_user, event.target.id);
      console.log("to:", event.target.name);
      fetch('/modify_like?name=' + active_user + "&id=" + event.target.id)
      .then(() => {
        fetch('/db_get_totallikes')
        .then(res => res.json())
        .then(totallikes => this.setState({totallikes}, () => console.log('total_likes fetched', totallikes)));
      })

      fetch('/send_notification?to=' + event.target.name);
    }
    else {
      alert('You need to login or to sign up if you want to like!');
    }
  }

  render() {
    return (
      <div>
      <Header />
      {this.state.photos.time ? <h1 id="no_pictures"> Sorry, no pictures were posted yet ... </h1> : null}
      <div>
        {this.state.photos.map((photo, index) =>
          <div key={index}>
            <h2 className="user_name"> {photo.user} </h2>
              <div key={index} className="container_photo">
              <img className="home_canvas" src={photo.link} alt={photo.id}/>

              <div className="inline_like">
                {this.state.totallikes.map((likes,index) =>
                  <div key={index}>
                    {(photo.img_id === likes.img_id & likes.total_likes > 0) ? <p id="home_text"> <b> {likes.total_likes} likes </b> </p> : null}
                  </div>
                )}
                <form> <button type="submit" className="like_button" id={photo.time} name={photo.user} onClick={this.handleLike}> Like </button> </form>
              </div>

              {this.state.comments.map((comment,index) =>
                <div key={index}>
                  {photo.img_id === comment.img_id ? <p id="home_text"> <b>{comment.user} </b> {comment.comment} </p> : null}
                </div>
              )}
              <form id={photo.time} name={photo.user} onSubmit={this.handleSubmit}>
                <input type="text" className="home_comment" onChange={this.handleChange} placeholder="Add a comment ..." name={photo.user} />
                <button type="submit"> Post </button>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
      </div>
    );
  }
}
export default Home
