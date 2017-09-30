import React, { Component } from 'react';
import './App.css';

class Dealer {
  constructor(data) {
    this.url = "https://services.comparaonline.com/dealer/deck";
    this.hash = "";
  }

  start(){
    return new Promise((resolve,reject)=>{
      fetch(this.url,{
        method: "POST",
      })
      .then(response=>{
        if(!response.ok)
          throw Error(response.statusText);
        else 
          return response.text()
      })
      .then(res=>{
        this.hash=res;
        resolve(res);
      })
      .catch(e=>this.start());
      })
  }

  getCard(number){
    return new Promise((resolve,reject)=>{
      fetch(`${this.url}/${this.hash}/deal/${number}`)
      .then(res=>res.json())
      .then(data=>resolve(data));
    })
  }
}

class App extends Component {
  constructor(props) {
    super(props);

    this.dealer = new Dealer();
  }

  componentWillMount() {
    this.dealer.start()
    .then(res=>{
      this.dealer.getCard(5).then(res=>console.log(res));
    })
  }

  handlerGedCard(number){
    
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to React 2.0</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
