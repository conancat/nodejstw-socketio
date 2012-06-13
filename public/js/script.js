(function(){
  var app = {};
  
  var App = function(){
    this.$body = $('.chat-bd');
    this.$msgs = $('.chat-msgs');
    this.$users = $('.chat-users');
    this.$form = $('.chat-form');
  
    this.socket = io.connect();
    
  };
  
  App.prototype.init = function() {
    this.bindSocketEvents();
    this.bindViewEvents();
    this.getUsername();
  }
  
  App.prototype.getUsername = function(locals) {
    var name = prompt('What is your name?')
    
    if (name != null && name != "" ) {
      // Emit username join event
      this.socket.emit('join', name);
      
      // Set username on app
      this.username = name;
      
    } else {
      this.getUsername();
    }
    
    return this;
    
  }
  
  App.prototype.msgTmpl = function(locals){
    
    var time = moment(locals.time).format("HH:mm");
    
    var buf = [
      '<p class="chat-msg">'
      , '<time class="chat-msg-time">[' + time + ']</time>'
      , '<span class="chat-msg-user">' + locals.username + '</span>'
      , '<span class="chat-msg-bd">' + locals.msg + '</span>'
      , '</p>'
    ];
    return buf.join('');
  }
  
  App.prototype.bindSocketEvents = function() {
    
    this.socket.on('msg', this.newMessage);
    this.socket.on('system', this.systemMessage);
    
    return this;
    
  }
  
  App.prototype.bindViewEvents = function() {
    this.$form.on('submit', this.submit);
    return this;
  }
  
  App.prototype.submit = function(e) {
    e.preventDefault();
    
    var val = app.$form.find('.chat-input').val()
    
    app.socket.emit('msg', val);
    
    // Reset value
    app.$form.find('.chat-input').val('');
    
    // Append message to page directly
    app.newMessage({
      username: app.username
      , msg: val
      , time: new Date()
    });
    return this;
  }
  
  // When app receives new message, show new message
  App.prototype.newMessage = function(data) {
    var html = app.msgTmpl(data);
    app.$msgs.append(html);
    app.scrolltoBtm();
    return this;
  }
  
  // When app receives system message, output system message
  App.prototype.systemMessage = function(data) {
    var html = $(app.msgTmpl(data));
    html.addClass('chat-system-msg');
    app.$msgs.append(html);
    app.scrolltoBtm();
    return this;
  }
  
  App.prototype.scrolltoBtm = function() {
    height = app.$msgs.height();
    app.$body.scrollTop(height);
    return this;
  }
  
  // Document ready
  $(function(){
    app = window.app = new App();
    app.init();
  });
  
})();