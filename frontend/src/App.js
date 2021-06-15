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
const socket = io.connect("http://localhost:5000");
function App() {
  const [me, setMe] = useState("");
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
  const [snap, setSnap] = useState("");
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        myVideo.current.srcObject = stream;
      });

    socket.on("me", (id) => {
      setMe(id);
    });

    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });
  }, []);
  socket.on("display", (data) => {
    setOtext(data);
  });
  const takeSnap = () => {
    // const frame = captureVideoFrame("video-other-1-id", "png");
    const frame = captureFrame(".video-other", "jpeg");
    setSnap(window.URL.createObjectURL(new window.Blob([frame.image])));
  };
  const sendText = (id) => {
    let txt = "";
    if (id === 1) txt = "Read Out the code on screen";
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
    setCallEnded(true);
    connectionRef.current.destroy();
    setIdToCall("");
  };

  return (
    <>
      <h1 style={{ textAlign: "center", color: "#000" }}>Video KYC</h1>
      <div className="call-center">
        <div className="myId">
          <TextField
            id="filled-basic"
            type="password"
            label="Get Admin Role"
            variant="filled"
            onChange={(e) => setAdmin(e.target.value)}
          />
          {/* <Button
            variant="contained"
            color="primary"
            startIcon={<AssignmentIcon fontSize="large" />}
          >
            Submit
          </Button> */}
          {admin === "Pass" && <div>Verified</div>}
          <Typography variant="h6" gutterBottom>
            Your ID : {me}
          </Typography>
        </div>
        <div className="myId">
          <TextField
            id="filled-basic"
            label="Name"
            variant="filled"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginBottom: "10px" }}
          />
          <CopyToClipboard text={me} style={{ marginBottom: "10px" }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AssignmentIcon fontSize="large" />}
            >
              Copy ID
            </Button>
          </CopyToClipboard>

          <TextField
            id="filled-basic"
            label="ID to call"
            variant="filled"
            value={idToCall}
            onChange={(e) => setIdToCall(e.target.value)}
          />
          <div className="call-button">
            {callAccepted && !callEnded ? (
              <Button variant="contained" color="secondary" onClick={leaveCall}>
                End Call
              </Button>
            ) : (
              <IconButton
                color="primary"
                aria-label="call"
                onClick={() => callUser(idToCall)}
              >
                <PhoneIcon fontSize="medium" />
              </IconButton>
            )}
            {idToCall}
          </div>
        </div>
      </div>
      <div className="container">
        <div>
          {receivingCall && !callAccepted ? (
            <div className="caller">
              <h1>{name} is calling...</h1>
              <Button variant="contained" color="primary" onClick={answerCall}>
                Answer
              </Button>
            </div>
          ) : null}
        </div>
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
              style={{ width: "300px" }}
            />
          ) : null}
          <div className="overlay-text">{otext}</div>
        </div>
        <div>
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
        <div>
          <img src={snap} />
        </div>
      </div>
    </>
  );
}

export default App;
