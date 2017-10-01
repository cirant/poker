import React from 'react';
import PropTypes from 'prop-types';


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

ShowHandComponent.propTypes = {
    hand : PropTypes.arrayOf(
      PropTypes.shape({
        number: PropTypes.string.isRequired,
        suit: PropTypes.string.isRequired
      })
    ).isRequired
}

export default ShowHandComponent;