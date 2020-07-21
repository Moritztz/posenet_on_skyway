const api = document.getElementById('apiKey');
const connection = document.getElementById('createconnection');
const dataconnection = document.getElementById('dataconnection');
var connection_local;
connection.onclick = function()
{
    connection_local = createPeer(api.value);
    //createDataConnection(peer);
    //dataconnection = createDataConnection(peer);
};
dataconnection.onclick = function()
{
    //createDataConnection(peer);
    const dataconnection2 = createDataConnection(connection_local);
    dataconnection2.on('data', data => {
        console.log(data);
      });
};