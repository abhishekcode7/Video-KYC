const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const router = express.Router();
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
otp = "1";
let admins = { id: null };
let users = { id: null };
io.on("connection", (socket) => {
  socket.emit("me", socket.id);
  socket.on("set", (data) => {
    otp = data;
  });
  socket.on("admin", () => {
    admins = { id: socket.id };
  });
  socket.on("user", () => {
    if(users.id ===null)
    users = { id: socket.id };
  });
  socket.on("show", () => {
    console.log(admins);
    console.log(users);
  });
  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
    if (admins.id === socket.id) {
      admins = { id: null };
    } else users = { id: null };
  });
  socket.on("getId", () => {
    socket.emit("me", socket.id);
  });
  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });
  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });

  socket.on("sendText", (data) => {
    io.to(data.to).emit("display", data.text);
  });
  socket.on("ended", (id) => {
    io.to(id).emit("end");
  });
});

router.get("/otp", (req, res) => {
  res.send({ otp: String(otp) });
});
router.get("/userList", (req, res) => {
  res.send({ id: String(users.id) });
});
router.get("/adminList", (req, res) => {
  res.send({ id: String(admins.id) });
});
app.use("/", router);
server.listen(5000, () => console.log("server is running on port 5000"));
