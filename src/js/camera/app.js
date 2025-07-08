var deviceIndex = 0;
var resolutionIndex = 0;
// 数组存储拍照图片
var Arraydata = new Array();
// 是否纠偏
var isdeskew = 0;
var zoomScaleVal;
var sourceDevHeight, sourceDevWidth;
var myDiv;
var scanResElement;
var selectionBox;
const base64Header = 'data:image/jpg;base64,';
var isSelecting = false;
var productSelectionRecordState = false
// 新增加一个变量，防止刚刚刷新浏览器时立刻开始框选造成错误
var allowselect = false;
var x1, x2, y1, y2;
var cx1, cy1, cx2, cy2;
var res_left, res_top, res_right, res_bottom;
var strData = []
var idcardPhoto; // 用于保存人脸比对base64
var photoBase64; // 用于保存现场拍照人脸比对base64

var imageForCombin; // 用于图片合成的测试
function onResiveServerMsg(data) {
	let name = data.function
	const msg = name == 'InitDevs' ?
		'设备初始化' : name == 'DeinitDevs' ?
		'反设备初始化' : name == 'CloseCamera' ?
		'关闭摄像头' : name == 'GetResolutionCount' ?
		'获取设备分辨率数量' : name == 'GetDeviceCount' ?
		'获取设备个数' : name == 'ScanImage' ? '拍照' : name == 'OpenCamera' ? '打开摄像头' : name == 'SelectImage' ? '框选' : name ==
		'GetResolution' ? '获取设备分辨率' : name==='SetDeviceRotate'?'旋转':''
	var str = isdeskew == 0 ? '关闭' : '开启'
	if (data.ret >= 0) {
		switch (name) {
			case "InitDevs":
				GetDeviceCount()
				GetResolution()
				break
			case "ScanPDF":
				downloadPDF(data.value, '合成pdf', '00001.pdf')
				break
			case "CreatOfdFromImageOrBase64":
				downloadOFDFromBase64(data.value, '00002.ofd')
				break
			case "GetDeviceName":
				console.log(data)
				log('设备型号:' + data.value)
				break
			case "OpenCamera":
				OpenCameraSate = true;
			case "ImageCallback":
				if (OpenCameraSate) {
					var videoimg = document.getElementById("chrome_img"); // 摄像头
					videoimg.src = "data:image/jpeg;base64," + data.value
					// var device = document.getElementById("device")
					initImgMouseleave()
				}
				break
			case "SetDeskew":
				if (oneSate) {
					oneSate = false
				} else {
					log(str + '纠偏成功')
				}
				break
			case "GetResolutionCount":
				log("设备分辨率数量:" + data.value + '个')
				break
			case "GetDeviceCount":
				// 设备个数
				var __device = document.getElementById("device");
				__device.innerHTML = ''
				for (let i = 0; i < data.value; i++) {
					// checked
					console.log(deviceIndex)
					if (deviceIndex == i) {
						__device.add(new Option("摄像头" + (i + 1), '', false, true));
					} else {
						__device.add(new Option("摄像头" + (i + 1)));
					}
				}
				log("设备个数:" + data.value + '个')
				break
			case "GetResolution":
				var resolution = document.getElementById("resolution");
				resolution.innerHTML = ''
				strData = data.value.split("|");
				var addOption = function(select, txt, value, num) {
					if (resolutionIndex == value) {
						select.add(new Option(txt, value, false, true), num);
					} else {
						select.add(new Option(txt, value), num);
					}

				};
				for (var i = 0; i < strData.length; i++) {
					addOption(resolution, strData[i], i);
				}
				log("获取分辨率成功" + data.value)
				break
			case "ReadIdCard":
				if (0 == data.ret) {
					log("姓名:" + data.name)
					log("性别:" + data.sex)
					log("民族:" + data.nation)
					log("身份证号:" + data.number)
					log("签发机关:" + data.issue)
					log("有效期限开始:" + data.begin)
					log("有效期限结束:" + data.end)
					log("地址:" + data.address)
					log("出生日期:" + data.birth)
					addImgDiv(data.photo);
                    addImgDiv(data.photofront);
                    addImgDiv(data.photoback);
					idcardPhoto = data.photo;
				}
				break
            case "ReadBankNo":
                if(1== data.ret)
                {
                    log("卡号:" + data.BankNo)
                }
                else{
                    log("读卡初始化失败")
                }
            break
			case "PrinterString":
                 if (0 == data.ret) {
					log("打印完成")
				}
				break
			case "DetectFaceLive":
				if (0 == data.ret) {
					log("是否活人：:" + data.isLive)
				}
				break
			case "DetectFaceLiveResult":
				if (data.ret_live == 1) {
					log("检测到活体人脸")
				} else
					log("没有检测到活体人脸")
				break
			case "StartAutoDetectScan":
				if (0 == data.ret) {
					log("开始自动检测拍照，请放好拍摄物")
				}
				break
			case "StopAutoDetectScan":
				if (0 == data.ret) {
					log("检测停止自动拍照")
				}
				break
			case "DetectAutoScanResult":
				if (data.ret == 1) {
					addImgDiv(data.Imagebase64);
					log("检测到目标，并采集完成")
				} else
					log("没有采集成功")
				break
			case "composImageFrombase64":
				if (0 == data.ret) {
					addImgDiv(data.value);
					log("合成成功")
				}
				break
            case "flattenScan":
				if (data.ret == 1) {
					addImgDiv(data.LeftImageBase64);
                    addImgDiv(data.RightImageBase64);
					log("采集成功")
				}
				break
			case "ScanImage":
				addImgDiv(data.value);
				imageForCombin = data.value;
				break
			case "SelectImage":
				if (data.value) {
					addImgDiv(data.value);
					// Arraydata.push(data.value);
				}
				break
			default:
				log(msg + '成功')
		}
		/*if(name == 'InitDevs'){
			GetDeviceCount()
			GetResolution()
		}else if(name == 'ScanPDF'){
			downloadPDF(data.value, '合成pdf', '00001.pdf')
			return
		}else if(name == 'GetDeviceName'){
			console.log(data)
			log('设备型号:'+data.value)
			return;
		}if(name == 'OpenCamera' || name == 'ImageCallback'){
			if(name == 'OpenCamera'){
				OpenCameraSate = true;
			}
			if(OpenCameraSate){
				var videoimg = document.getElementById("chrome_img"); // 摄像头
				videoimg.src = "data:image/jpeg;base64," + data.value
				// var device = document.getElementById("device")
				initImgMouseleave()
			}
		}else if(name == 'SetDeskew'){
			if(oneSate){
				oneSate = false
			}else {
				log(str+'纠偏成功')
			}
		}else if(name == 'GetResolutionCount'){
			log("设备分辨率数量:"+data.value+'个')
		}else if(name == 'GetDeviceCount'){
			// 设备个数
			var __device = document.getElementById("device");
			__device.innerHTML = ''
			for(let i = 0; i<data.value; i++){
				// checked
				console.log(deviceIndex)
				if(deviceIndex == i){
					__device.add(new Option("摄像头"+(i+1),'',false,true));
				}else {
					__device.add(new Option("摄像头"+(i+1)));
				}
			}
			log("设备个数:"+data.value+'个')
		}else if(name == 'GetResolution'){
			console.log(data.value)
			var resolution = document.getElementById("resolution");
			resolution.innerHTML = ''
			strData = data.value.split("|");
			var addOption = function(select, txt, value, num) {
				if(resolutionIndex == value){
					select.add(new Option(txt, value,false,true), num);
				}else {
					select.add(new Option(txt, value), num);
				}

			};
			for (var i = 0; i < strData.length; i++) {

				addOption(resolution, strData[i], i);
			}
		}else{
			log(msg+'成功')
		}
		if(name == 'ScanImage' || name == 'SelectImage'){
			if(data.value){
				addImgDiv(data.value);
				// Arraydata.push(data.value);
			}
		}*/
	} else if (data.ret == -2) {
		if (name == 'SetDeskew') {
			log(str + '纠偏失败')
		} else {
			log(msg + '失败')
		}
	} else {
		log(msg + '失败')
	}
}
function downloadOFDFromBase64(base64Data, fileName = '00002.ofd') {
    // 将Base64数据转换为二进制数据
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    // 创建Blob对象
    const blob = new Blob([bytes], { type: 'application/ofd' });

    // 创建下载链接
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;

    // 触发点击事件
    document.body.appendChild(link);
    link.click();

    // 清理
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }, 100);
}
// 切换摄像头
function selectDevice(e) {
	var selectElement = document.getElementById("device");
	var selectedIndex = selectElement.selectedIndex;
	if(deviceIndex === selectedIndex){
		return
	}
	// todo 这里先关闭，再打开
	CloseCamera();// 先关闭摄像头，再打开摄像头
	// 延迟500
	setTimeout(() => {
		deviceIndex = selectedIndex
		resolutionIndex = 0 //切换摄像头后，分辨率默认为下标值0
		OpenCamera()
		GetResolution()
	}, 300);

}
// 切换分辨率
function selectResolution() {
	var selectElement = document.getElementById("resolution");
	var selectedIndex = selectElement.selectedIndex;
	resolutionIndex = selectedIndex
	OpenCamera()
}
// 设备初始化
function InitDevs() {
	sendMsg({
		'function': 'InitDevs'
	})
}
// 反设备初始化
function DeinitDevs() {
	sendMsg({
		'function': 'DeinitDevs'
	})
	document.getElementById('rotateId').selectedIndex = 0
}
//点击打开摄像头按钮
// oparam1: device:设备索引，一般默认0为主头(多摄像头情况下)，单摄像头只能填0。resolution:分辨率索引，0为最大分辨率。datacallback:是否开启数据推送(回调函数)。
function OpenCamera() {
	const data = {}
	sendMsg({
		'function': 'OpenCamera',
		'device': deviceIndex,
		'resolution': resolutionIndex,
		'datacallback': true
	})
}
// 点击按钮关闭摄像头
function CloseCamera() {
	sendMsg({
		'function': 'CloseCamera',
		'device': deviceIndex
	})
	doInitCamera()
	/*	var videoimg = document.getElementById("chrome_img"); // 摄像头
		videoimg.src = ""*/
}
// 点击按钮获取分辨率个数
function GetResolutionCount() {
	sendMsg({
		'function': 'GetResolutionCount',
		'device': deviceIndex
	})
}
// 点击按钮获取摄像头个数
function GetDeviceCount() {
	sendMsg({
		'function': 'GetDeviceCount'
	})
}
// 点击按钮是否开启纠偏
function SetDeskew() {
	isdeskew = isdeskew === 0 ? 1 : 0;
	document.getElementById('deskew').textContent = isdeskew === 0 ? '开启纠偏' : '关闭纠偏'
	sendMsg({
		'function': 'SetDeskew',
		isdeskew: isdeskew
	})
	// 纠偏 状态下，不能使用框选功能
	if (isdeskew === 0) {
		// 这里关闭
		// SynthesizePDFId
		document.getElementById('SelectImageId').style.background = '#409eff'
	} else {
		// 这里打开
		// style="background: gray"
		document.getElementById('SelectImageId').style.background = 'gray'
	}

}

