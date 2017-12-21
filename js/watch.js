
//获取URL GET参数
var GET = getGET();
function getGET() {
	var result = new Array();
	var strs = window.location.search.substr(1).split("&");
	for(var i in strs){
		var kv = strs[i].split('=',2);
		result[kv[0]] = kv[1];
	}
	return result;
}

app = GET['app'];
group = GET['group'];

if(app != null){
	$('#source').attr('src','/hls/' + app + '.m3u8');
	$('#source').attr('type','application/x-mpegURL');
	//<type='application/x-mpegURL'>
}


var ajaxObj;
if(app != null){
	ajaxObj = $.ajax({url:"http://live.xingkong.us/?s=/index/user/app&app=" + app,async:false,dataType: 'json'});//同步加载app
	if(ajaxObj.status == 200){
		var obj = ajaxObj.responseText;
		while(typeof(obj) == 'string')
			obj = JSON.parse(obj);
		
		ttt = obj;
		if(obj.status == 200 || obj.status == 403){

			$('title').text(obj.result.title + ' - ' + $('title').text());


		}
		
	}
	
}

if(group != null){
	ajaxObj = $.ajax({url:"http://live.xingkong.us/?s=/index/user/group&group=" + group,async:false,dataType: 'json'});//同步加载app
	
	if(ajaxObj.status == 200){
		var obj = ajaxObj.responseText;
		while(typeof(obj) == 'string')
			obj = JSON.parse(obj);

		ttt = obj;
		if(obj.status == 200 || obj.status == 403) {
			
			$('title').text(obj.title + ' - ' + $('title').text());

			apps = new Array();
			for(var i in obj.apps){
				index = obj.apps.length - i - 1;
				if(i == 0){
					$('#source').attr('src','/hls/' + obj.apps[i].appname + '.m3u8');
					$('#source').attr('type','application/x-mpegURL');
				}
				apps[obj.apps[index].appname] = obj.apps[index];
				
				var item = '<li onclick="selectStream(\'' + obj.apps[index].appname + '\');">' + obj.apps[index].title + '</li>';
				$('#m').html($('#m').html() + item);
				$('#m').css('top',$('#chooser').height());
			}
		
		}
		
	}
	
}else{
	$('#chooser').css('display','none');
}
//绑定onload事件
$(window).bind("load",function(){
	
	//video.js初始化
	player = videojs('my-video');
	videojs("my-video").ready(function(){
		player = this;
	});
	resize();
});

//定义窗口尺寸改变相应函数
$(window).resize(resize);
function resize(){
	var width = $('.vc').width() - 2;
	var height = width * (9.0 / 16);
	//$('.vc').height(height + 20);
	
	
	$('#my-video').width(width);
	$('#my-video').height(height);
 	$('#my-video_html5_api').width(width);
	$('#my-video_html5_api').height(height);
	$('.video-bar').width(width - parseInt($('.video-bar').css('padding'))*2);
	
	var btw = 	$('.vjs-big-play-button').width();
	var bth = 	$('.vjs-big-play-button').height();	
	$('.vjs-big-play-button').css("margin-left",(width - btw)/2);
	$('.vjs-big-play-button').css("margin-top",(height - bth)/2);

}


function getUrlParam(name) {
	  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");//构造一个含有目标参数的正则表达式对象
	  var r = window.location.search.substr(1).match(reg); //匹配目标参数
	  if (r != null) return unescape(r[2]); return ""; //返回参数值
}


//初始化弹幕客户端
client = new BucketClient("live.xingkong.us",80,"websocket/" + (group || app));

//弹幕客户端连接服务器
client.connect(SocketEvent);

//网络连接事件监听器
function SocketEvent(status,evt){
	switch(status){
		
		//网络连接打开时
		case 'open':
			client.sendCommand(GetDanmuCommand());
			client.sendCommand(GetOnlineListCommand());
			window.setInterval("client.sendCommand(GetOnlineListCommand())",10000); //定时 10s 刷新在线人数
			break;
			
		//弹幕到达时
		case 'onmsg':
			var obj = evt['content'];
			if(obj == null || obj == "")
				break;
			var date = new Date(evt['sendTime']);
			var time = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + (date.getDate()) + ' ' +  (date.getHours()>9?date.getHours():'0' + date.getHours()) + ':' + (date.getMinutes()>9?date.getMinutes():'0' + date.getMinutes());
			var html = '<li><span class="msgtime">'  + time + "</span><br><span class='msgbody'>" + decodeURIComponent(obj) + '</span></li>';
			$('#danmu').html(html + $('#danmu').html());
			break;
			
		//未知数据到达时
		case 'unknow':
			var obj = evt;
			$('#count').html(obj.values.count);
			break;
			
		//发生错误时
		case 'onerr':
			console.log(evt);
			client.reconnect();
			break;
	}
}

//发送弹幕
function sendMessage(){
	var str = document.getElementById("in").value;
	if(str != null && str != ""){
		
		client.sendCommand(new MessageBody(encodeURIComponent(str),"","","","","","").toCommand());
	}else{
		alert("禁止发送空弹幕！:(");
	}
		
	document.getElementById("in").value = "";
}

show = false;

function turn() {
	show = !show;
	if(show){
		$('#m').css('display','inline');
	}else{
		$('#m').css('display','none');
	}
	
	
	
}

function selectStream(appname){
	console.log(appname);

	$('#source').attr('src','/hls/' + appname + '.m3u8');
	$('#source').attr('type','application/x-mpegURL');
	$('#my-video_html5_api').attr('src','/hls/' + appname + '.m3u8');
	player.load('/hls/' + appname + '.m3u8');
	player.play();
	show = true;
	turn();
	
}