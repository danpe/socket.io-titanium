require('socket.io/lib/io');

(function (){
  var io = this.io;
  io.util = {
    inherit: function(ctor, superCtor){
      for(var i in superCtor.prototype){
        ctor.prototype[i] = superCtor.prototype[i];
      }
    },
    merge: function(target, additional){
      for (var i in additional){
        if (additional.hasOwnProperty(i)){
          target[i] = additional[i];
        }
      }
    },
    isArray: function(obj){
      return null != obj && 'length' in obj && 'splice' in obj && 'join' in obj;
    },
    indexOf: function(arr, item, from){
      for (var l = arr.length, i = (from < 0) ? Math.max(0, l + from) : from || 0; i < l; i++){
        if (arr[i] === item){
          return i;
        }
      }
      return -1;
    }
  };
  io.util.load = function(fn){
    return fn();
  };
  io.util.android = /android/i.test(Titanium.Platform.osname);
  io.util.ios = /iphone/i.test(Titanium.Platform.osname);
  io.util.opera = false;
})();

(function (){
  require('socket.io/lib/socket');

  var __document__ = {
    cookie: ''
  };

  var Socket = function (host, options){
    this.host = host;
    this.options = {
      secure: false,
      document: __document__,
      port: 80,
      resource: 'socket.io',
      transports: ['xhr-polling'],
      transportOptions: {
        'xhr-polling': {
          timeout: 25000 // based on polling duration default
        }
      },
      connectTimeout: 5000,
      reconnect: true,
      reconnectionDelay: 500,
      maxReconnectionAttempts: 10,
      tryTransportsOnConnectTimeout: true,
      rememberTransport: true
    };
    io.util.merge(this.options, options);
    this.connected = false;
    this.connecting = false;
    this._events = {};
    this.transport = this.getTransport();
    if (!this.transport){
      Titanium.API.error('No transport available');
    }
  };
  for(var proto in io.Socket.prototype){
    Socket.prototype[proto] = io.Socket.prototype[proto];
  }
  io.Socket = Socket;
  io.Socket.prototype._isXDomain = function (){
    return true;
  };
})();

(function (){
  require('socket.io/lib/transport');

  var frame = '~m~';
  var stringify = function(message){
    if(typeof message.substring == 'undefined'){
      return '~j~' + JSON.stringify(message);
    }
    return String(message);
  };
  io.Transport._encode = function(messages){
    var ret = '', message, messages = io.util.isArray(messages) ? messages : [messages];
    for (var i = 0, l = messages.length; i < l; i++){
      message = messages[i] === null || messages[i] === undefined ? '' : stringify(messages[i]);
      ret += frame + message.length + frame + message;
    }
    return ret;
  };
})();

(function (){
  this.window = {};

  require('socket.io/lib/transports/xhr');

  io.Transport.XHR.check = function(xdomain){
    return true;
  };
  io.Transport.XHR.prototype._request = function(url, method, multipart){
    var req = io.Transport.XHR.request(this.base._isXDomain());
    if (multipart) {
      req.multipart = true;
    }
    req.open(method || 'GET', this._prepareUrl() + (url ? '/' + url : ''));
    if (method == 'POST' && 'setRequestHeader' in req){
      req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=utf-8');
    }
    return req;
  };
  io.Transport.XHR.request = function (){
    return Titanium.Network.createHTTPClient();
  };
})();

require('socket.io/lib/transports/xhr-polling');
