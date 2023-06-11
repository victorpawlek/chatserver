const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

let connections = []; // all current connections
// clear old pics after start of server
fs.rmdirSync(path.join(__dirname, '../public/images'), { recursive: true });
fs.mkdirSync(path.join(__dirname, '../public/images'));

function wsServer(httpServer) {
  const wss = new WebSocket.Server({ server: httpServer });

  wss.on('connection', (ws) => {
    // send an array with registered nicknames
    ws.send(
      JSON.stringify({
        type: 'connected',
        data: connections.map((el) => el.nickname),
      })
    );

    ws.on('message', (data) => {
      // restore object from JSON string
      let message = JSON.parse(data);
      // do nickname registration
      if (message.type == 'nickname') {
        registerNickname(ws, message.nickname);
      }
      // dispatch message to all connections
      if (message.type == 'text') {
        sendMessage(ws, message.msg);
      }
    });
    ws.on('close', () => {
      // remove connection from list of all connections
      connections = connections.filter((el) => el.ws != ws);
      // inform other connections of the fact
      updateNickNames();
    });
  });
}

function registerNickname(ws, msg) {
  if (connections.find((el) => el.nickname == msg)) {
    ws.send(JSON.stringify({ type: 'nickname already used' }));
  } else {
    // save nickname and websocket in connections
    connections.push({ ws: ws, nickname: msg });
    // create dummy pic on server
    const image = path.join(__dirname, `../public/images/${msg}.png`);
    const placeholderImage = path.join(__dirname, './placeholder.png');
    fs.copyFileSync(placeholderImage, image);
    // send success status to client
    ws.send(JSON.stringify({ type: 'nickname status' }));
    // update all connections with new list of nicknames
    updateNickNames();
  }
}

function updateNickNames() {
  // send all nicknames to connections
  connections.forEach((el) =>
    el.ws.send(
      JSON.stringify({
        type: 'connected',
        data: connections.map((el) => el.nickname),
      })
    )
  );
}

function sendMessage(ws, msg) {
  connections.forEach((el) =>
    el.ws.send(
      JSON.stringify({
        type: 'text',
        data: {
          nick: connections.find((el) => el.ws == ws).nickname,
          message: msg,
        },
      })
    )
  );
}

module.exports = { wsServer, updateNickNames };
