import { BrowserRouter, Route, Switch } from "react-router-dom";
import React from "react";
import Main from "./Main";
import User from "./User";
const Front = () => {
  return (
    <div>
      <BrowserRouter>
        <Switch>
          <Route path="/admin" exact component={Main} />
          <Route path="/" exact component={User} />
        </Switch>
      </BrowserRouter>
    </div>
  );
};

export default Front;
