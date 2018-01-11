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
  socket.on('disconnect', ()=>{
    console.log(socket.id+' disconected')
  })
  socket.on('discon', ()=>{
    console.log(socket.id+' disconected')
  })
  console.log('socket connection')
  //get the files list
  fs.readdir(__dirname+'/public/downloads',(err, files)=>{
    if(err){
      console.log(err)
    }else{
      console.log(files)
      socket.emit('files_data', files)
    }
  })

  

  socket.on('getsong', (song)=>{
    if(!song)return
    console.log('getsong socket event '+song)
    var song_name;
    var download_data;
    if(song.indexOf('\'') !== -1 || song.indexOf(';') !== -1){
      console.log('bad')
    }else{
      console.log(song)
      // var youtubedl = exec('youtube-dl -v --audio-format mp3 '+song)
      var youtubedl = exec('youtube-dl -v '+song)
      youtubedl.stdout.on('data', function(stdout){
        var stdout = stdout.trim()
        console.log(stdout)
        // var stdout = stdout.split('\n')
        // var stdout = stdout[0].split(' ')
        // console.log(stdout)
        if(stdout.startsWith('[download]')){
          console.log('downloading')
          // console.log(stdout)
          stdout = stdout.split(' ')
          var percent, total
          if(stdout[2].indexOf('of') !== -1){
            percent = stdout[1]
            total = stdout[3]
          }else{
            percent = stdout[2]
            total_size = stdout[4]


          }
          download_data = {
            percent,total_size
          }

          console.log(percent)
          socket.emit('download_data', download_data)
          console.log('0 '+stdout[0])
          console.log('1 '+stdout[1])
          console.log('2 '+stdout[2])
          console.log('3 '+stdout[3])
          console.log('4 '+stdout[4])
          console.log('5 '+stdout[5])
          console.log('6 '+stdout[6])
          console.log('7 '+stdout[7])
          console.log('8 '+stdout[8])
          console.log('9 '+stdout[9])
          console.log('10 '+stdout[10])
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
          // song_name = stdout[6]
          song_name = stdout[7]
        }else if(stdout.startsWith('Deleting original')){
          console.log('we done')
          run_ffmpeg(song_name, socket, download_data.total_size)

          // var youtubedl = exec('youtube-dl -v '+song)
          // youtubedl.stdout.on('data', (d)=>{
          //   console.log(d)
          // })




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
  var song = req.query.song
  console.log(song)
  if(!song || song =='null')return
  var mime = require('mime');

  console.log('downlaod this sone')
  // console.log('song: '+req.query.song)
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



function run_ffmpeg(song_name, socket, total_size) {
  // var song_name = song_name
  // song_name = escape_for_cmdline(song_name)
  var mp3 = song_name.substring(song_name.lastIndexOf('.'), -1)+'.mp3'
  console.log('lets ffmpeg this:  '+mp3)
  console.log('song_name '+ song_name )
  var command = "ffmpeg -v 48 -i '"+__dirname+"/public/downloads/"+song_name+"' '"+__dirname+"/public/downloads/"+mp3 +"' -y  && rm '"+__dirname+"/public/downloads/"+song_name+"' && echo 'ALLDONE'"
  console.log(command)

  var ffmpeg = exec(command)
  ffmpeg.stdout.on('data', function(data){
    console.log('stdout')
    console.log(data)
    if(data==='ALLDONE\n'){
      console.log('emit all done')
      socket.emit('done', mp3)


    }    
    console.log(data.split(' '))

  })
  ffmpeg.stderr.on('data', function(data){
    console.log('err')
    // console.log(data)
    data = data.split(' ')
    var ffmpeg_size;
    // console.log('0 '+data[0])
    // console.log('1 '+data[1])
    // console.log('2 '+data[2])
    // console.log('3 '+data[3])
    // console.log('4 '+data[4])
    // console.log('5 '+data[5])
    // console.log('6 '+data[6])
    // console.log('7 '+data[7])
    // console.log('8 '+data[8])
    // console.log('9 '+data[9])
    // console.log('10 '+data[10])
    // console.log('11'+data[11])
    // console.log('12 '+data[12])
    // if(data.split(' '))
    if(data[0].indexOf('size=')!=-1){
      // if(data[4])
      console.log('4 '+data[4])
      console.log('typeof '+typeof(data[4]))
      console.log(data[4]==='')
      if(data[4]===''){
        ffmpeg_size=data[5]
      }else{
        ffmpeg_size=data[4]

      }
      var conversion_data = {
        total_size, ffmpeg_size
      }
      console.log('size: '+ffmpeg_size)
      socket.emit('conversion_data',  conversion_data)

    }

  })
}

function escape_for_cmdline(string){
  var esc_string='\r\n\t `~!@#$%^&*()_=+\|]}[{\'";:'
  esc_string = esc_string.split('')
  esc_string.forEach(function(i){
    // console.log(i)
    var re = new RegExp('\\'+i,"g")
    string = string.replace(re, '\\'+i)
  })

  return string



}