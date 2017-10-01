import React from 'react';


const ShowHandComponent = ({hand}) => {

  const simbols = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠"
  }
  
    return (
      <ul className="hand">
      	{
      		hand.map((card,i)=><li className={`card ${card.suit}`} key={`card-${i}`} data-value={`${card.number} ${simbols[card.suit]}` } >
      		</li>)
      	}
      </ul>
    );

}

export default ShowHandComponent;