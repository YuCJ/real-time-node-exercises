function handleHTTP(req, res) {
  if (req.method == "GET") {
    if (/^\/\d+(?=$|[\/?#])/.test(req.url)) {
      req.addListener("end", function () {
        req.url = req.url.replace(/^\/(\d+).*$/, "/$1.html");
        static_files.serve(req, res);
      });
      req.resume();
    } else if (req.url == "/jquery.js") {
      req.addListener("end", function () {
        static_files.serve(req, res);
      });
      req.resume();
    } else {
      res.writeHead(403);
      res.end();
    }
  } else {
    res.writeHead(403);
    res.end();
  }
}

function connection(socket) {

  function disconnect() {
    console.log("disconnected");
  }

  function getmsg(msg) {
    // To all:
    io.sockets.emit("broadcast", '[all]' + msg);
    // To others:
    socket.broadcast.emit("broadcast", '[except sender]' + msg);
  }

  function spy(move) {
    socket.broadcast.emit("spy", move);
  }

  socket.on("disconnect", disconnect);
  socket.on("msg", getmsg);
  socket.on("spy", spy);

  var intv = setInterval(function () {
    socket.emit("hello", Math.random());
  }, 10000);
}


var
  http = require("http"),
  httpserv = http.createServer(handleHTTP),

  port = 8006,
  host = "127.0.0.1",

  // ASQ = require("asynquence"),
  node_static = require("node-static"),
  static_files = new node_static.Server(__dirname),

  io = require("socket.io")(httpserv);

// require("asynquence-contrib");

httpserv.listen(port, host);

io.on("connection", connection);