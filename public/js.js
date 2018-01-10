// var HOST = '66.8.168.178'
var HOST = location.host
var HOSTNAME = location.hostname
var PROTOCOL = location.protocol
var PORT = location.port
 // var socket = io(PROTOCOL+'//'+HOST);
 var socket = io(PROTOCOL+'//'+HOST, {path:'/katiesdl/socket.io'});


var ytlink = document.getElementById('ytlink')
var gobtn = document.getElementById('gobtn')
var loader = document.getElementById('loader')
var servermsg = document.getElementById('servermsg')
var timeout_interval;
var test = document.getElementById('test')

test.addEventListener('click', function(){
  get('test')
})

gobtn.addEventListener('click', function(){
  console.log(ytlink.value)
  var song = ytlink.value
  servermsg.innerText = ''
  // get(ytlink.value)
  socket.emit('getsong', song)
  loader.style.display='block'
  timeout_interval = setTimeout(function(){
    loader.style.display='none'
    servermsg.innerText = 'Sorry didnt find it'

  }, 20500)

})

socket.on('files_data', (data)=>{
  console.log(data)
  make_files_list(data)
})

socket.on('done', (name)=>{
  loader.style.display='none'
  var link = '<a id="dl_link" href="/katiesdl/getem?song='+name+'">'+name+'</a>'
  servermsg.innerHTML = link
  setTimeout(function(){
    document.getElementById('dl_link').click()
  }, 2000)


})

socket.on('percent', (percentage)=>{
  servermsg.innerText = percentage
  clearTimeout(timeout_interval)
})


function make_files_list(files_list){
  var music_library_list = document.getElementById('music_library_list')

  files_list.forEach((i)=>{
    console.log('item')
    console.log(i)
    //TODO SCOTT
    // add a class to the link? and edit the css.css file for that class

    var link = '<li><a href="/katiesdl/getem?song='+i+'">'+i+'</a></li>'
    music_library_list.innerHTML += link
  })
}


function get(name){
  console.log('get request for '+name)
  var request = new XMLHttpRequest();
   
  request.onreadystatechange = function() {
    if(request.readyState === 4) {
      // bio.style.border = '1px solid #e8e8e8';
      if(request.status === 200) { 
        // bio.innerHTML = request.responseText;
      } else {
        servermsg.innerHTML = 'An error occurred during your request: ' +  request.status + ' ' + request.statusText;
      } 
    }
  }
   
  request.open('Get', '/getem?song='+name);
   
  // btn.addEventListener('click', function() {
    // this.style.display = 'none';
    request.send();
  // });
}