function stopDeskew() {
	sendMsg({
		'function': 'SetDeskew',
		isdeskew: 0
	})
}
// 点击按钮拍照
function ScanImage() {
	// 参数imagepath为空的话返回base64，也可设置为本地路径，如：C:\\Users\\Administrator\\Desktop\\examples\\image\\123.png
	//C:\\Users\\Administrator\\Desktop\\examples\\image\\123.png
	sendMsg({
		'function': 'ScanImage',
		imagepath: '',
		colorize: 0,
		type: true
	})
}
function doRotate(){
	var rotate = 0;
	var index = document.getElementById('rotateId').selectedIndex;
	switch (index){
		case 0:
			rotate = 0;
			break
		case 1:
			rotate = 90;
			break
		case 2:
			rotate = 180;
			break
		case 3:
			rotate = 270;
			break
	}
	sendMsg({
		'function': 'SetDeviceRotate',
		'index': deviceIndex,
		angle: rotate
	})
}
//获取设备型号
function GetDeviceName() {
	sendMsg({
		'function': 'GetDeviceName',
		'device': deviceIndex
	})
}
// 获取设备分辨率
function GetResolution() {
	sendMsg({
		'function': 'GetResolution',
		'device': deviceIndex
	})
}
// 读身份证
function ReadIDCard() {
	sendMsg({
		'function': 'ReadIdCard'
	})
}
//打印
function Printer() {

    sendMsg({
		'function': 'PrinterString',
		'titledata':"洪山区政务平台  ",
        'name':"姓名：张三丰  ",
        'jobdata':"办理事项，工商认定，劳动人力  ",
        'numbledata':"  排队号码：A0011  ",
        'windownumbledata':"办理窗口 A01 A02  ",
        'waitnum':"等候人数：1人  ",
		'QRstringdata': "https://dhgxshzl.gov.cn/#/reservation/NN+EfhlpF1BKzpx1WFb0y7WKfcHDXPPFWUiG2NgQv38="
	})
}

