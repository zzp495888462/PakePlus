var ws;
var m_isConnectWS;
var m_closed;
var oneSate = false;
function connect() {
    let url = "ws://127.0.0.1:9000";
    if ('WebSocket' in window) {
        ws = new WebSocket(url);
    } else if ('MozWebSocket' in window) {
        ws = new MozWebSocket(url);
    } else {
        alert("浏览器版本过低，请升级您的浏览器。\r\n浏览器要求：IE10+/Chrome14+/FireFox7+/Opera11+");
    }

    ws.onopen = function () {
        m_isConnectWS = true;
        m_closed = false;
        console.log('Connected: ');
		InitDevs()
        oneSate = true;
        stopDeskew()
        //openwshandle();
    };
    ws.onmessage = function (evt) {
        if (typeof (evt.data) == "string") {
            let str = evt.data;
            if (str.length <= 0) {
                return;
            }
            onResiveServerMsg(JSON.parse(str));
        }
    }
    ws.onclose = function () {
        m_isConnectWS = false;
        connect();
    };
}
function InitDevs(){
	sendMsg({'function':'InitDevs'})
}
function disconnect() {
    // if (ws !== null) {
    //     ws.close()
    // }
    console.log("Disconnected");
}

function sendMsg(body) {
    ws.send(JSON.stringify(body));
}

function onload() {
    connect();
}

function onunload() {
    disconnect();
}
