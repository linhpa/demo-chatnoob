'use strict'
const path = require('path')
const express = require('express')
var app = express()
const fs = require('fs')

const dbName = 'demo-socketio';

const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017';


app.use(express.static(__dirname + '/public'))

var certOptions = {
  key: fs.readFileSync(path.resolve('cert/server.key')),
  cert: fs.readFileSync(path.resolve('cert/server.crt'))
}

const server = require('https').createServer(certOptions, app)
//const server = require('http').createServer(app)

var io = require("socket.io")(server)

server.listen(3000)
console.log("Server - Waiting connection at port: 3000");

var msgHistory


var roles = {
  sender  : "",
  receiver    : ""  
};

io.sockets.on('connection', function (socket) { 
  socket.on('setRole', function (data) {
    socket.role = data.trim();
    roles[socket.role] = socket.id;
    console.log("Role "+ socket.role + " is connected.");

    let client = new MongoClient(url)
	client.connect(function(err, client) {
	  	console.log("Connected correctly to server");

	  	var db = client.db(dbName);

	  	var col = db.collection('sender||receiver');
	  	 	
		col.find({}).limit(10).sort({_id: -1}).toArray(function(err, docs) {
	  		msgHistory = docs.reverse()
	  		client.close()
		})
	})
    io.to(roles[socket.role]).emit('receiveMsgHistory', {
	  	msgHistory: msgHistory
	  })
  });

  socket.on('setRole2', function (data) {    
    socket.role = data
    roles[socket.role.user] = socket.id;
    console.log("Role "+ socket.role.user + " is connected.");

    let client = new MongoClient(url)
    client.connect(function(err, client) {
      console.log("Connected correctly to server");

      var db = client.db(dbName);

      var col = db.collection(socket.role.user + '||' + socket.role.friend);
        
      col.find({}).limit(10).sort({_id: -1}).toArray(function(err, docs) {
        msgHistory = docs.reverse()        
        client.close()

        io.to(roles[socket.role.user]).emit('receiveMsgHistory', {
          msgHistory: msgHistory
        })    
      })
    })
    
  });

  /////////////////////
 
  socket.on("sendImage", function(data){
    var guess = data.base64.match(/^data:image\/(png|jpeg);base64,/)[1];
    var ext = "";
    switch(guess) {
      case "png"  : ext = ".png"; break;
      case "jpeg" : ext = ".jpg"; break;
      default     : ext = ".bin"; break;
    }
    var savedFilename = "/upload/"+randomString(10)+ext;
    fs.writeFile(__dirname+"/public"+savedFilename, getBase64Image(data.base64), 'base64', function(err) {
      if (err !== null)
        console.log(err);
      else 
        io.to(roles.receiver).emit("receiveImage", {
          path: savedFilename,
        });
        console.log("Send photo success!");
    });
  });
 
  socket.on('disconnect', function() {
    //console.log("Role " + socket.role.user + " is disconnect.");
  }); 

  	socket.on('sendMsg', (data) => {  	
  		let client1 = new MongoClient(url)  		
  		client1.connect(function(err, client) {
  			var db = client1.db(dbName);

		  	var col = db.collection(socket.role.user + '||' + socket.role.friend);
		  	
			  col.insertOne({
			        msg: data.msg,
			      	name1: data.from,
			      	name2: data.to			      	
			    }, function(err, r) {			    
			    client1.close();
			  });

        var col2 = db.collection(socket.role.friend + '||' + socket.role.user);

        col2.insertOne({
              msg: data.msg,
              name1: data.from,
              name2: data.to              
          }, function(err, r) {         
          client1.close();
        });
  		})

  		io.to(roles[data.to]).emit('receiveMsg', {
  			msg: data.msg,
  			from: data.from,
  			to: data.to
  		})
  	})

  	socket.on('typing', (data) => {
  		if (data.typing) {
  			io.to(roles[data.to]).emit('receiveTyping', {
	  			typing: true,
	  			dur: 4
	  		})
  		}  		
  	})
});
 
function randomString(length)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
 
    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
 
    return text;
}
function getBase64Image(imgData) {
    return imgData.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
}