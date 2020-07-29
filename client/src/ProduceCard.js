import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Collapse from '@material-ui/core/Collapse';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import clsx from 'clsx';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import FilledInput from '@material-ui/core/FilledInput';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';

import Container from '@material-ui/core/Container';

import Divider from '@material-ui/core/Divider';

import Grid from '@material-ui/core/Grid';

import ProduceContract from "./contracts/Produce.json";

import { Link } from 'react-router-dom';

import getWeb3 from "./getWeb3";
import ProduceFactoryContract from "./contracts/ProduceFactory.json";
import Web3 from 'web3'

const cc = require('cryptocompare');

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing(1),
    display: 'table-cell'
  },
  card: {
    maxWidth: 450,
    
  },
  media: {
    height: 140,
  },
  paper: {
    position: 'absolute',
    width: 500,
    backgroundColor: theme.palette.background.paper,
    border: 'none',
    boxShadow: 'none',
    padding: 4,
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  container: {
    paddingTop: '1rem',
    paddingBottom: '1rem',
  },
  img: {
    display: 'block',
    margin: 'auto',
  },
  divider: {
    margin: '1rem 0', 
  },
}));

const ProduceCard = (props) => {

  const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'))

  const [ contract, setContract] = useState(null);
  const [ accounts, setAccounts ] = useState(null);
  const [ prod, setProduce ] = useState(null);
  const [ produceName, setProduceName ] = useState(null);
  const [ produceDescription, setProduceDescription ] = useState(null);
  const [ producePrice, setProducePrice ] = useState(null);
  const [ totalPurchasesAmount, setTotalPurchasesAmount ] = useState(null);
  const [ totalPurchasesCount, setTotalPurchasesCount ] = useState(null);
  const [ imageURL, setImageURL ] = useState(null);
  const [ url, setURL ] = useState(null);
  const [ purchaseAmount, setPurchaseAmount ] = useState(null);
  const [ open, setOpen ] = React.useState(false);
  const [ exchangeRate, setExchangeRate ] = useState(null);
  const [ buyerPurchaseHistory, setBuyerPurchaseHistory ] = useState(null);
  const [ isOwner, setIsOwner ] = useState(false);
  const [ beneficiary, setNewBeneficiary] = useState(null);
  const [ logs, setLogs] = useState(null);
  const [ isOwnerExpanded, setIsOwnerExpanded] = useState(false);
  const [ logDescription, setLogDescription] = useState(null);
  const [ logImageURL, setLogImageURL] = useState(null);

  const ethAmount = (purchaseAmount / exchangeRate || 0).toFixed(4);

  const { produce } = props;

  const classes = useStyles();

  useEffect(() => {
    if(produce) {
      init(produce)
    }
  }, [produce]);

  const init = async (produce) => {
    try {
      const prod = produce
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = ProduceFactoryContract.networks[networkId];
      const accounts = await web3.eth.getAccounts();
      const instance = new web3.eth.Contract(
        ProduceContract.abi,
        prod
      );
      setContract(instance);
      setAccounts(accounts);

      const produceName = await instance.methods.produceName().call();
      const produceDescription = await instance.methods.produceDescription().call();
      const producePrice = await instance.methods.producePrice().call();
      const imageURL = await instance.methods.imageURL().call();
      const url = await instance.methods.url().call();
      const totalPurchasesAmount = await instance.methods.totalPurchasesAmount().call();

      // calculate the exchange rate here
      const exchangeRate = await cc.price('ETH', ['USD']);
      setExchangeRate(exchangeRate.USD)
      // pass in the coin you want to check and the currency
      const eth = web3.utils.fromWei(totalPurchasesAmount, 'ether');
      const dollarPurchaseAmount = exchangeRate.USD * eth;
      setTotalPurchasesAmount(dollarPurchaseAmount);

      setProduceName(produceName);
      setProduceDescription(produceDescription);
      setProducePrice(producePrice);
      setImageURL(imageURL);
      setURL(url);

      const buyerPurchaseHistory = await instance.methods.getBuyerPurchasesHistory().call({ from: accounts[0] });
      setBuyerPurchaseHistory(buyerPurchaseHistory);

      const logs = await instance.methods.getLogs().call();
      setLogs(logs);

      const user = accounts[0];
      console.log("acct 0", user)
      const isOwner = await instance.methods.owner().call();

      if (isOwner === user) {
        setIsOwner(true);
      }
    }
    catch(error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  window.ethereum.on('accountsChanged', function (accounts) {
      window.location.reload(true);
  });

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const submitPurchase = async () => {
    const ethRate = exchangeRate;
    const ethTotal = purchaseAmount / ethRate;
    const purchase = web3.utils.toWei(ethTotal.toString());

    contract.methods.purchase().send({
      from: accounts[0],
      value: purchase,
      gas: 650000
    }).then(function(error, transactionHash){
      console.log(error);
      console.log(transactionHash);
      setOpen(false);
    });
  };

  const renderPurchaseHistory = () => {
    var history = buyerPurchaseHistory;
    
    if (history === null) {return null};

    const totalPurchases = history.values.length
    let purchaseList = []
    var i
    for (i = 0; i < totalPurchases; i++) {
      const ethAmount = web3.utils.fromWei(history.values[i]);
      const userPurchaseAmount = exchangeRate * ethAmount;
      const purchaseDate = history.dates[i];
      purchaseList.push({ amount: userPurchaseAmount.toFixed(2), date: purchaseDate});
    }

    return purchaseList.map((purchase) => {
      return (
        <div className="purchase-list" key={purchase.amount + purchase.date}>
          <p>${purchase.amount}</p>

          <Button variant="contained" color="primary">
            <Link className="purchase-receipt-link" to={{ pathname: '/receipts', state: { produce: produceName, purchase: purchase.amount, date: purchase.date} }}>
              Request Receipt
            </Link>
          </Button>
        </div>
      )
    })
  };

  const addOneLog = async () => {
    contract.methods.addLog(logDescription, logImageURL).send({from: accounts[0], gas: 750000}).then(function(receipt){
      console.log(receipt);
    });;
    alert(`Log is added.`)
    setOpen(false);
  };

  const expandOwnerArea = () => {
    setIsOwnerExpanded(!isOwnerExpanded);
  };

  const withdrawIncomes = async () => {
    //const contract_balance = await web3.eth.getBalance(contract.options.address);
    //console.log(contract_balance);
    //await contract.methods.withdrawIncomes().send({ from: accounts[0], });
    
    contract.methods.withdrawIncomes().send({
      from: accounts[0],
    }).on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      console.log(error);
      console.log(receipt);
    });

    const eth = web3.utils.fromWei(await web3.eth.getBalance(contract.options.address), 'ether');
    const dollarPurchaseAmount = exchangeRate * eth;
    setTotalPurchasesAmount(dollarPurchaseAmount);

    alert('Funds Withdrawn!');
    setOpen(false);
  }

  const setBeneficiary = async () => {
    await contract.methods.setBeneficiary(beneficiary).send({
      from: accounts[0],
    })

    alert(`Fundraiser Beneficiary Changed`)
    setOpen(false);
  };

  return (
    <Grid item xs={12} sm={6} md={3} key={produceName}>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Purchase {produceName}</DialogTitle>
          <DialogContent>
            <DialogContentText component="div">
              <img className={classes.img} src={imageURL} width='200px' height='200px' />
              <p>${producePrice}</p>
              <p>{produceDescription}</p>
              <p>{url}</p>
              <Button variant="contained" color="primary">
                <Link className="see-log-link" to={ {pathname: '/logs', state: {produceName: produceName, logs: logs}} }>
                  See Logs
                </Link>
              </Button>

              <div className="purchase-input-container">
                <FormControl className={classes.formControl}>
                  $
                  <Input
                    id="component-simple"
                    value={purchaseAmount || ""}
                    type = "number"
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    placeholder="0.00"
                   />
                </FormControl>

                <p>Eth: {ethAmount}</p>
              </div>

              <Button onClick={submitPurchase} variant="contained" color="primary">
                  Purchase
              </Button>

              <div>
                <h3>My Purchases</h3>
                {renderPurchaseHistory()}
              </div>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            {isOwner &&
              <IconButton className={clsx(classes.expand, {
                [classes.expandOpen]: isOwnerExpanded,
                })} 
                onClick={expandOwnerArea} aria-expanded={isOwnerExpanded} aria-label="show more">
                <ExpandMoreIcon />
              </IconButton>
            }

            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
          </DialogActions>
          <Collapse in={isOwnerExpanded} timeout="auto" unmountOnExit>
              <Container maxWidth="sm" className={classes.container}>
                <h2>Tell others how the produce is grown</h2>

                <label>Verbal Description</label>
                <TextField
                  id="outlined-bare"
                  type = "text"
                  className={classes.textField}
                  placeholder="Nurture Description"
                  margin="normal"
                  onChange={(e) => setLogDescription(e.target.value)}
                  variant="outlined"
                  inputProps={{ 'aria-label': 'bare' }}
                />

                <label>Visual Proof</label>
                <TextField
                  id="outlined-bare"
                  type = "text"
                  className={classes.textField}
                  placeholder="Visual Proof"
                  margin="normal"
                  onChange={(e) => setLogImageURL(e.target.value)}
                  variant="outlined"
                  inputProps={{ 'aria-label': 'bare' }}
                />

                <Button variant="contained" style={{ marginTop: 20 }} color="primary"
                    onClick={addOneLog}>
                  Add Log
                </Button>
              
                <Divider className={classes.divider}/>

                <FormControl className={classes.formControl}>
                  Beneficiary:
                  <Input
                    value={beneficiary || ""}
                    onChange={(e) => setNewBeneficiary(e.target.value)}
                    placeholder="Set Beneficiary"
                   />
                </FormControl>

                <Button variant="contained" style={{ marginTop: 20 }} color="primary"
                    onClick={setBeneficiary}>
                  Set Beneficiary
                </Button>
                

                <Divider className={classes.divider}/>

                
                <Button variant="contained" color="primary" onClick={withdrawIncomes}>
                  Withdraw
                </Button>
              </Container>
          </Collapse>
      </Dialog>
      <Card className={classes.card} onClick={handleOpen}>
        <CardActionArea>
          <CardMedia className={classes.media} component="div" image={imageURL} title="Produce Image"/>
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {produceName}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="span">
              <p>{produceDescription}</p>
              <p>Total Purchase: ${totalPurchasesAmount}</p>
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  )
}

export default ProduceCard;