const socket = io('/');
const videogrid = document.getElementById('video-grid');
const mypeer = new Peer();

const myvideo = document.createElement('video');
myvideo.muted = true;
const peers = {};
const videos = {};
let myId = null;
let videostream;

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myvideo, stream);//본인 카메라 화면 추가
  videostream = stream;
});



mypeer.on('call', function(call){
  call.answer(videostream);
  const video = document.createElement('video');
  call.on('stream', function(remoteStream){
    addVideoStream(video, remoteStream);//기존에 접속해있는 유저 카메라 추가
  });
  peers[call.peer] = call
  videos[call.peer] = video
  call.on('close', ()=>{
    video.remove();
  });//종료
});


socket.on('user-connected', (userId)=>{
  if(userId != myId )
    connectToNewUser(userId, videostream);//새로운 유저
});

mypeer.on('open', (id) =>{
  socket.emit('join-room', ROOM_ID, id);
  myId = id;
});

socket.on('user-disconnected', (userId) => {
  if(peers[userId]) peers[userId].close();
  if(videos[userId]) videos[userId].remove();
});

//채팅 출력
socket.on('chat message', (userid, name ,msg) => {
  li = $('<li>');
  li.text(name + '  :  ' + msg);
  if (userid==myId){
    li.addClass("mine");
  }
  $('#messages').append(li)
});

///채팅 입력 이벤트///
$('#chatinput').on("keyup", (key) => {
  if(key.keyCode == 13){
    socket.emit('chat message', $('#chatinput').val());
    $('#chatinput').val('');
  }
});

$('#chatbutton').click(() => {
  if($('#chatinput').val()){
    socket.emit('chat message', $('#chatinput').val());
    $('#chatinput').val('');
  }
});
///////////

//이름 변경
$('#namechange').click(()=>{
  $('#nameinputspan').show();
  $('#base').css('opacity', '0.5');
});

//이름 변경 취소
$('#namecancel').click( ()=>{
  $('#nameinput').val('');
  $('#nameinputspan').hide();
  $('#base').css('opacity', '1');
});

//이름 결정
$('#namesubmit').click( ()=>{
  if($('#nameinput').val()){
    socket.emit('change name', $('#nameinput').val());
    $('#nameinput').val('');
    $('#nameinputspan').hide();
    $('#base').css('opacity', '1');
  }
});

//화면 출력
function addVideoStream(video, stream){
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    });
    videogrid.append(video);
}

//새 유저 연결
function connectToNewUser(userId, stream){
  const call = mypeer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);//이후에 접속하는 유저 화면 추가
  });
  call.on('close', ()=>{
    video.remove();
  });
  peers[userId] = call;
}

