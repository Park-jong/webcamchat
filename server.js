const express = require('express');
const app = express();
const fs = require('fs');
const options = {
  key: fs.readFileSync('./server.key'),
  cert: fs.readFileSync('./server.crt'),
  ca: fs.readFileSync('./server.csr')
};
const server = require('https').createServer(options, app);
const io = require('socket.io')(server);
const {v4: uuidV4} = require('uuid');

let names = new Map();

app.set('view engine', 'ejs');
app.use(express.static('public'));


app.get('/', (req, res) =>{
  res.redirect(`/${uuidV4()}`);//uuidv4함수를 사용 uuid를 얻음
  //임의로 생성한 uuid ->room
});

app.get('/:room', (req, res) =>{
  res.render('room', {roomId: req.params.room});
});

io.on('connection', socket =>{
  socket.on('join-room', (roomid, userId)=>{
    socket.join(roomid);//room접속
    console.log(userId + ' join room :' + roomid);
    names.set(userId, userId);
    io.to(roomid).emit('user-connected', userId);//방전체에userid전송

    //방전체에 disconnect userid 전송
    socket.on('disconnect', () =>{
      socket.leave(roomid);
      console.log(userId + ' left room :' + roomid);
      io.to(roomid).emit('user-disconnected', userId);
    });

    //메시지 전송
    socket.on('chat message', (msg) => {
      io.to(roomid).emit('chat message', userId, names.get(userId), msg);
      console.log("(" + roomid + ")" + userId + " : " +msg);
    });

    //유저 이름 변경
    socket.on('change name', (username) => {
      names.set(userId, username);
      console.log(userId + " change name : " + username);
    });
  });

});

server.listen(3000);
