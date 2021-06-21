import Button from "@material-ui/core/Button";
import { Typography } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import AssignmentIcon from "@material-ui/icons/Assignment";
import PhoneIcon from "@material-ui/icons/Phone";
import React, { useEffect, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Peer from "simple-peer";
import io from "socket.io-client";
import "./App.css";
import captureVideoFrame from "capture-video-frame";
import captureFrame from "capture-frame";
import Screenshot from "./components/Screenshot";
import axios from "axios";
const socket = io.connect("http://localhost:5000");
function App({ show }) {
  const [me, setMe] = useState("1");
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const [otext, setOtext] = useState("");
  const [snap, setSnap] = useState([]);
  const [callCount, setCallCount] = useState(0);
  const [otp, setOtp] = useState("");
  const [curotp, setCurotp] = useState("");
  const [opp, setOpp] = useState("null");
  const [loop, setLoop] = useState(1);
  const [adminStatus, setAdminStatus] = useState(0);
  const [values, setValues] = useState([]);
  const [aadhaar, setAadhar] = useState("");
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    setTimeout(() => {
      fetch("/adminList")
        .then((res) => res.json())
        .then((data) => {
          if (data.id !== "null") setAdminStatus(1);
          else setAdminStatus(0);
        });
      fetch("/userList")
        .then((res) => res.json())
        .then((data) => {
          setOpp(data.id);
          setIdToCall(data.id);
        });
      setLoop((loop + 1) % 10);
    }, 2000);
  }, [loop]);
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        setStream(stream);
        myVideo.current.srcObject = stream;
      });
    fetch("/otp")
      .then((res) => res.json())
      .then((data) => {
        setCurotp(data.otp);
      });
    socket.on("me", (id) => {
      setMe(id);
    });

    socket.emit("getId", (id) => {
      setMe(id);
    });
    if (show === 1) socket.emit("admin");
    else socket.emit("user");
  }, []);
  socket.on("callUser", (data) => {
    setReceivingCall(true);
    setCaller(data.from);
    setName(data.name);
    setCallerSignal(data.signal);
  });
  socket.on("display", (data) => {
    setOtext(data);
  });

  const takeSnap = () => {
    const frame = captureFrame(".video-other", "jpeg");
    let b64encoded = Buffer.from(frame.image).toString("base64");
    let temp = snap.slice();
    temp.push({
      src: `data:image/jpeg;base64,${b64encoded}`,
      name: "",
    });
    // window.URL.createObjectURL(new window.Blob([frame.image]))
    setSnap(temp);
  };
  const setNameImg = (index, title) => {
    if (values.indexOf(title) !== -1) {
      alert("This name is already assigned to an image .");
    } else {
      snap[index] = { src: snap[index].src, name: title };
      setValues((values) => [...values, title]);
    }
  };
  const deleteSnap = (index) => {
    let temp = snap.slice();
    temp.splice(index, 1);
    setSnap(temp);
  };
  const setImage = (data, index) => {
    let temp = snap.slice();
    temp[index] = { src: data, name: "" };
    setSnap(temp);
  };
  const submitPhotos = () => {
    if (values.length !== 4) {
      alert("Need exactly 4 images before submitting .");
    } else if (aadhaar.length !== 1) {
      alert("Invalid Aadhar id");
    } else {
      // console.log(snap);
      axios.post("/saveData", {snap:snap,id:aadhaar}).then((res) => {
        alert(res.data.message);
      });
    }
  };
  const sendText = (id) => {
    var txt = "";

    if (id === 1) txt = "Read Out the code on screen --> ";
    if (id === 1) {
      let k = 4;
      var rString =
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      while (k !== 0) {
        let v = (Math.random() * 1000) % 62;
        txt += rString.charAt(v);
        k--;
      }
    }
    if (id === 2) txt = "Show your pan Card";
    if (id === 3) txt = "";
    setOtext(txt);
    socket.emit("sendText", { to: idToCall, text: txt });
  };
  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });
    socket.on("callAccepted", (data) => {
      setCallAccepted(true);
      peer.signal(data);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    setCallEnded(false);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    socket.emit("ended", idToCall);
    connectionRef.current.destroy();
    setCallEnded(true);
    setReceivingCall(false);
    setCallAccepted(false);
    setCaller("");
    setIdToCall("");
    window.location.reload();
  };
  socket.on("end", () => {
    setCallEnded(true);
    setReceivingCall(false);
    setCallAccepted(false);
    window.location.reload();
  });
  socket.on("callEnded", () => {
    setCallEnded(true);
    setReceivingCall(false);
    setCallAccepted(false);
    setCaller("");
    setIdToCall("");
    // if (show == 1) alert("User Disconnected , please join again");
    // else alert("Admin Disconnect , please join again");
    // setTimeout(() => {
    //   window.location.reload();
    // }, 2000);
    window.location.reload();
  });
  const [data, setData] = useState([]);
  const getUsers = () => {
    fetch("https://jsonplaceholder.typicode.com/posts")
      .then((response) => response.json())
      .then((json) => {
        setData(json);
      });
  };
  const sendOTP = () => {
    socket.emit("set", otp);
    fetch("/otp")
      .then((res) => res.json())
      .then((data) => {
        setCurotp(data.otp);
      });
  };
  const showData = () => {
    socket.emit("show");
  };

  // const showUsers = () => {
  //   fetch("/userList")
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setOpp(data.id);
  //       setIdToCall(data.id);
  //     });
  // };
  return (
    <>
      <div className="call-center">
        <div className="myId">
          {show === 1 && (
            <>
              <TextField
                id="filled-basic"
                label="Enter custom OTP"
                variant="filled"
                onChange={(e) => setOtp(e.target.value)}
                style={{ marginBottom: "10px" }}
              />
              {/* <Typography variant="h6" gutterBottom style={{ color: "black" }}>
                Your ID : {me}
              </Typography> */}
              <Typography variant="h6" gutterBottom style={{ color: "black" }}>
                Current OTP : {curotp}
              </Typography>
              <Button variant="outlined" color="primary" onClick={sendOTP}>
                Set OTP
              </Button>
              {/* <Button variant="outlined" color="primary" onClick={showData}>
                Show data
              </Button> */}
              {/* <Button variant="outlined" color="primary" onClick={showUsers}>
                Show joined users
              </Button> */}
              <div className="call-button">
                {callAccepted && !callEnded && show === 1 ? (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={leaveCall}
                    style={{ marginRight: "10px" }}
                  >
                    End Call
                  </Button>
                ) : (
                  <IconButton
                    color="primary"
                    aria-label="call"
                    onClick={() => {
                      if (callCount === 1 && show !== 1) {
                        window.location.reload();
                      } else {
                        callUser(idToCall);
                        setCallCount(1);
                      }
                    }}
                  >
                    <PhoneIcon size="medium" />
                  </IconButton>
                )}
                {opp === "null" ? "NO user connected" : "User Connected"}
              </div>
            </>
          )}
          <div>
            {show === 0
              ? adminStatus === 0
                ? "Please wait for admin to join"
                : "Admin joined , please wait for the call"
              : ""}
          </div>
        </div>
      </div>
      <div>
        {receivingCall && !callAccepted ? (
          <div className="caller">
            <h4 style={{ color: "black" }}>
              {" "}
              Admin is calling . Click on Join meet to start KYC .
            </h4>
            <Button variant="contained" color="primary" onClick={answerCall}>
              Join Meet
            </Button>
          </div>
        ) : null}
      </div>
      <div className="container">
        <div className="video-container">
          {stream && (
            <video
              className="video-my"
              playsInline
              muted
              ref={myVideo}
              autoPlay
              style={{ width: "150px" }}
            />
          )}
          {/* {(callAccepted && !callEnded)} */}
          {1 ? (
            <video
              className="video-other"
              id="video-other-1"
              playsInline
              ref={userVideo}
              autoPlay
              // style={{ width: "300px" }}
            />
          ) : null}
          <div className="overlay-text">{otext}</div>
        </div>
      </div>
      {show === 1 && (
        <>
          <div className="options">
            <Button
              variant="outlined"
              color="primary"
              onClick={() => sendText(1)}
            >
              Read Code
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => sendText(2)}
            >
              Pan Card
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => sendText(3)}
            >
              Clear
            </Button>
            <Button variant="outlined" color="primary" onClick={takeSnap}>
              Take screenshot
            </Button>
          </div>
          <div className="screenshot">
            {snap.map((pic, index) => {
              return (
                <Screenshot
                  snap={pic.src}
                  func={setImage}
                  index={index}
                  key={index}
                  deleteSnap={deleteSnap}
                  setName={setNameImg}
                />
              );
            })}
          </div>
          <div>
            {/* <Button variant="outlined" color="primary" onClick={submitPhotos}>
              Submit Photos
            </Button> */}
          </div>
          <div className="user">
            <TextField
              id="filled-basic"
              label="Enter Aadhaar number "
              variant="filled"
              onChange={(e) => setAadhar(e.target.value)}
              style={{ marginBottom: "10px" }}
            />
            <Button variant="outlined" color="primary" onClick={submitPhotos}>
              Submit Photos
            </Button>
            <Button
              variant="contained"
              color="primary"
              href="#contained-buttons"
              onClick={getUsers}
            >
              Get List of people yet to be verified
            </Button>
            {data.map((obj) => {
              return <div>{obj.title}</div>;
            })}
          </div>
        </>
      )}
    </>
  );
}

export default App;
