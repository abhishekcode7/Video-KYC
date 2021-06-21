const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const router = express.Router();
const fs = require("fs");
const bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
const FileReader = require("filereader");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
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
    if (users.id === null) users = { id: socket.id };
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
router.post("/saveData", (req, res) => {
  fs.mkdir(`Data/${req.body.id}`, function (err) {
    if (err) {
      res.send({message:"Data already exists"});
    } else {
      console.log("New directory successfully created.");
      for (let i = 0; i < 4; i++) {
        let img = req.body.snap[i].src;
        let title = req.body.snap[i].name;
        let data = img.replace(/^data:image\/jpeg;base64,/, "");
        fs.writeFile(`Data/${req.body.id}/${title}.jpeg`, data, "base64", (err) => {
          console.log(err);
        });
      }
      res.send({message:"Success"});
    }
  });
  // var img = req.body[0].src;
  // var data = img.replace(/^data:image\/jpeg;base64,/, "");
  // fs.writeFile(`Data/image.jpeg`, data, "base64", (err) => {
  //   console.log(err);
  // });
});
app.use("/", router);
server.listen(5000, () => console.log("server is running on port 5000"));
