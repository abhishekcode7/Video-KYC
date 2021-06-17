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
import Screenshot from "./components/Screenshot"
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
  const [ver, setVer] = useState(0);
  const [admin, setAdmin] = useState("");
  const [otext, setOtext] = useState("");
  const [snap, setSnap] = useState(null);
  const [callCount, setCallCount] = useState(0);
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        setStream(stream);
        myVideo.current.srcObject = stream;
      });

    socket.on("me", (id) => {
      setMe(id);
    });

    socket.emit("getId", (id) => {
      setMe(id);
    });
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
    // const frame = captureVideoFrame("video-other-1-id", "png");
    const frame = captureFrame(".video-other", "jpeg");
    setSnap(window.URL.createObjectURL(new window.Blob([frame.image])));
  };
  const setImage = (data)=>{
    setSnap(data);
  }
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
      console.log(txt);
    }
    if (id === 2) txt = "Show your pan Card";
    if (id === 3) txt = "";
    setOtext(txt);
    socket.emit("sendText", { to: caller, text: txt });
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
    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
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
    connectionRef.current.destroy();
    socket.emit("ended", caller);
    setCallEnded(true);
    setReceivingCall(false);
    setCallAccepted(false);
    setIdToCall("");
  };
  socket.on("end", () => {
    setCallEnded(true);
    setReceivingCall(false);
    setCallAccepted(false);
    setIdToCall("");
  });
  const [data, setData] = useState([]);
  const getUsers = () => {
    fetch("https://jsonplaceholder.typicode.com/posts")
      .then((response) => response.json())
      .then((json) => {
        setData(json);
      });
  };
  return (
    <>
      {/* <h1 style={{ textAlign: "center", color: "#000" }}>Video KYC</h1> */}
      <div className="call-center">
        {/* <div className="myId">
          <TextField
            id="filled-basic"
            type="password"
            label="Get Admin Role"
            variant="filled"
            onChange={(e) => setAdmin(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AssignmentIcon fontSize="large" />}
          >
            Submit
          </Button>
          {admin === "Pass" && <div>Verified</div>}
          <Typography variant="h6" gutterBottom>
            Your ID : {me}
          </Typography>
        </div> */}
        <div className="myId">
          <TextField
            id="filled-basic"
            label="Name"
            variant="filled"
            onChange={(e) => setName(e.target.value)}
            style={{ marginBottom: "10px" }}
          />
          {show === 1 && (
            <Typography variant="h6" gutterBottom style={{ color: "black" }}>
              Your ID : {me}
            </Typography>
          )}
          {/* <CopyToClipboard text={me} style={{ marginBottom: "10px" }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AssignmentIcon fontSize="large" />}
            >
              Copy ID
            </Button>
          </CopyToClipboard> */}

          <TextField
            id="filled-basic"
            label="ID to call"
            variant="filled"
            value={idToCall}
            onChange={(e) => setIdToCall(e.target.value)}
          />
          <div className="call-button">
            {callAccepted && !callEnded && show == 1 ? (
              <Button variant="contained" color="secondary" onClick={leaveCall}>
                End Call
              </Button>
            ) : (
              <IconButton
                color="primary"
                aria-label="call"
                onClick={() => {
                  if (callCount === 1) {
                    window.location.reload();
                  } else {
                    callUser(idToCall);
                    setCallCount(1);
                  }
                }}
              >
                <PhoneIcon fontSize="medium" />
              </IconButton>
            )}
            {idToCall}
          </div>
        </div>
      </div>
      <div>
        {receivingCall && !callAccepted ? (
          <div className="caller">
            <h1 style={{ color: "black" }}>{name} is calling...</h1>
            <Button variant="contained" color="primary" onClick={answerCall}>
              Answer
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
            <Screenshot snap={snap} func={setImage}/>
          </div>
          <div></div>
          <div className="user">
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
