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

    const result = this.compare(this.result1,this.result2);

    if(result===0)
      return {
        name: this.result1.name,
        hand: [player1,player2]
      };
    else if(result===1){
      return {
        name: this.result1.name,
        hand: [player1]
      } 
    }else 
      return {
        name: this.result2.name,
        hand: [player2]
      } 
    

  }

  compare(hand1,hand2){
    const ranking = [
      "High​ Card",
      "One​ Pair",
      "Two​ Pairs",
      "Three​ of​ a Kind",
      "Straight",
      "Flush",
      "Full​ ​House",
      "Four​ of​ a Kind",
      "Straight​ Flush",
      "Royal​ Flush"
    ];

    if(hand1.name!==hand2.name)
    {
      return ranking.indexOf(hand1.name) > ranking.indexOf(hand2.name)? 1 : -1;
    }else{
      return this.biggerArray(new Array(...hand1.values),new Array(...hand2.values));
    }
  }

  biggerArray(arr1,arr2){

    if(arr1[arr1.length-1]===arr2[arr1.length-1]){
      console.log("son iguales");
      if(arr1.length===1 && arr2.length===1){
        return 0;
      }else{
        arr1.splice(arr1.length-1,1);
        arr2.splice(arr2.length-1,1);
        return this.biggerArray(arr1,arr2);
      }
    }else{
      return Number(arr1[arr1.length-1])>Number(arr2[arr2.length-1])? 1: -1;
    }

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

    if(Object.keys(suit).length===1){
      console.log("mismo suit")
      return this.getNameSameSuit(numbers);
    }
    else{
      return this.getNameDifferentSuit(numbers.repeated());
    }
    
  }

  getNameDifferentSuit(hand){

    const keys = Object.keys(hand);
    
    if(keys.length === 4){
      return {
        name: "One​ Pair",
        values: Object.entries(hand).sort((elemen1,elemen2)=>{
                    return elemen1[1]-elemen2[1];
                  }).map(element=>element[0])
      }
    }else if(keys.length === 3){

      return {
          name: Math.max(...keys.map(e=>hand[e]))===3 ? "Three​ of​ a Kind" : "Two​ Pairs",
          values: Object.entries(hand).sort((elemen1,elemen2)=>{
                    return elemen1[1]-elemen2[1];
                  }).map(element=>element[0])
      }

    }else if(keys.length === 2){

      return {
          name: Math.max(...keys.map(e=>hand[e]))===4 ? "Four​ of​ a Kind" : "Full​ ​House",
          values: Object.entries(hand).sort((elemen1,elemen2)=>{
                    return elemen1[1]-elemen2[1];
                  }).map(element=>element[0])
      }

    }else if(Number(keys[4])===Number(keys[0])+4){

      return {
        name: "Straight",
        values: keys
      }
      
    }else{

      return {
        name: "High​ Card",
        values: keys
      }
      
    }

  }

  getNameSameSuit(hand){
    if(hand[0]==="10" && hand[4]==="14"){
      return {
        name: "Royal​ Flush",
        values: hand
      }
    }else if(Number(hand[4])===Number(hand[0])+4){
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
      hand_b: [],
      ready: false
    }

    this.dealer = new Dealer();
    this.poker = new Poker();

    this.handlerStart = this.handlerStart.bind(this);
    this.handlerGetCards = this.handlerGetCards.bind(this);
    this.handleMakeHand = this.handleMakeHand.bind(this);
  }

  componentWillMount() {
    this.handlerStart();
  }

  handlerGetCards(number){
    this.dealer.getCard(number)
    .then(res=>{
      this.cards = res;
      this.handleMakeHand();
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

  handleMakeHand(){

    const hand_a = this.cards.splice(0,5);
    const hand_b = this.cards.splice(0,5);
    const winner = this.poker.checkWinner(hand_a,hand_b);

    this.setState({
        hand_a: hand_a,
        hand_b: hand_b,
        winner: winner,
        ready: true
    });

  }

  render() {

    console.log("state ",this.state);

    if (this.state.ready===false)
      return <div>Loading...</div>


    return (
      <div className="App">

        <h2>{
          this.state.winner.hand.length===1? "winner": "winners"
        }</h2>

        {
          this.state.winner.hand.map((hand,i)=><ShowHandComponent key={`winner-${i}`} hand={hand} />)
        }

        <h1>{this.state.winner.name}</h1>

        <ShowHandComponent hand={this.state.hand_a} />
        <ShowHandComponent hand={this.state.hand_b} />

        <button onClick={()=>this.cards.length>20? this.handleMakeHand() : this.handlerStart()}>next hand</button>
        <button onClick={this.handlerStart}>new Game</button>
      </div>
    );
  }
}

export default App;
