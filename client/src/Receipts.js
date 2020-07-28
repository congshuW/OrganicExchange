import React, { useState, useEffect } from "react";
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    margin: 'auto',
    maxWidth: 500,
  },
  container: {
    paddingTop: '1rem',
    paddingBottom: '1rem',
    textAlign: 'center',
  },
}));

const Receipts = (props) => {

  const [ purchase, setPurchase ] = useState(null);
  const [ date, setDate ] = useState(null);
  const [ produce, setProduce ] = useState(null);
  const classes = useStyles();

  useEffect(() => {
    const { purchase, date, produce } = props.location.state;
    
    // convert seconds to miliseconds
    const formattedDate = new Date(parseInt(date) * 1000);

    setPurchase(purchase);
    setDate(formattedDate.toString());
    setProduce(produce);
  }, []);


  return (
    <Container maxWidth="sm" className={classes.container}>
      <Paper className={classes.paper} elevation={5}>
        <div className="receipt-header">
          <h3>Thanks for your purchase of {produce}</h3>
        </div>

        <div className="receipt-info">
          <div>Date of Purchase: {date}</div>
          <div>Purchase Value: ${purchase}</div>
        </div>
      </Paper>
    </Container>
  )
};

export default Receipts;