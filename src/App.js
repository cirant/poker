import React, { Component } from 'react';
import ShowHandComponent from './components/showHandComponent';
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

class Poker {

  checkWinner(player1, player2){
    // console.log("verificar entre ",player1," y ",player2)
    this.result1 = this.orderHand(player1);
    this.result2 = this.orderHand(player2);

    console.log("result1 ",this.result1);
    console.log("result2 ",this.result2);
  }

  orderHand(hand){
    let numbers = [];
    let suit = [];

    hand.forEach(c=>{

      suit[c.suit] = true;

      if(!isNaN(Number(c.number)))
        numbers.push(c.number);
      else{
        const lettes = {
          J: "11",
          Q: "12",
          K: "13",
          A: "14"
        }

        numbers.push(lettes[c.number]);
      }
    });

    numbers.sort((num1,num2)=>{
      return num1-num2;
    });

    Array.prototype.repeated = function(){
      var count = {};
      for(var i = 0; i < this.length; i++){
      if(!(this[i] in count))count[this[i]] = 0;
      count[this[i]]++;
      }
      return count;
    }

    console.log(">>>>>>> ",suit);

    if(Object.keys(suit).length===1){
      console.log("mismo suit")
      return this.getNameSameSuit(numbers);
    }
    else{
      return this.getNameDifferentSuit(numbers.repeated());
    }
    
  }

  getRepeat(){

  }

  getNameDifferentSuit(hand){

    const keys = Object.keys(hand);

    console.log("hand ",hand);
    
    if(keys.length === 4){
      return {
        name: "One​ Pair",
        values: Object.entries(hand).sort((elemen1,elemen2)=>{
                    return elemen1[1]-elemen2[1];
                  }).map(element=>element[0])
      }
    }else if(keys.length === 3){

      return {
          name: Math.max(...keys.map(e=>hand[e]))===3 ?"Three​ of​ a Kind" : "Two​ Pairs",
          values: Object.entries(hand).sort((elemen1,elemen2)=>{
                    return elemen1[1]-elemen2[1];
                  }).map(element=>element[0])
      }

    }else if(keys.length === 2){

      return {
          name: Math.max(...keys.map(e=>hand[e]))===4 ?"Four​ of​ a Kind" : "Full​ ​House",
          values: Object.entries(hand).sort((elemen1,elemen2)=>{
                    return elemen1[1]-elemen2[1];
                  }).map(element=>element[0])
      }

    }else if(keys[4]==Number(keys[0])+4){

      return {
        name: "Straight",
        values: [keys[4]]
      }
      
    }else{

      return {
        name: "High​ Card",
        values: keys
      }
      
    }

    console.log(hand);
  }

  getNameSameSuit(hand){
    if(hand[0]==="10" && hand[4]==="14"){
      return {
        name: "Royal​ Flush",
        values: hand
      }
    }else if(hand[4]==Number(hand[0])+4){
      return {
        name: "Straight​ Flush",
        values: [hand[4]]
      }
    }else{
      return {
        name: "Flush",
        values: hand
      }
    }
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
    this.poker = new Poker();

    this.handlerStart = this.handlerStart.bind(this);
    this.handlerGetCards = this.handlerGetCards.bind(this);
    this.handlerCheckWinner = this.handlerCheckWinner.bind(this);
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

  handlerCheckWinner(hand_a,hand_b){
    this.poker(hand_a,hand_b);

    return <div>winner</div>
  }

  render() {

    console.log("state ",this.state);

    this.poker.checkWinner(this.state.hand_a,this.state.hand_b);

    return (
      <div className="App">

        <ShowHandComponent hand={this.state.hand_a} />
        <ShowHandComponent hand={this.state.hand_b} />
      </div>
    );
  }
}

const Po = new Poker();

const h1 = [
  {
    number: "1",
    suit: "diamonds"
  },
  {
    number: "2",
    suit: "diamonds"
  },
  {
    number: "3",
    suit: "diamonds2"
  },
  {
    number: "4",
    suit: "diamonds33"
  },
  {
    number: "5",
    suit: "diamonds3"
  },
]

const h2 = [
  {
    number: "1",
    suit: "diamonds"
  },
  {
    number: "3",
    suit: "diamonds"
  },
  {
    number: "3",
    suit: "diamonds2"
  },
  {
    number: "3",
    suit: "diamonds33"
  },
  {
    number: "5",
    suit: "diamonds3"
  },
]

Po.checkWinner(h1,h2);

export default App;
