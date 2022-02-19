const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer()
const myAudio = document.createElement('audio')
myAudio.muted = true
const peers = {}
var myId = ""
var Message = function (arg) {
	this.text = arg.text, this.message_side = arg.message_side, this.message_name = arg.message_name;
	this.draw = function (_this) {
		return function () {
			var $message;
			$message = $($('.message_template').clone().html());
			$message.addClass(_this.message_side).find('.text').html(_this.text);
			var name = $($($message.children()[1]).children()[0])
			if(this.message_side=="left")
				name.css("float", "none")
			name.text(this.message_name);
			$('.messages').append($message);
			return setTimeout(function () {
				return $message.addClass('appeared');
			}, 0);
		};
	}(this);
	return this;
};
var getMessageText, message_side, sendMessage;
message_side = 'right';
getMessageText = function () {
	var $message_input;
	$message_input = $('.message_input');
	return $message_input.val();
};
sendMessage = function (text, side, name) {
	var $messages, message;
	if (text.trim() === '') {
		return;
	}
	$('.message_input').val('');
	$messages = $('.messages');
	message_side = side;
	message_name = name;
	message = new Message({
		text: text,
		message_side: message_side,
		message_name: message_name
	});
	message.draw();
	return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
};
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
  alert("Izinkan Akses Mikrofon untuk melanjutkan")
})

socket.on('user-disconnected', userId => {
  if (peers[userId]){
	  sendMessage('Keluar ruangan', "left", userId);
	  peers[userId].close()
  }
})

myPeer.on('open', id => {
	myId = id;
  sendMessage('Memasuki ruangan', "right", id);
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
			socket.emit('send-chat', ROOM_ID, myId, getMessageText())
            return sendMessage(getMessageText(), "right", myId);
        });
        $('.message_input').keyup(function (e) {
            if (e.which === 13) {
				socket.emit('send-chat', ROOM_ID, myId, getMessageText())
                return sendMessage(getMessageText(), "right", myId);
            }
        });
    });
}.call(this)); 

$("#nama").on('change keydown paste input', function(){
      //console.log($(this).val())
});