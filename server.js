const PORT = 8000;
const express = require('express');
const mysql = require('mysql');
const url = require('url');
const app = express();
const nodemailer = require("nodemailer");
const bodyParser = require('body-parser')
const base64Img = require('base64-img');
const fs = require('fs');

var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "tcheee42@gmail.com",
        pass: "rootroot"
    }
});
var mailOptions, link;

var db = mysql.createConnection({
  host: "192.168.99.100",
  port: "4546",
  user: "test",
  password: "test",
  database: "cama_db"
});

db.connect(function(err) {
  if (err) throw err;
  console.log("Mysql connected!");
});

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Create table user
app.get("/db_create_users", (req, res) => {
  let sql = 'CREATE TABLE users(id int AUTO_INCREMENT, name VARCHAR(255), password VARCHAR(255), mail VARCHAR(255), active INT, notification INT, nb_photos INT, PRIMARY KEY (id))';
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("Users table created");
  });
});

// Create table photos
app.get("/db_create_photos", (req, res) => {
  let sql = 'CREATE TABLE photos(id int AUTO_INCREMENT, img_id BIGINT, user VARCHAR(255), link LONGTEXT, likes INT, time BIGINT, PRIMARY KEY (id))';
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("Photos table created");
  });
});

// Create table comments
app.get("/db_create_comments", (req, res) => {
  let sql = 'CREATE TABLE comments(id int AUTO_INCREMENT, user VARCHAR(255), img_id BIGINT, comment LONGTEXT, time BIGINT, PRIMARY KEY (id))';
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("Comments table created");
  });
});

// Create table likes
app.get("/db_create_likes", (req, res) => {
  let sql = 'CREATE TABLE likes(id int AUTO_INCREMENT, user VARCHAR(255), img_id BIGINT, likes INT, PRIMARY KEY (id))';
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    let like = {user:"init", img_id: 0, likes: 0};
    let sql1 = 'INSERT INTO likes SET ?';
    let init = db.query(sql1, like, (err, result) => {
      if (err) throw err;
        res.send("Likes table created");
    });
  });
});

// Create table totallikes
app.get("/db_create_totallikes", (req, res) => {
  let sql = 'CREATE TABLE totallikes(id int AUTO_INCREMENT, img_id BIGINT, total_likes BIGINT, PRIMARY KEY (id))';
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("Totallikes table created");
  });
});

// Add user in database
app.get("/db_add_users?*", (req, res) => {
  var url_parts = url.parse(req.url, true);
  var parsed = url_parts.query;
  var username = parsed.name;
  let sql1 = `SELECT * FROM users WHERE name='${username}'`
  let query1 = db.query(sql1, (err, result) => {
    if (err) throw err;
    if (result[0]) {
      console.log(result[0].name);
      res.json("false")
    }
    else {
      console.log("User does not exist")
      let user = {name:parsed.name, password:parsed.password, mail:parsed.mail, active: 0, notification: 1, nb_photos: 0};
      let sql = 'INSERT INTO users SET ?';
      let query = db.query(sql, user, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.json("true, we added the user!");
      });
    }
  })
});

// Send mail to user
app.get('/send_mail?*',function(req,res){
    var url_parts = url.parse(req.url, true);
    var parsed = url_parts.query;
    var name = parsed.name;
    var to = parsed.mail;
    link="http://"+req.get('host')+"/verify?name="+name;
    mailOptions={
        to : to,
        subject : "Camagru: Please confirm your Email account",
        html : "Hello " + name + ",<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response){
     if(error){
            console.log(error);
        res.end("error");
     }else{
            console.log("Message sent: " + response.message);
        res.end("sent");
         }
       });
});

//Mail validation and create an user
app.get("/verify?*", (req, res) => {
  var url_parts = url.parse(req.url, true);
  var parsed = url_parts.query;
  var name = parsed.name;
  let sql = `UPDATE users SET active=1 WHERE name='${name}'`;
  let query = db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    console.log("Redirected to localhost:3000");
    res.redirect('http://localhost:3000/verify?name=' + name);
  });
});

// Select all user in database
app.get("/db_get_users", (req, res) => {
  let sql = 'SELECT * FROM users';
  let query = db.query(sql, (err, results) => {
    if (err) throw err;
    console.log("All users fetched!");
    res.json(results);
  });
});

// Login if existing user
app.get("/db_login?*", (req, res) => {
  var url_parts = url.parse(req.url, true);
  var parsed = url_parts.query;
  let name = parsed.name;
  let password = parsed.password;
  let sql = `SELECT * FROM users WHERE name='${name}' AND password='${password}' AND active=1`; //and active === 1
  let query = db.query(sql, (err, result) => {
    if (err) throw err;
    if (result[0]){
      console.log(result[0].name + " exists and get a cookie of connection");
      res.json("true");
    }
    else {
      console.log("User does not exist.");
      res.json("false")
    }
  });
});

