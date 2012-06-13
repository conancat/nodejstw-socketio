module.exports = function(app) {
  var io = require('socket.io').listen(app);
  
  io.configure(function(){
    io.set('log level', 2)
  });
  
  
  io.sockets.on('connection', function(socket){
    
    // When user joins
    socket.on('join', function(username){
      socket.set('username', username, function() {
        var data = {
          msg: username + " joins the chat."
          , username: 'Skynet'
          , time: new Date()
        };
        
        io.sockets.emit('system', data);
      });
    });
    
    // When user leaves
    socket.on('disconnect', function(){
      socket.get('username', function(err, username) {
        
        var data = {
          msg: username + " leaves the chat."
          , username: 'Skynet'
          , time: new Date()
        };
        
        io.sockets.emit('system', data);
      })      
    });
    
    socket.on('msg', function(msg){
      
      if (msg.length < 1) return false;      
      
      socket.get('username', function(err, username) {
        var data = {
          username: username
          , time: new Date()
          , msg: msg
        }
        
        socket.broadcast.emit('msg', data);
        
      });
      
    });

  });
  
  
  
  return io;
  
}