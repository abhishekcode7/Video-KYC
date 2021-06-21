import React from "react";
import { TextField, Button, Typography } from "@material-ui/core";
import "./User.css";
import { useState } from "react";
import App from "../App";
const User = () => {
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(0);
  const verify = () => {
    fetch("/otp")
      .then((res) => res.json())
      .then((data) => {
        if (data.otp === otp) setVerified(1);
        else {
          alert("Wrong OTP");
        }
      });
  };
  return (
    <div>
      <Typography className="head" variant="h2" component="h2">
        VIDEO KYC
      </Typography>
      {verified !== 1 && (
        <div className="admin">
          <TextField
            type="password"
            id="standard-basic"
            label="Enter OTP "
            onChange={(e) => setOtp(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            href="#contained-buttons"
            onClick={verify}
          >
            Enter
          </Button>
        </div>
      )}
      <div>{verified ? <App show={0} /> : ""}</div>
    </div>
  );
};

export default User;
