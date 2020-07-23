import React, { useState, useEffect } from "react";

const Receipts = (props) => {

  const [ purchase, setPurchase ] = useState(null);
  const [ date, setDate ] = useState(null);
  const [ produce, setProduce ] = useState(null);

  useEffect(() => {
    const { purchase, date, produce } = props.location.state;
    
    // convert seconds to miliseconds
    const formattedDate = new Date(parseInt(date) * 1000);

    setPurchase(purchase);
    setDate(formattedDate.toString());
    setProduce(produce);
  }, []);


  return (
    <div className="receipt-container">
      <div className="receipt-header">
        <h3>Thanks for your purchase of {produce}</h3>
      </div>

      <div className="receipt-info">
        <div>Date of Purchase: {date}</div>
        <div>Purchase Value: ${purchase}</div>
      </div>
    </div>
  )
};

export default Receipts;