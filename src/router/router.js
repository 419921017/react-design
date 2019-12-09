import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import App from './../App';
import RandomJoke1 from '../component/RandomJoke1';
import RandomJoke2 from '../component/RandomJoke2';
import RandomJoke3 from '../component/RandomJoke3';


const BasicRoute = () => (
  <HashRouter>
    <Switch>
      <Route exact path="/" component={App} />
      <Route exact path="/RandomJoke1" component={RandomJoke1} />
      <Route exact path="/RandomJoke2" component={RandomJoke2} />
      <Route exact path="/RandomJoke3" component={RandomJoke3} />
    </Switch>
  </HashRouter>
);


export default BasicRoute;