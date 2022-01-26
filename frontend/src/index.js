import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import "bootstrap/dist/css/bootstrap.css"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {
  Navigation,
  Footer,
  TrainerHelper,
  DatasetViewer,
} from "./components"

import config from 'react-global-configuration';
import configuration from './config';

config.set(configuration);

ReactDOM.render(
  <Router>
    <Navigation />
    <Routes>
      <Route path="/trainer_helper" element={<TrainerHelper />}/>
      <Route path="/dataset_viewer" element={<DatasetViewer />}/>
    </Routes>
    <Footer />
  </Router>,

  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
