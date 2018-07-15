$(document).ready(function(){
// 样式修改
	$('#my-video').css('height',parseInt($('#my-video').css('width')) * 9 / 16);
	if(parseInt($('html').css('width')) >= 900) {
		$("#danmucontent").css('height',parseInt($('#videoplay').css('height')) - parseInt($('#guide').css('height')) - parseInt($('#videobar').css('height')));
	}
	$('.bannershow').find("img").css('width',parseInt($('#bannershow1').css('width'))).css('height',parseInt($('#bannershow1').css('height')));

	$(window).resize(function() {
		$('.bannershow').find("img").css('width',parseInt($('#bannershow1').css('width'))).css('height',parseInt($('#bannershow1').css('height')));
		$('#my-video').css('height',parseInt($('#my-video').css('width')) * 9 / 16);
		if(parseInt($('html').css('width')) >= 900) {
			$("#danmucontent").css('height',parseInt($('#videoplay').css('height')) - parseInt($('#guide').css('height')) - parseInt($('#videobar').css('height')));
		}
		var w = parseFloat($('.showpart').css('width'));
		$('.content').css('width',w);
		$('#guidecon').css('width', (len + parseInt(2)) * w);
	});

// 板块
	var segementData = []
	var guidecon = $('#guidecon');
	var len = $(segementData).length;
	
	for(var i = 0; i < len; i++) {
		var index = parseInt(i) + 2;
		$('#guide').append('<div class="segement" segement="' + index + '">' + segementData[i].name + '</div>');
		guidecon.append('<div class="content intro">' + segementData[i].content + '</div>');
	}

	var w = parseFloat($('.showpart').css('width'));
	$('.content').css('width',w);
	guidecon.css('width', (len + parseInt(2)) * w);

	$('.segement').click(function() {
		$('.segement').removeClass("nowsegem");
		$(this).addClass("nowsegem");
		var seg = -parseInt($(this).attr('segement')) * w;
		guidecon.animate({
			marginLeft: seg
		},500); 
	});

});