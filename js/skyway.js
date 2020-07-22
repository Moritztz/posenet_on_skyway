let peer = null;
let existingConn = null;
var isOpen = false;
//初期化(cssでもできるはず)
SetupMakeConnUI();

function GetPeerId(id) {
    //ボタンをすべて消す　PeerIDがサーバーに残ってしまい初期化ができない
    $('#peerid-ui').hide();

    peer = new Peer(id, {
        // Set API key for cloud server (you don't need this if you're running your
        // own.
        key: window.__SKYWAY_KEY__,
        // Set highest debug level (log everything!).
        debug: 3,
    });

    // Show this peer's ID.
    peer.on('open', id => {
        $('#my-id').text(id);
    });

    //着信処理
    peer.on('connection', Connect);
    peer.on('close', id =>{isOpen = false;});

    //エラー
    peer.on('error', err => {
        $('#console').text(err);
        isOpen = false;
        SetupMakeConnUI();
    });

}

//ID選択
function UnityGetPeerId(id, theirId) {
    GetPeerId(id);
    $('#their-id').val(theirId);
}

$('#twincam').on('click', () => {
    GetPeerId("twincam");
    $('#their-id').val("user");
});

$('#user').on('click', () => {
    GetPeerId("user");
    $('#their-id').val("twincam");
});

$('#sender').on('click', () => {
    GetPeerId("sender");
    $('#their-id').val("reciever");
});

$('#reciever').on('click', () => {
    GetPeerId("reciever");
    $('#their-id').val("sender");
});

// Connect to a peer
$('#connect').on('submit', e => {
    e.preventDefault();
    //接続
    const conn = peer.connect($('#their-id').val(), {
        serialization: "none"
    });
    Connect(conn);
});

function UnityConnect(theirId) {
    //接続
    const conn = peer.connect(theirId);
    Connect(conn);
}

//切断
$('#close').on('click', () => {
    existingConn.close();
});

function UnityClose() {
    existingConn.close();
}

//送信ボタン
$('#send').on('submit', e => {
    e.preventDefault();

    DataSend($('#message').val());

    //テキストボックスをクリア
    $('#message').val('');
    //テキストボックスを選択
    $('#message').focus();
});

//リロード
$('#reload').on('click', () => {
    location.reload(true);
});
window.DataSend = DataSend;
//送信処理
function DataSend(msg) {
    if(existingConn!=null && isOpen){
        existingConn.send(msg);
        $("#resultSend").text(msg);
    }
}

//接続イベントの管理
function Connect(conn) {
    if (existingConn) {
        existingConn.close();
    }
    SetupEndConnUI();

    //接続相手を保持
    existingConn = conn;

    //接続が完了した場合のイベント
    conn.on('open', () => {
        $('#connected-id').text(conn.remoteId);
        isOpen = true;
    });

    //受信
    conn.on('data', data => {
        DataRecieve(data);
        $('#resultRecieve').text(data);
    });

    //相手が切断したとき
    conn.on('close', () => {
        $('#console').text(conn.remoteId + ' has left the chat');
        SetupMakeConnUI();
    });
}

//受信処理
function DataRecieve(data) {
    var jsObject = JSON.parse(data);
}

//UI操作
function SetupMakeConnUI() {
    $('#connect').show();
    $('#connected-ui').hide();
}

function SetupEndConnUI() {
    $('#connect').hide();
    $('#connected-ui').show();

    $('#console').text('');
}
