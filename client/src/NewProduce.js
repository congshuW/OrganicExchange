import React, { useState, useEffect } from "react";
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

import getWeb3 from "./getWeb3";
import ProduceFactoryContract from "./contracts/ProduceFactory.json";

const useStyles = makeStyles(theme => ({
	root: {
	  flexGrow: 1,
	},
	paper: {
	  padding: theme.spacing(2),
	  margin: 'auto',
	  maxWidth: 500,
	},
	h2: {
		textAlign: 'center',
	},
	  button: {
	    margin: theme.spacing(2),
	  }
}));

const NewProduce = () => {

	const [ web3, setWeb3 ] = useState(null);
	const classes = useStyles();

	useEffect(() => {
		const init = async() => {
		    try {
		      const web3 = await getWeb3();
		      const networkId = await web3.eth.net.getId();
		      const deployedNetwork = ProduceFactoryContract.networks[networkId];
		      const accounts = await web3.eth.getAccounts();
		      const instance = new web3.eth.Contract(
		        ProduceFactoryContract.abi,
		        deployedNetwork && deployedNetwork.address
		      );

		      setWeb3(web3);
		      setContract(instance);
		      setAccounts(accounts);

		    } catch(error) {
		      alert(
		        `Failed to load web3, accounts, or contract. Check console for details.`,
		      );
		      console.error(error);
		    }
		}
		init();
	}, []);

	const [ produceName, setProduceName ] = useState(null);
	const [ produceDescription, setProduceDescription ] = useState(null);
	const [ producePrice, setProducePrice ] = useState(null);
	const [ url, setUrl ] = useState(null);
	const [ imageURL, setImageURL ] = useState(null);

	const [ address, setAddress ] = useState(null);
	const [ contract, setContract] = useState(null);
	const [ accounts, setAccounts ] = useState(null);

	const handleSubmit = async () => {
		const beneficiary = address;
		if (contract !== null) {
			contract.methods.createProduce(
			    produceName,
			    produceDescription,
			    producePrice,
			    url,
			    imageURL,
			    beneficiary
			).send({ from: accounts[0] }).then(function(error, transactionHash) {
				console.log(error);
				console.log(transactionHash);
			});
		}
		alert('Successfully created produce');
	};

	return (
	    <div className={classes.root}>
		    <h2 className={classes.h2}>Create a New Produce</h2>
		    <Paper className={classes.paper} elevation={5}>
			    <Grid container spacing={3} align="center" alignItems="center" justify="center">
			    	<Grid item xs={12}>
					    <label>Produce Name</label>
					    <TextField
					      id="outlined-bare"
					      type = "text"
					      className={classes.textField}
					      placeholder="Produce Name"
					      margin="normal"
					      onChange={(e) => setProduceName(e.target.value)}
					      variant="outlined"
					      inputProps={{ 'aria-label': 'bare' }}
					    />
					</Grid>

					<Grid item xs={12}>
					    <label>Produce Description</label>
					    <TextField
					      id="outlined-bare"
					      type = "text"
					      className={classes.textField}
					      placeholder="Produce Description"
					      margin="normal"
					      onChange={(e) => setProduceDescription(e.target.value)}
					      variant="outlined"
					      inputProps={{ 'aria-label': 'bare' }}
					    />
					</Grid>

					<Grid item xs={12}>
					    <label>Produce Price</label>
					    <TextField
					      id="outlined-bare"
					      type = "number"
					      className={classes.textField}
					      placeholder="Produce Price"
					      margin="normal"
					      onChange={(e) => setProducePrice(e.target.value)}
					      variant="outlined"
					      inputProps={{ 'aria-label': 'bare' }}
					    />
					</Grid>

					<Grid item xs={12}>
					    <label>Website</label>
					    <TextField
					      id="outlined-bare"
					      type = "url"
					      className={classes.textField}
					      placeholder="Website"
					      margin="normal"
					      onChange={(e) => setUrl(e.target.value)}
					      variant="outlined"
					      inputProps={{ 'aria-label': 'bare' }}
					    />
					</Grid>

					<Grid item xs={12}>
					    <label>Image</label>
					    <TextField
					      id="outlined-bare"
					      type = "url"
					      className={classes.textField}
					      placeholder="Produce Image"
					      margin="normal"
					      onChange={(e) => setImageURL(e.target.value)}
					      variant="outlined"
					      inputProps={{ 'aria-label': 'bare' }}
					    />
					</Grid>

					<Grid item xs={12}>
					    <label>Address</label>
					    <TextField
					      id="outlined-bare"
					      className={classes.textField}
					      placeholder="Produce Ethereum Address"
					      margin="normal"
					      onChange={(e) => setAddress(e.target.value)}
					      variant="outlined"
					      inputProps={{ 'aria-label': 'bare' }}
					    />
					</Grid>

				    <Button
				      onClick={handleSubmit}
				      variant="contained"
				      className={classes.button}>
				      Submit
				    </Button>
				</Grid>
			</Paper>
	    </div>
	)
};

export default NewProduce;