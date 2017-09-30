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
        method: "POST"
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
      .catch(e=>{
          reject(e);
      });
    });
  }

  getCard(number){
    return new Promise((resolve,reject)=>{

      fetch(`${this.url}/${this.hash}/deal/${number}`)
      .then(response=>{
        if(!response.ok)
          throw Error(response.statusText);
        else
          return response.json()
      })
      .then(data=>resolve(data))
      .catch(e=>reject(e));
    });

  }
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state={
      hand_a: [],
      hand_b: []
    }

    this.dealer = new Dealer();

    this.handlerStart = this.handlerStart.bind(this);
    this.handlerGetCards = this.handlerGetCards.bind(this);
  }

  componentWillMount() {
    this.handlerStart();
  }

  handlerGetCards(number){
    this.dealer.getCard(number)
    .then(res=>{

      this.setState({
        hand_a: res.splice(0,5),
        hand_b: res.splice(0,5)
      });

      this.cards = res;
    })
    .catch(e=>{
      this.handlerGetCards(number);
    });
  }

  handlerStart(){
    this.dealer.start()
    .then(res=>{

      this.handlerGetCards(52);

    })
    .catch(e=>{
      console.log(">>>> error al start ",e);
      this.handlerStart();
    });
  }

  render() {

    console.log("state ",this.state);
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
