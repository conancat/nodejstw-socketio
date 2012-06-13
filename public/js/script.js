(function(){
  var app = {};
  

  // Helper function for getting cookies
  var getCookie = function(attr) {
    var cookieArr = document.cookie.split(/\=|;\s/g);
    
    if (cookieArr.indexOf(attr) !== -1) {
      return cookieArr[cookieArr.indexOf(attr)+1];
    } else {
      return "";
    }
  }
  
  // Create app object
  var App = function(){
    this.$body = $('.chat-bd');
    this.$msgs = $('.chat-msgs');
    this.$users = $('.chat-users');
    this.$form = $('.chat-form');
  
    this.socket = io.connect();
    
  };
  
  // Initialize after everything is ready
  App.prototype.init = function() {
    this.bindSocketEvents();
    this.bindViewEvents();
    this.getUsername();
  }
  
  // Get username from user with a prompt. If username clicks cancel, ask get again!
  App.prototype.getUsername = function(forced) {
    
    // Try getting username from cookie
    if (getCookie('username').length > 1 && !forced) {
      var name = getCookie('username');
    } else {
      var name = prompt('What is your name?');
    }
    
    if (name != null && name != "" ) {
      // Emit username join event
      this.socket.emit('join', name);
      
      // Set username on app
      this.username = name;
      
      document.cookie = "username=" + name;
      
    } else {
      this.getUsername();
    }
    
    return this;
    
  }
  
  // Easy templating
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
    
    app.updateUsersCount(data);
    
    return this;
  }
  
  
  // Bind socket events to functions
  App.prototype.bindSocketEvents = function() {  
    this.socket.on('msg', this.newMessage);
    this.socket.on('system', this.systemMessage);
    return this;
  }
  
  // Bind view events
  App.prototype.bindViewEvents = function() {
    this.$form.on('submit', this.submit);
    
    var self = this;
    
    $('.change-username').on('click', function(e){
      e.preventDefault();
      
      self.getUsername(true);
      
    });
    
    return this;
  }
  
  // On form submit
  App.prototype.submit = function(e) {
    e.preventDefault();
    
    // Get form value
    var val = app.$form.find('.chat-input').val()
    
    // Sanitize the message
    val = $("<p>"+val+"</p>")
      .remove('script')
      .remove('style')
      .html()
    
    // Reset value
    app.$form.find('.chat-input').val('');
    
    if (val.length < 1) return false;
    
    // Emit message
    app.socket.emit('msg', val);
    
    // Append message to page directly without waiting
    app.newMessage({
      username: app.username
      , msg: val
      , time: new Date()
    });
    return this;
  }
  
  // Scroll chat window to bottom
  App.prototype.scrolltoBtm = function() {
    height = app.$msgs.height();
    app.$body.scrollTop(height);
    return this;
  }
  
  App.prototype.updateUsersCount = function(data) {
    $('.online-users').text('Online users: ' + data.onlineUsers);
  }
  
  // Document ready
  $(function(){
    app = window.app = new App();
    app.init();
  });
  
})();