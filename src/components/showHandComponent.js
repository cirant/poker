import React from 'react';


const ShowHandComponent = ({hand}) => {
  
    return (
      <ul>
      	{
      		hand.map((card,i)=><li key={`card-${i}`}>
      			{card.number}
      			{card.suit}
      		</li>)
      	}
      </ul>
    );

}

export default ShowHandComponent;