//Modify User
app.get("/db_modify_name?*", (req, res) => {
  var url_parts = url.parse(req.url, true);
  var parsed = url_parts.query;
  let name = parsed.name;
  let new_name = parsed.new;
  console.log(name, new_name);
  let sql1 = `SELECT * FROM users WHERE name='${new_name}'`
  let query1 = db.query(sql1, (err, result) => {
    if (err) throw err;
    if (result[0]) {
      console.log(result[0].name);
      res.json("false")
    }
    else {
      console.log("User does not exist")
      let sql = `UPDATE users SET name='${new_name}' WHERE name='${name}'`;
      let query = db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.json(result);
      });
    }
  })
});

// Modify Password
app.get("/db_modify_password?*", (req, res) => {
  var url_parts = url.parse(req.url, true);
  var parsed = url_parts.query;
  let name = parsed.name;
  let password = parsed.password;
  console.log(name, password);
  let sql = `UPDATE users SET password='${password}' WHERE name='${name}'`;
  let query = db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.redirect('http://localhost:3000/login');
  });
});

// Send mail to user
app.get('/db_send_mail_modify?*',function(req,res){
    var url_parts = url.parse(req.url, true);
    var parsed = url_parts.query;
    var name = parsed.name;
    var password = parsed.password;
    var to = parsed.mail;
    host=req.get('host');
    link="http://"+req.get('host')+"/db_modify_password?name="+name+"&password="+password;
    mailOptions={
        to : to,
        subject : "Camagru: Please confirm your password modification",
        html : "Hello " + name +",<br> Please Click on the link to confirm your password modification.<br><a href="+link+">Click here to verify</a>"
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response){
     if(error){
            console.log(error);
        res.end("error");
     }
     else{
            console.log("Message sent: " + response.message);
        res.end("sent");
         }
       });
});

// Modify  mail
app.get("/db_modify_mail?*", (req, res) => {
  var url_parts = url.parse(req.url, true);
  var parsed = url_parts.query;
  let name = parsed.name;
  let mail = parsed.mail;
  console.log(name, mail);
  let sql = `UPDATE users SET mail='${mail}' WHERE name='${name}'`;
  let query = db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.json(result);
  });
});

// Modify mail notifications
app.get("/db_modify_notification?*", (req, res) => {
  var url_parts = url.parse(req.url, true);
  var parsed = url_parts.query;
  var bool = parsed.notification;
  var name = parsed.name;
  var sql;
  console.log(bool);
  console.log(name);
  if (bool === "no"){
    sql = `UPDATE users SET notification=0 WHERE name='${name}'`;
  }
  else {
    sql = `UPDATE users SET notification=1 WHERE name='${name}'`;
  }
  let query = db.query(sql, (err, result) => {
      if (err) throw err;
      console.log(result);
      res.json(result);
    });
});

//Send stickers from server to the client
app.get("/get_stickers?*", (req, res) => {
  var url_parts = url.parse(req.url, true);
  var parsed = url_parts.query;
  console.log(parsed.name);
  base64Img.base64(__dirname + '/stickers/' + parsed.name, function(err, data) {
    if (err) console.log(err)
    res.status(200).send({
      stickerBase64: data
    })
  });
});


// Download from body, put info in the db and store it on the computer
app.post("/download_image", (req, res) => {
  let url = req.body.url;
  let name = req.body.user;
  let date = req.body.date;
  let path = '/nfs/2017/t/tcherret/Desktop/Cama/pictures/';

  console.log("got a request", name, date);
  let photo = {img_id:date, user: name, link: url, likes: 0, time: date};
  let sql = 'INSERT INTO photos SET ?';
  let query = db.query(sql, photo, (err, result) => {
      if (err) throw err;
      let filename = name + "_" + date;
          base64Img.img(url, path, filename, function(err, filepath) {
            if (err) {
              console.log("Error while downloading");
            }
            else {
              console.log("Image download!")
            }
          });
        })
});

// Select all photos from database
app.get("/db_get_photos", (req, res) => {
  let sql = 'SELECT * FROM photos ORDER BY time DESC';
  let query = db.query(sql, (err, results) => {
    if (err) throw err;
    console.log("All photos fetched!");
    res.json(results);
  });
});

// Select all photos from an user from database
app.get("/db_get_photos_from?*", (req, res) => {
  var url_parts = url.parse(req.url, true);
  var parsed = url_parts.query;
  let name = parsed.name;
  console.log(name);
  let sql = `SELECT * FROM photos WHERE user='${name}' ORDER BY time DESC`;
  let query = db.query(sql, (err, results) => {
    if (err) throw err;
    console.log("All photos fetched!");
    res.json(results);
  });
});

