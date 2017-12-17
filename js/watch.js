
//获取URL GET参数
var GET = getGET();
function getGET() {
	var result = new Array();
	var strs = window.location.search.substr(1).split("&");
	for(var i in strs){
		var kv = strs[i].split('=',2);
		if(kv != null && kv.length >= 2) {
			if(result[kv[0]] == null){
				result[kv[0]] = new Array();
			}
			result[kv[0]].push(kv[1]);
		}
	}
	return result;
}

//获取app数组
apps = GET['app'];
if(apps != null && apps.length > 0){
	$('#source').attr('src','/hls/' + apps[0] + '.m3u8');
	$('#source').attr('type','application/x-mpegURL');
} 
apps['data'] = new Array();
//绑定onload事件
$(window).bind("load",function(){
	resize();
	
	for(var index in apps) {
		i = index;
		$.ajax({
			url: "http://live.xingkong.us/?s=/index/user/app&app=" + apps[i],
			success: function(obj){
				var res = obj;
				if(typeof(obj) != 'object')
					res = JSON.parse(res);
				else
					res = obj;

				
				if(res.status == 200 || res.status == 403){

					if(res.result.appname == apps[0]){
						$('title').text(res.result.title + ' - ' + $('title').text());

						//video.js初始化
						player = videojs('my-video');
						videojs("my-video").ready(function(){
							player = this;
						});
					}
					apps['data'][res.result.appname] = res.result;
					var item = '<li onclick="selectStream(\'' + res.result.appname + '\');">' + res.result.title + '</li>';
					$('#m').html($('#m').html() + item);
					$('#m').css('top',-$('#m').height() - $('#chooser').height());
				}

			},
			dataType: 'json'});
	}
	
})

//定义窗口尺寸改变相应函数
$(window).resize(resize);
function resize(){
	var width = $('.vc').width() - 2;
	var height = width * (9.0 / 16);
	//$('.vc').height(height + 20);
	
	
	$('#my-video').width(width);
	$('#my-video').height(height);
/* 	$('#my-video_html5_api').width(width);
	$('#my-video_html5_api').height(height); */
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
client = new BucketClient("live.xingkong.us",80,"websocket/" + getUrlParam("app"));

//弹幕客户端连接服务器
client.connect(SocketEvent);

//网络连接事件监听器
function SocketEvent(status,evt){
	switch(status){
		
		//网络连接打开时
		case 'open':
			client.sendCommand(GetDanmuCommand());
			client.sendCommand(GetOnlineListCommand());
			break;
			
		//弹幕到达时
		case 'onmsg':
			var obj = evt['content'];
			if(obj == null || obj == "")
				break;
			var date = new Date(evt['sendTime']);
			var time = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + (date.getDate()) + ' ' +  (date.getHours()>9?date.getHours():'0' + date.getHours()) + ':' + (date.getMinutes()>9?date.getMinutes():'0' + date.getMinutes());
			var html = '<li>'  + time + "<br>" + obj + '</li>';
			$('#danmu').html(html + $('#danmu').html());
			break;
			
		//未知数据到达时
		case 'unknow':
			var obj = evt;
			$('#count').html(obj.values.count);
			break;
			
		//发生错误时
		case 'onerr':
			console.log(evt)
			break;
	}
}

//发送弹幕
function sendMessage(){
	var str = document.getElementById("in").value;
	if(str != null && str != ""){
		client.sendCommand(new MessageBody(str,"","","","","","").toCommand());
	}else{
		alert("禁止发送空弹幕！:(");
	}
		
	document.getElementById("in").value = "";
}

