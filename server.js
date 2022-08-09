const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const {v4: uuidV4} = require('uuid');

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
    io.to(roomid).emit('user-connected', userId);//방전체에userid전송

    socket.on('disconnect', () =>{
      socket.leave(roomid);
      console.log(userId + ' left room :' + roomid);
      io.to(roomid).emit('user-disconnected', userId);
    });//방전체에 disconnect userid 전송

    socket.on('chat message', (userid, msg) => {
      io.to(roomid).emit('chat message', userId, msg);
      console.log("(" + roomid + ")" + userid + " : " +msg)
    });//메시지 전송
  });

});

server.listen(3000);
