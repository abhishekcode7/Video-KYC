import React, { useState } from "react";
import { TextField, Button, Typography } from "@material-ui/core";
import "./Main.css";
import App from "../App.js";
const Main = () => {
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(0);
  const verify = () => {
    if (pass === "123") setShow(1);
    else {
      alert("Wrong Password !!");
    }
  };
  return (
    <>
      <Typography className="head" variant="h2" component="h2">
        VIDEO KYC
      </Typography>
      {show === 0 && (
        <div className="options-container">
          <div className="admin">
            <TextField
              id="standard-basic"
              label="Enter Password (admin)"
              onChange={(e) => setPass(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              href="#contained-buttons"
              onClick={verify}
            >
              Login as Admin
            </Button>
          </div>
          <div>
            <Button
              variant="contained"
              color="primary"
              href="#contained-buttons"
              onClick={() => setShow(2)}
            >
              Login as User
            </Button>
          </div>
        </div>
      )}
      {show !== 0 ? <App show={show} /> : ""}
    </>
  );
};

export default Main;
