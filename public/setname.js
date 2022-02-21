let isNameExist = false
const socket = io('/')
const myPeer = new Peer()
const myAudio = document.createElement('audio')
myAudio.muted = true
const peers = {}
//var MY_NAME = $("#namaku").val()
var ROOM_ID = "MAN2"
var myId = ""
navigator.mediaDevices.getUserMedia({
  audio: true
}).then(stream => {
  addAudioStream(myAudio, stream)

  myPeer.on('call', call => {
	call.answer(stream)
	const audio = document.createElement('audio')
	call.on('stream', userAudioStream => {
	  addAudioStream(audio, userAudioStream)
	})
  })

  socket.on('user-connected', userId => {
	connectToNewUser(userId, stream)
  })
}).catch(function(err) {
  alert(err)
})

socket.on('user-disconnected', userId => {
  if (peers[userId]){
	  sendMessage('Keluar ruangan', "left", userId);
	  peers[userId].close()
  }
})

myPeer.on('open', id => {
  myId = id;
  socket.emit('set-name', ROOM_ID, id, MY_NAME)
  sendMessage('Memasuki ruangan', "right", MY_NAME);
  socket.emit('join-room', ROOM_ID, id)
})

socket.on('chatSend', (nama, pesan) => {
  sendMessage(pesan, "left", nama);
})

function connectToNewUser(userId, stream) {
  sendMessage('Memasuki ruangan', "left", userId);
  const call = myPeer.call(userId, stream)
  const audio = document.createElement('audio')
  call.on('stream', userAudioStream => {
	addAudioStream(audio, userAudioStream)
  })
  call.on('close', () => {
	audio.remove()
  })

  peers[userId] = call
}

function addAudioStream(audio, stream) {
  audio.srcObject = stream
  audio.addEventListener('loadedmetadata', () => {
	audio.play()
  })
  videoGrid.append(audio)
}

(function () {
	$(function () {
		$('.send_message').click(function (e) {
			socket.emit('send-chat', ROOM_ID, MY_NAME, getMessageText())
			return sendMessage(getMessageText(), "right", MY_NAME);
		});
		$('.message_input').keyup(function (e) {
			if (e.which === 13) {
				socket.emit('send-chat', ROOM_ID, MY_NAME, getMessageText())
				return sendMessage(getMessageText(), "right", MY_NAME);
			}
		});
	});
}.call(this)); 

$("#nama").on('change keydown paste input', function(){
	  //console.log($(this).val())
});