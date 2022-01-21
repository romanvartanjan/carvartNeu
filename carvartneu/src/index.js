import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Switch, Route } from 'react-router-dom';
import './index.css';
import HomePage from './HomePage';
import SecondPage from './SecondPage';
import history from './history';
import reportWebVitals from './reportWebVitals';

class Root extends Component {

  state;

  constructor(props) {
    super(props);
      this.state = {
        username: "", 
        password: "",
      }
  }

  render(){
    return(
      <div>
        <HashRouter history={history}>
          <Switch>
            <Route exact path="/" component={HomePage} key={1}/>
            <Route exact path="/SecondPage" component={SecondPage} key={2}/>
          </Switch>
        </HashRouter>
    </div>
  )}
}

ReactDOM.render((
  <div>
    <Root history={history}/>
  </div>
), document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
