
//Message 
function MessageBody(content, sender, receiver, type, date,time,token) {
    this.content = content;
    this.sender = sender;
    this.receiver = receiver;
    this.type = type;
    this.date = date;
    this.time = time;
    this.token = token;

    this.toMessage = function(){
        return new Message(this);
    }

    this.toCommand = function(){
        return this.toMessage().toCommand();
    }

    this.check = function(){
        
    }

}

function Message(message) {
    this.message = message;

    this.toCommand = function(){
        return new Command('danmu.DanmuCommand',this);
    }
}

//Command
function Command(command, values) {
    this.command = command;
    this.values = values;
}

//GetOnlineList
function GetOnlineListCommand(){
    return new Command("danmu.GetOnlineListCommand",new Command(null,null));
}

//GetDanmu
function GetDanmuCommand(){
    return new Command("danmu.GetDanmuCommand",new Command(null,null));
}

var builder = function Builder(){
    this.buildMessage = function(){

    }
    this.buildMessageCommand = function(){

    }
}

//BucketClient
function BucketClient(host,port,app){
    this.host = host;
    this.port = port;
	this.app = app;
    this.ws = null;
    this.callback = null;

    this.connect = function(callback){
        this.ws = new WebSocket("ws://" + this.host + ":" + this.port + "/" + this.app);
        this.callback = callback;
        this.ws.onopen = function(){
            callback('open');
        };
        this.ws.onmessage = function(evt) {
            var command = JSON.parse(evt.data);
            if(command == null){
                callback('onerr',evt);
            }else{
               switch(command['command']){
                    case null:
                        callback('onerr',evt);
                        break;
                    case 'Danmu':
                        callback('onmsg',command['values']);
                        break;
                    default :
                        callback('unknow',command);
                }
                
            }
            
        };

        this.ws.onclose = function(evt) {
            callback('oncls',evt);
        };

        this.ws.onerror = function(evt) {
            callback('onerr',evt);
        };
    }

    this.reconnect = function(){
        this.ws.close();
        this.connect(this.callback);
    }

    this.send = function(message){
        this.ws.send(message);
    }

    this.sendCommand = function(command){
        this.ws.send(JSON.stringify(command));
    }
}
