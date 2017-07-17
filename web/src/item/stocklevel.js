import React from 'react';

const countRating = count => {
  if (count <= 5) {
    return {
      desc: 'Low',
      colour: 'bg-red',
      percentage: 17
    };
  }
  if (count <= 10) {
    return {
      desc: 'Medium',
      colour: 'bg-yellow',
      percentage: 50
    };
  }
  return {
    desc: 'High',
    colour: 'bg-aqua',
    percentage: 90
  };
};

export const StockLevel = count => {
  const { desc, colour, percentage } = countRating(count);

  return (
    <div>
      <p>
        Stock Level: <b>{desc}</b>
      </p>
      <div
        className="bg-lightgray flex rounded mt2 mx-auto col-2"
        style={{
          height: '0.5rem',
          overflow: 'hidden'
        }}
      >
        <div
          className={`inline-block col-2 ${colour}`}
          style={{
            width: `${percentage}%`
          }}
        />
      </div>
    </div>
  );
};
