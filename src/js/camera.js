window.onload = function() {
	initPage();
};

function initPage() {
	//打印摄像头
	InitDevs();
	OpenCamera();
	doRotate();
}


function navigateTo(url) {
	// 可以添加额外逻辑，如记录日志、验证等
	window.location.href = url;
}