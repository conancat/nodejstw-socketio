module.exports = function(app) {
  var io = require('socket.io').listen(app);
    
  io.configure(function(){
    io.set('log level', 2)
  });
  
  // Messages buffer
  var buffer = [];
  
  var pushBuffer = function(data) {
    buffer.push(data);
    
    if (buffer.length > 50) {
      buffer.unshift();
    }
    
  }
  
  
  io.sockets.on('connection', function(socket){
    
    // When user joins
    socket.on('join', function(username){
      
      // Try to get old username
      socket.get('username', function(err, oldUsername){
        
        // Set new username
        socket.set('username', username, function() {
          
          if (oldUsername && oldUsername.length > 0) {
            var msg = oldUsername + " has just renamed to " + username;
          } else {
            var msg = username + " joins the chat.";
          }
          
          var data = {
            msg: msg
            , username: 'Skynet'
            , time: new Date()
            , system: true
          };

          // Emit system message that user joins the chat
          io.sockets.emit('system', data);
          
          pushBuffer(data);

          // If there is no old userName then is new user
          if (!oldUsername) {
            // Emit messages in buffer
            for (i in buffer) {
              if (buffer[i].system) socket.emit('system', buffer[i]);
              else socket.emit('msg', buffer[i]);
            }
          }
        });
        
        
      });
    });
    
    // When user leaves
    socket.on('disconnect', function(){
      socket.get('username', function(err, username) {
        
        if (!username) return false;
        
        var data = {
          msg: username + " leaves the chat."
          , username: 'Skynet'
          , time: new Date()
          , system: true
        };
        
        // Emit system message that user leaves the chat
        socket.broadcast.emit('system', data);
        
        pushBuffer(data);
        
      })
      
    });
    
    // When user gets message
    socket.on('msg', function(msg){
      
      // Add in check if message isn't empty
      if (msg && msg.length < 1) return false;      
      
      // Get username first
      socket.get('username', function(err, username) {
        
        var data = {
          username: username
          , time: new Date()
          , msg: msg
        }
        
        // Broadcast the data
        socket.broadcast.emit('msg', data);
        
        pushBuffer(data);
        
      });
      
    });

  });
  
  
  
  return io;
  
}