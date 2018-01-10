var express = require('express');
var bodyParser = require('body-parser');
var cmd=require('node-cmd');
var exec = require('child_process').exec
var fs = require('fs');

var app = express();
var server = require('http').Server(app);

var io = require('socket.io')(server);

app.use(express.static('public'));

// app.use(bodyParser.json()); // for parsing application/json
// app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*")
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
//   next()
// })
app.set('publicRoot', {root: __dirname + '/public/'})

app.get('/', function(req, res){
  console.log('katiesdl index hit')

  res.sendFile('index.html', app.get('publicRoot'), function (err) {
      if (err) {
        console.log(err)
      } else {
        console.log('Sent:');
      }
    });

})

io.on('connection', (socket)=>{
  console.log('socket connection')

  socket.on('getsong', (song)=>{
    console.log('getsong socket event '+song)
    var song_name;
    if(song.indexOf('\'') !== -1 || song.indexOf(';') !== -1){
      console.log('bad')
    }else{
      console.log(song)
      var youtubedl = exec('youtube-dl -v --audio-format mp3 '+song)
      youtubedl.stdout.on('data', function(stdout){
        console.log(stdout)
        // var stdout = stdout.split('\n')
        // var stdout = stdout[0].split(' ')
        // console.log(stdout)
        if(stdout.startsWith('\r[download]')){
          console.log('downloading')
          // console.log(stdout)
          stdout = stdout.split(' ')
          var percent = stdout[1]
          console.log(percent)
          socket.emit('percent', percent)
          // console.log('0 '+stdout[0])
          // console.log('1 '+stdout[1])
          // console.log('2 '+stdout[2])
          // console.log('3 '+stdout[3])
        }else if(stdout.startsWith('[ffmpeg]')){
          stdout = stdout.split('/')
          console.log('0 '+stdout[0])
          console.log('1 '+stdout[1])
          console.log('2 '+stdout[2])
          console.log('3 '+stdout[3])
          console.log('4 '+stdout[4])
          console.log('5 '+stdout[5])
          console.log('6 '+stdout[6])
          console.log('7 '+stdout[7])
          console.log('8 '+stdout[8])
          song_name = stdout[7]
        }else if(stdout.startsWith('Deleting original')){
          console.log('we done')

          socket.emit('done', song_name)
        }
        // if(stdout[0] === '\r[download]'){
        //   console.log('donloaded')
        //   console.log('0 '+stdout[0])
        //   console.log('1 '+stdout[1])
        //   console.log('2 '+stdout[2])
        //   console.log('3 '+stdout[3])
        //   console.log('4 '+stdout[4])
        // }
      })


    }
  })

})

app.get('/getem',(req, res)=>{
  var mime = require('mime');

  console.log('downlaod this sone')
  // console.log('song: '+req.query.song)
  var song = req.query.song
  console.log(song)
  var file = __dirname + '/public/downloads/'+song;
  console.log(file)
  var mimetype = mime.lookup(file);
  console.log(mimetype)

  res.setHeader('Content-disposition', 'attachment; filename='+song);
  res.setHeader('Content-type', mimetype);

  var filestream = fs.createReadStream(file);
  filestream.pipe(res);

  // res.attachment(file)
  // res.download(file, song, (err)=>{
  //   if(err){console.log(err)}
  // })



  // cmd.get('youtube-dl '+req.query.url)

})


var port = 44445
server.listen(port)
console.log('katiesdl listening on '+port)