import React, { Component } from 'react';
import ShowHandComponent from './components/showHandComponent';
import './styles/App.css';

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

  // retorna mano ganadora
  checkWinner(player1, player2){
    this.result1 = this.orderHand(player1);
    this.result2 = this.orderHand(player2);

    const result = this.compare(this.result1,this.result2);

    //retornar las manos de los dos jugadores por tener el mismo valor
    if(result===0)
      return {
        name: this.result1.name,
        hand: [player1,player2]
      };
    else if(result===1){
      // mano mas alta es la del jugador 1
      return {
        name: this.result1.name,
        hand: [player1]
      } 
    }else //mano mas alta es la del jugador 2
      return {
        name: this.result2.name,
        hand: [player2]
      } 

  }

  // compara cual es la mano ganadora
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

  // compara cada valor hasta encontrar a un ganador 1 para el primer jugador y -1 para el segundo jugador, o retorna 0 si son iguales
  biggerArray(arr1,arr2){

    if(arr1[arr1.length-1]===arr2[arr1.length-1]){
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

  // Ordena las manos de menor a mayor y sustituye las letras por números para facilitar el manejo y comparación
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

    if(Object.keys(suit).length===1){
      return this.getNameSameSuit(numbers);
    }
    else{
      return this.getNameDifferentSuit(this.getRepeated(numbers));
    }
    
  }

  // retorna un objeto con los numeros repetidos en un array y cuantas veces estan repetido
  getRepeated(arr){
    let count = {};
    for(var i = 0; i < arr.length; i++){
      if(!(arr[i] in count))count[arr[i]] = 0;
      count[arr[i]]++;
      }
    return count;
  }

  // retorna el nombre y los valores de la mano ganadora si las cartas son de distinto tipo
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

  // retorna el nombre y los valores de la mano ganadora si las cartas son de igual tipo
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

    if (this.state.ready===false)
      return <div className="loading">Loading...</div>


    return (
      <div className="App">

        <h1>{
          this.state.winner.hand.length===1? "winner: ": "winners: "
        }
        {this.state.winner.name}
        </h1>

        {
          this.state.winner.hand.map((hand,i)=><ShowHandComponent key={`winner-${i}`} hand={hand} />)
        }

        <div className="players-zone">
          <div className="player-container">
            <p className="player-title">player 1</p>
            <ShowHandComponent hand={this.state.hand_a} />
          </div>
          <div className="player-container">
            <p className="player-title">player 2</p>
            <ShowHandComponent hand={this.state.hand_b} />
          </div>
        </div>

        <div className="btn-container">
          <button className="btn" title="next hand" onClick={()=>this.cards.length>20? this.handleMakeHand() : this.handlerStart()}>next hand</button>
          <button className="btn" title="get 52 new cards" onClick={this.handlerStart}>new Game</button>
        </div>
      </div>
    );
  }
}

export default App;
