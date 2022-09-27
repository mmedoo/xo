const rooms = [];
const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
let clients = 0;
app.use(express.urlencoded({ extended: true }));
app.use(require("body-parser").json());
app.use(cors());
app.use(express.static('website'));
app.use(bodyParser.urlencoded({ extended: false }));
app.post('/create',addRoom);
function addRoom(req,res) {
  for (let i = 0; i < rooms.length; i++) {
    if (rooms[i][0] == req.body.room) {
      res.send(false);
      return;
    }
  }
  clients++;
  let moves = [];
  let room = [req.body.room,moves];
  let porto = rooms.length+1+'0'+clients+'0'+1;
  let ws = new require('ws');
  let wss = new ws.Server({port : porto});
  wss.on("connection",(ws)=>{
    room.push(ws);
    rooms.push(room);
    ws.on("message",(data) => {
      let n = JSON.parse(data)[0];
      if (n == 99) moves = []; else moves.push(n);
      let index = rooms.indexOf(room);
      for (let i = 2; i < room.length; i++) {
        rooms[index][i].send(JSON.stringify({0:n}));
      }
    });
    res.send({porto});
    ws.on("close",()=>{
      if (room.length == 3) {
        rooms.splice(rooms.indexOf(room),1);
      } else {
        room.splice(room.indexOf(this),1);
      }
    })
  })
}
app.post('/join',clientJoin)
function clientJoin(req,res) {
  if (rooms.length == 0) {
    res.send(false);
    return;
  }
  let roomName = req.body.room;
  for (let i = 0; i < rooms.length; i++) {
    if (rooms[i][0] == roomName) {
      clients++;
      let porto = rooms.length+'0'+clients+'0'+rooms[i].length-1+'';
      let ws = new require("ws");
      let wss = new ws.Server({port : porto});
      let moves = rooms[i][1];
      wss.on("connection",(ws)=>{
        rooms[i].push(ws);
        ws.on("message",(data)=>{
          let n = JSON.parse(data)[0];
          if (n == 99) moves = []; else moves.push(n);
          for (let j = 2; j < rooms[i].length; j++) {
            rooms[i][j].send(JSON.stringify({0:n}));
          }
        });
        ws.on("close",()=>{
          if (rooms[i].length == 3) {
            rooms.splice(i,1);
          } else {
            rooms[i].splice(rooms[i].indexOf(ws),1);
          }
        })
      res.send({porto,moves});
      })
      return;
    } else if (i == rooms.length-1){
      res.send(false);
    }
  }
}
app.listen(process.env.PORT || 3000);
