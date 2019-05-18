import React from 'react'
import Header from './header'
import Footer from './footer'
import Cookies from 'universal-cookie';
import './pictures.css';


//use a loop inside that function
function  get_stickers(cb) {
    var name;

    name = "sticker" + 0 + ".png";
    fetch('/get_stickers?name=' + name)
    .then(res => res.json())
    .then(url => url.stickerBase64)
    .then(sticker => {
      cb(sticker);
    })

    name = "sticker" + 1 + ".png";
    fetch('/get_stickers?name=' + name)
    .then(res => res.json())
    .then(url => url.stickerBase64)
    .then(sticker => {
      cb(sticker);
    })

    name = "sticker" + 2 + ".png";
    fetch('/get_stickers?name=' + name)
    .then(res => res.json())
    .then(url => url.stickerBase64)
    .then(sticker => {
      cb(sticker);
    })
}

class Pictures extends React.Component {

  constructor () {
    super();
    this.video = React.createRef();
    this.canvas = React.createRef();
    this.truebutton = React.createRef();
    this.state = {
      url_sticker: [],
      chosen: "",
      captured: false,
      picture: "",
      photos: []
    }
    this.handleChange = this.handleChange.bind(this);
  }


  componentDidMount(){
    const cookies = new Cookies();
    var active_user = cookies.get('user');
    if (active_user) {
      fetch('/db_get_photos_from?name=' + active_user)
      .then(res => res.json())
      .then(photos => this.setState({photos}, () => console.log('photos fetched', photos)));
    }

      get_stickers((sticker) => {
        this.setState({
          url_sticker: this.state.url_sticker.concat(sticker)
        })
      })

      this.getVideo();
}


getVideo () {
  var video = this.video.current;

  navigator.getMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  navigator.getMedia({
    video:true,
    audio:false
  }, function(stream) {
      video.srcObject = stream;
      video.play();
  }, function(error) {
      console.log("An error occured with the webcam!")
  });
}


takePicture = event => {
    var video = this.video.current;
    var canvas = this.canvas.current;
    var context = canvas.getContext('2d');
    var img_stick = new Image();

    console.log(Date.now());
    console.log(this.state.chosen);
    img_stick.src = this.state.chosen;
    context.drawImage(video, 0, 0, 400, 300);
    this.setState({captured : true});
    setTimeout(() => {
      context.drawImage(img_stick, 40, 30, 100, 75);
      var img_url = canvas.toDataURL("image/png");
      this.setState({picture: img_url})
    }, 0);
  }


  handleChange = event => {
    if (event.target.src === this.state.chosen) {
      this.setState({chosen: ""});
      event.target.blur()
    }
    else {
      this.setState({ chosen:event.target.src })
      event.target.focus()
    }
  }


handleUpload = event => {
  const cookies = new Cookies();

  if (cookies.get('user'))
  {
    fetch('/download_image', {
      method: "post",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({url: this.state.picture, user: cookies.get('user'), date: Date.now()})
    })
    this.props.history.push('/home');
  }
  else {
    console.log("Image not uploaded because the user is not connected.")
  }
}


  clickButton = event => {
    var realbutton = this.truebutton.current;
    realbutton.click();
  }


  uploadFile = event => {
    var canvas = this.canvas.current;
    var context = canvas.getContext('2d');
    var upload_image = new Image();
    var img_stick = new Image();
    var upload = event.target.files[0];
    var reader = new FileReader();

    reader.readAsDataURL(upload);
    reader.onloadend = () => {
      if (upload.type === "image/png" || upload.type === "image/jpeg") {
        console.log("This is an image!")
        console.log(reader.result);
        upload_image.src = reader.result;
        img_stick.src = this.state.chosen;
        setTimeout(() => {
          context.drawImage(upload_image, 0, 0, 400, 300);
        }, 0);
        this.setState({captured : true});
        setTimeout(() => {
          context.drawImage(img_stick, 40, 30, 100, 75);
          var img_url = canvas.toDataURL("image/png");
          this.setState({picture: img_url})
        }, 0);
      }
      else {
        console.log("Not an image!")
      }
    }
  }


  render() {
    return (
      <div>
      <Header />
      <h1 className="center" id="picture_title"> Post some pictures </h1>
      <video ref={this.video} className="center" id="video"> </video>
      <ul>
        {this.state.url_sticker.map((sticker, i) =>
          <input type="image" key={"sticker" + i} alt={"submit_sticker" + i} id={"sticker" + i} className="sticker" onClick={this.handleChange} src={sticker} />
        )}
      </ul>
      <br />
      <button id="capture" onClick= {this.takePicture}> Take picture </button>
      <br />
      <input type="file" ref={this.truebutton} id="upload_hidden" onChange={this.uploadFile} hidden />
      <button id="upload" onClick={this.clickButton}> Upload a picture </button>
      <canvas ref={this.canvas} id="canvas" width="370" height="280"> </canvas>
      {this.state.captured ? <button id="upload" onClick={this.handleUpload}> Post it </button> : null}
      <Footer />
      </div>
    );
  }
}
export default Pictures