//打印
function Printer1() {

    sendMsg({
		'function': 'Printer'

	})
}


//图片 合成 传两个base64

function combinImage() {
	sendMsg({ 'function': 'composImageFrombase64', 'base64_1': imageForCombin, 'base64_2': imageForCombin,'imagepath':'', 'type': 0, 'space':5})
}


// 停止自动检测拍照
function StartAutoScan() {
	sendMsg({
		'function': 'StartAutoDetectScan'
	})
}

// 开始自动检测拍照
function StoptAutoScan() {
	sendMsg({
		'function': 'StopAutoDetectScan'
	})
 }

    // 读银行卡
function ReadBankCard() {
	sendMsg({
		'function': 'ReadBankNo'
	})
}

    // 展平拍照
function flattenScan() {
    sendMsg({ 'function': 'flattenScan', 'flag':1 ,'LeftImagePath':"D://left.bmp"  , 'RightImagePath': "D://Righ.bmp" })
}



var imgMouseleave = false
var imgMouseleaveSate = false;

function initImgMouseleave() {
	if (!imgMouseleave) {
		let k = document.getElementById("chrome_img")
		// 监听鼠标移出容器事件
		k.addEventListener('mouseleave', (e) => {
			console.log('鼠标移出容器范围');
			// 执行隐藏提示、还原样式等操作
			imgMouseleaveSate = true;
			if (isSelecting) {
				isSelecting = false
				// 这里直接取消数据
				selectionBox.style.display = "none";
				selectionBox.style.left = "0";
				selectionBox.style.top = "0";
				selectionBox.style.width = "0";
				selectionBox.style.height = "0";
			}
		});
		imgMouseleave = true
	}

}