// Get comment from the front and put it in the db
app.get("/add_comment?*", (req, res) => {
  var url_parts = url.parse(req.url, true);
  var parsed = url_parts.query;
  var name = parsed.name;
  var new_comment = parsed.new_comment;
  var time = parsed.time;
  var id = parsed.id;

  console.log("got a request", name, new_comment, id);
  let comment = {user:name, img_id: id, comment: new_comment, time: time};
  let sql = 'INSERT INTO comments SET ?';
  let query = db.query(sql, comment, (err, result) => {
      if (err) {
          console.log("Error while inserting into db!");
          throw(err);
          res.json("false");
      }
      else {
          console.log("Comment added!");
          res.json("true");
      }
      });
});

// Select all comments from database
app.get("/db_get_comments", (req, res) => {
  let sql = 'SELECT * FROM comments ORDER BY time asc';
  let query = db.query(sql, (err, results) => {
    if (err) throw err;
    console.log("All comments fetched!");
    res.json(results);
  });
});

// Get likes from the client and modify the db
app.get("/modify_like?*", (req, res) => {
  var url_parts = url.parse(req.url, true);
  var parsed = url_parts.query;
  var name = parsed.name;
  var id = parsed.id;

  console.log("got a request", name, id);
  let sql1 = `SELECT * FROM likes WHERE user='${name}' and img_id='${id}'`
  let query1 = db.query(sql1, (err, result) => {
    if (err) throw err;
    if (result[0]) {
      console.log("like =", result[0].likes)
      if (result[0].likes === 1) {
        let sql = `UPDATE likes SET likes=0 WHERE user='${name}' and img_id='${id}'`;
        let query_likes = db.query(sql, (err, result) => {
          if (err) throw err;
          console.log(result);
          let sql2 = `UPDATE totallikes SET total_likes=total_likes - 1 WHERE img_id='${id}'`
          let like = db.query(sql2, (err, result) => {
            if (err) throw err;
            console.log("Unlike the photo.")
          })
          res.json("true, we unlike the photo!");
        });
      }
      else {
        let sql = `UPDATE likes SET likes=1 WHERE user='${name}' and img_id='${id}'`;
        let query_likes = db.query(sql, (err, result) => {
          if (err) throw err;
          console.log(result);
          let sql2 = `UPDATE totallikes SET total_likes=total_likes + 1 WHERE img_id='${id}'`
          let like = db.query(sql2, (err, result) => {
            if (err) throw err;
            console.log("Like the photo.")
          })
          res.json("true, we like the photo!");
        });
      }
    }
    else {
      let like = {user:name, img_id: id, likes: 1};
      let sql = 'INSERT INTO likes SET ?';
      console.log("like does not exist")
      let query = db.query(sql, like, (err, result) => {
        if (err) throw err;
        console.log(result);
        let sql2 = `SELECT * FROM totallikes WHERE img_id='${id}'`
        let like = db.query(sql2, (err, result) => {
          if (err) throw err;
          if (result[0]) {
            let sql3 = `UPDATE totallikes SET total_likes=total_likes + 1 WHERE img_id='${id}'`
            db.query(sql3, (err, result) => {
              if (err) throw err;
              console.log("Like the photo.")
            })
          }
          else {
            let totallike = {img_id: id, total_likes: 1};
            let sql3 = 'INSERT INTO totallikes SET ?';
            console.log("Totallike does not exist")
            db.query(sql3, totallike, (err, result) => {
              if (err) throw err;
              console.log("Totallikes created")
            })
        }
        res.json("true, we added the like!");
        });
      })
    }
  })
})

app.get("/db_get_likes", (req, res) => {
  let sql = 'SELECT * FROM likes';
  let query = db.query(sql, (err, results) => {
    if (err) throw err;
    console.log("All likes fetched!");
    res.json(results);
  });
});

app.get("/db_get_totallikes", (req, res) => {
  let sql = 'SELECT * FROM totallikes';
  let query = db.query(sql, (err, results) => {
    if (err) throw err;
    console.log("All totallikes fetched!");
    res.json(results);
  });
});

app.get('/send_notification?*',function(req,res){
    var url_parts = url.parse(req.url, true);
    var parsed = url_parts.query;
    var name = parsed.to;
    let sql = `SELECT * FROM users WHERE name='${name}'`;
    let query = db.query(sql, (err, result) => {
      if (err) throw err;
      var to = result[0].mail;
      console.log(to);
      if (result[0].notification === 1) {
        mailOptions={
            to : to,
            subject : "Camagru: New notification",
            html : "Hello " + name +",<br>You got a notification from Camagru!"
        }
        smtpTransport.sendMail(mailOptions, function(error, response){
         if(error){
                console.log(error);
            res.end("error");
         }
         else {
                console.log("Message sent: " + response.message);
            res.end("sent");
             }
           });
      }
      else {
        console.log("Notifications OFF");
        res.end("false");
      }
    });
});


app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
