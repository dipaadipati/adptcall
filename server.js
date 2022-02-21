const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const { exec } = require("child_process");
const { networkInterfaces } = require('os');

const nets = networkInterfaces();
let mylocalip = ""

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
            if(net.address.startsWith("192.168"))
				mylocalip = net.address
        }
    }
}
//%LOCALAPPDATA%`\\Google\\Chrome\\Application\\chrome.exe --unsafely-treat-insecure-origin-as-secure="http://localhost" --app="http://localhost"
exec('echo SHORTCUT /f:App.lnk /t:^%LOCALAPPDATA^%"\\Google\\Chrome\\Application\\chrome.exe" /p:"--unsafely-treat-insecure-origin-as-secure="http://'+mylocalip+'" --app=\"http://'+mylocalip+'\"" /a:c > createApp.bat', (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`Berhasil membuat file createApp.bat . Silahkan mengirim file tersebut pada device yang lain di LAN yang sama. `);
});

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

let usernames = []

/*app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})*/

app.get('/', (req, res) => {
  res.render('setname')
})

app.post('/', (req, res) => {
  res.render('room', {name: req.body.myname})
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId, usernames[userId])

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId, usernames[userId])
    })
  })
  socket.on('send-chat', (roomId, nama, pesan) => {
	socket.join(roomId)
    socket.to(roomId).broadcast.emit('chatSend', nama, pesan)
  })
  socket.on('set-name', (roomId, userId, nama) => {
	usernames[userId] = nama
  })
})

server.listen(80)