// 点击按钮开始框选
function SelectImage() {
	if (isdeskew == 1) return
	imgMouseleaveSate = false;
	productSelectionRecordState = true;
	myDiv = document.getElementById("Chrome")
	scanResElement = document.getElementById("scanRes")
	selectionBox = document.getElementById("selection-box")
	// 鼠标放下
	myDiv.onmousedown = function(e) {
		if (productSelectionRecordState) {
			x1 = e.offsetX;
			y1 = e.offsetY;
			cx1 = e.clientX;
			cy1 = e.clientY;
			productSelectionRecordState = false
		}
		isSelecting = true;
		console.log("鼠标放下：x1" + x1 + "y1:" + y1 + "cx1:" + cx1 + "cy1:" + cy1)
		e.preventDefault();
	}

	// 鼠标移动
	myDiv.onmousemove = function(e) {
		if (isSelecting) {
			x2 = e.offsetX;
			y2 = e.offsetY;
			cx2 = e.clientX;
			cy2 = e.clientY;
			selectionBox.style.display = "block";
			if (cx1 < cx2 && cy1 < cy2) {
				selectionBox.style.left = cx1 + "px";
				selectionBox.style.top = cy1 + "px";
				selectionBox.style.width = (cx2 - cx1) + "px";
				selectionBox.style.height = (cy2 - cy1) + "px";
			} else if (cx1 > cx2 && cy1 > cy2) {
				selectionBox.style.left = cx2 + "px";
				selectionBox.style.top = cy2 + "px";
				selectionBox.style.width = (cx1 - cx2) + "px";
				selectionBox.style.height = (cy1 - cy2) + "px";
			} else if (cx1 > cx2 && cy1 < cy2) {
				selectionBox.style.left = cx2 + "px";
				selectionBox.style.top = cy1 + "px";
				selectionBox.style.width = (cx1 - cx2) + "px";
				selectionBox.style.height = (cy2 - cy1) + "px";
			} else {
				selectionBox.style.left = cx1 + "px";
				selectionBox.style.top = cy2 + "px";
				selectionBox.style.width = (cx2 - cx1) + "px";
				selectionBox.style.height = (cy1 - cy2) + "px";
			}
		}
	}
	// 鼠标弹起
	myDiv.onmouseup = function(e) {
		productSelectionRecordState = true
		if (isSelecting) {
			isSelecting = false;
			selectionBox.style.display = "none";
			x2 = e.offsetX
			y2 = e.offsetY
			cx2 = e.clientX
			cy2 = e.clientY
			console.log("鼠标弹起：x2" + x2 + "y2:" + y2 + "cx2:" + cx2 + "cy2:" + cy2)
			res_left = Math.round(x1);
			res_top = Math.round(y1);
			res_right = Math.round(x2);
			res_bottom = Math.round(y2);

			if (res_left === res_right || res_top === res_bottom) {
				alert('框选范围过小，请重新框选');
				return;
			}
			if (res_left > res_right) {
				var k = res_left;
				res_left = res_right;
				res_right = k;
			}
			if (res_bottom < res_top) {
				var tb = res_bottom;
				res_bottom = res_top;
				res_top = tb;
			}
			console.log(res_left, res_top, res_right, res_bottom)
			if (res_left) {
				// 参数imagepath为空的话返回base64，也可设置为本地路径，如：C:\\Users\\Administrator\\Desktop\\examples\\image\\123.png
				// viewWidth:视频流显示的宽,viewHeight:显示的高
				let imgDom = document.getElementById("chrome_img")
				let viewWidth = imgDom.clientWidth
				let viewHeight = imgDom.clientHeight
				sendMsg({
					'function': 'SelectImage',
					imagepath: '',
					left: res_left,
					top: res_top,
					right: res_right,
					bottom: res_bottom,
					viewWidth: viewWidth,
					viewHeight: viewHeight
				})
			} else {
				alert('框选出错，请重新框选');
			}
		}
		e.preventDefault();
	}
}
var imgList = [];
var imgIds = []
var OpenCameraSate = false;
doInitCamera()

function doInitCamera() {
	OpenCameraSate = false;
	var videoimg = document.getElementById("chrome_img"); // 摄像头
	videoimg.src = ""
}

function doGenerateTimestampId() {
	return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function SynthesizePDF() {
	if (imgIds.length == 0) {
		if (imgList.length === 0) {
			alert('请先拍照，再在缩略图中选择待合成的照片')
		} else {
			alert('请先缩略图中选择待合成的照片')
		}
		return
	}
	// 合成pdf
	let imagedata = []
	for (let i = 0; i < imgList.length; i++) {
		let item = imgList[i]
		if (imgIds.indexOf(item.id) > -1) {
			imagedata.push(item.data)
		}
	}
	sendMsg({
		'function': 'ScanPDF',
		'imagedata': imagedata,
		'pdfpath': ''
	})
	// console.log(imagedata)
	//   downloadPDFFile(data.documentBase64, '合成pdf', '00001.pdf')
}
function SynthesizeOFD() {
	if (imgIds.length == 0) {
		if (imgList.length === 0) {
			alert('请先拍照，再在缩略图中选择待合成的照片')
		} else {
			alert('请先勾选缩略图中选择待合成的照片')
		}
		return
	}
	// 合成pdf
	let imagedata = []
	for (let i = 0; i < imgList.length; i++) {
		let item = imgList[i]
		if (imgIds.indexOf(item.id) > -1) {
			imagedata.push(item.data)
		}
	}
	sendMsg({
		'function': 'CreatOfdFromImageOrBase64',
		'imagedata': imagedata,
		'pdfpath': ''
	})
	// console.log(imagedata)
	//   downloadPDFFile(data.documentBase64, '合成pdf', '00001.pdf')
}

function downloadPDF(base64, fileName, fileType) {
	if (!base64 || !fileName || !fileType) {
		return
	}
	var bf = base64ToBlob(base64, 'pdf')
	if (bf) {
		downloadExportFile(bf, fileName, fileType)
	}
}

function downloadExportFile(blob, fileName, fileType) {
	var downloadElement = document.createElement('a');
	var href = blob;
	if (typeof blob == 'string') {
		downloadElement.target = '_blank';
	} else {
		href = window.URL.createObjectURL(blob); //创建下载的链接
	}
	downloadElement.href = href;
	downloadElement.download = fileName + '.' + fileType; //下载后文件名
	document.body.appendChild(downloadElement);
	downloadElement.click(); //触发点击下载
	document.body.removeChild(downloadElement); //下载完成移除元素
	if (typeof blob != 'string') {
		window.URL.revokeObjectURL(href); //释放掉blob对象
	}
}

function base64ToBlob(urlData, type) {
	if (urlData.indexOf(',') < 1) {
		urlData = 'data:application/pdf;base64,' + urlData
	}
	var arr = urlData.split(',');
	var array = arr[0].match(/:(.*?);/);
	var mime = (array && array.length > 1 ? array[1] : type) || type;
	// 去掉url的头，并转化为byte
	var bytes = window.atob(arr[1]);
	// 处理异常,将ascii码小于0的转换为大于0
	var ab = new ArrayBuffer(bytes.length);
	// 生成视图（直接针对内存）：8位无符号整数，长度1个字节
	var ia = new Uint8Array(ab);
	for (var i = 0; i < bytes.length; i++) {
		ia[i] = bytes.charCodeAt(i);
	}
	return new Blob([ab], {
		type: mime
	});
}

function handleClick(event) {
	const checkbox = event.target;
	// 选择
	let id = checkbox.value
	if (checkbox.checked) {
		imgIds.push(id)
	} else {
		// 取消
		let arr = []
		for (let i = 0; i < imgIds.length; i++) {
			let oldId = imgIds[i]
			if (oldId != id) {
				arr.push(oldId)
			}
		}
		imgIds = arr;
	}
	if (imgIds.length === 0) {
		// SynthesizePDFId
		document.getElementById('SynthesizePDFId').style.background = 'gray'
		document.getElementById('SynthesizeOFDId').style.background = 'gray'
	} else {
		// style="background: gray"
		document.getElementById('SynthesizePDFId').style.background = '#409eff'
		document.getElementById('SynthesizeOFDId').style.background = '#409eff'
	}
}
//增加图片缩略图
function addImgDiv(imgPath) {
	var container = document.getElementById('container');
	var newchild = document.createElement("div");
	newchild.setAttribute("style", "float:left");
	// var generateTimestampId = doGenerateTimestampId();
	var img_id = doGenerateTimestampId();
	newchild.innerHTML = "<img class='pic'  id='" + img_id +
		"' width='105px' style='margin: 0 3px' height='85px' src='" + "data:image/jpg;base64," + imgPath + "'/>" +
		"<input type=\"checkbox\" name=\"payment\" value=\"" + img_id + "\" onclick=\"handleClick(event)\">";
	container.appendChild(newchild);
	// 新增数据
	imgList.push({
		id: img_id,
		data: imgPath
	})
	var img = document.getElementById(img_id);
	img.oncontextmenu = function(e) {
		e.preventDefault(); //阻止默认行为
		my_thumbnail_img_active_remove() // 删除自身
		let img_id = this.id; // 缩略图ID
		let img_url = this.src; // 缩略图src

		// 动态创建两个按钮
		let my_div = document.createElement("div")
		my_div.id = 'my_thumbnail_img_active'
		my_div.style.display = 'inline'
		my_div.style.position = 'absolute'
		my_div.style.top = e.clientY + 'px'
		my_div.style.left = e.clientX + 'px'

		// 删除按钮
		let my_btn2 = document.createElement('button')
		my_btn2.innerText = "删除"
		my_btn2.onclick = function() {
			my_thumbnail_img_active_remove();
			var newArr = [];
			for (let i = 0; i < imgList.length; i++) {
				let item = imgList[i]
				if (item.id != img_id) {
					newArr.push(item)
				}
			}
			imgList = newArr;
			// 这里需要移除数据
			document.getElementById(img_id).remove();
		}

		my_div.appendChild(my_btn2)
		document.getElementById("container").appendChild(my_div);
	};
	img.onclick = function() {
		var _this = $(this); //将当前的pimg元素作为_this传入函数
		imgShow("#outerdiv", "#innerdiv", "#bigimg", _this);
	}
	document.body.addEventListener('click', function(event) {
		// 判断是否是左键点击 隐藏删除按钮
		if (event.button === 0) {
			$('#my_thumbnail_img_active').css('display', 'none')
		}
	});
}
// 删除右键缩略图弹出的两个按钮
function my_thumbnail_img_active_remove() {
	let dom_my_thumbnail_img_active = document.getElementById("my_thumbnail_img_active");
	if (dom_my_thumbnail_img_active) {
		dom_my_thumbnail_img_active.remove();
	}
}

function imgShow(outerdiv, innerdiv, bigimg, _this) {
	var src = _this.attr("src"); //获取当前点击的pimg元素中的src属性
	$(bigimg).attr("src", src); //设置#bigimg元素的src属性
	/*获取当前点击图片的真实大小，并显示弹出层及大图*/
	$("<img/>").attr("src", src).load(function() {
		var windowW = $(window).width(); //获取当前窗口宽度
		var windowH = $(window).height(); //获取当前窗口高度
		var realWidth = this.width; //获取图片真实宽度
		var realHeight = this.height; //获取图片真实高度
		var imgWidth, imgHeight;
		var scale = 0.8; //缩放尺寸，当图片真实宽度和高度大于窗口宽度和高度时进行缩放
		if (realHeight > windowH * scale) { //判断图片高度
			imgHeight = windowH * scale; //如大于窗口高度，图片高度进行缩放
			imgWidth = imgHeight / realHeight * realWidth; //等比例缩放宽度
			if (imgWidth > windowW * scale) { //如宽度扔大于窗口宽度
				imgWidth = windowW * scale; //再对宽度进行缩放
			}
		} else if (realWidth > windowW * scale) { //如图片高度合适，判断图片宽度
			imgWidth = windowW * scale; //如大于窗口宽度，图片宽度进行缩放
			imgHeight = imgWidth / realWidth * realHeight; //等比例缩放高度
		} else { //如果图片真实高度和宽度都符合要求，高宽不变
			imgWidth = realWidth;
			imgHeight = realHeight;
		}
		$(bigimg).css("width", imgWidth); //以最终的宽度对图片缩放
		var w = (windowW - imgWidth) / 2; //计算图片与窗口左边距
		var h = (windowH - imgHeight) / 2; //计算图片与窗口上边距
		$(innerdiv).css({
			"top": h,
			"left": w
		}); //设置#innerdiv的top和left属性
		$(outerdiv).fadeIn("fast"); //淡入显示#outerdiv及.pimg
	});
	$(outerdiv).click(function() { //再次点击淡出消失弹出层
		$(this).fadeOut("fast");
	});
}
// 用于输出日志信息
function log(msg) {
	date = new Date().toTimeString().slice(0, 8);
	var oldVal = $('#log').html();
	$('#log').html(date + ' :\t' + msg + '<br>' + oldVal);
}

// 用于消息提示
function showToast(message) {
	const container = document.getElementById('toast-container');
	const toast = document.createElement('div');
	toast.classList.add('toast');
	toast.textContent = message;

	// 将toast添加到容器中
	container.appendChild(toast);

	// 添加显示类（这里可以使用CSS动画或简单的过渡效果）
	setTimeout(() => {
		toast.classList.add('show');

		// 延时后自动移除toast
		setTimeout(() => {
			toast.classList.remove('show');

			// 等待动画完成后移除DOM元素
			setTimeout(() => {
				if (toast.parentNode) {
					toast.parentNode.removeChild(toast);
				}
			}, 300); // 与CSS中的过渡时间相匹配
		}, 3000); // 消息显示时间
	}, 10); // 稍作延迟以避免样式冲突（实际上可能不需要）
}
