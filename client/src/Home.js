import React, { useState, useEffect } from "react";
import { makeStyles } from '@material-ui/core/styles';
import getWeb3 from "./getWeb3";
import ProduceFactoryContract from "./contracts/ProduceFactory.json";
import ProduceCard from './ProduceCard';
import Web3 from 'web3';

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1),
  },
  input: {
    display: 'none',
  },
}));

const Home = () => {
	const [ prods, setProds ] = useState(null);
	const [ contract, setContract] = useState(null);
  	const [ accounts, setAccounts ] = useState(null);

	const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'));

	useEffect(() => {
		init()
	}, []);

	const init = async () => {
		try {
			  const networkId = await web3.eth.net.getId();
			  const deployedNetwork = ProduceFactoryContract.networks[networkId];
			  const accounts = await web3.eth.getAccounts();
			  const instance = new web3.eth.Contract(
			    ProduceFactoryContract.abi,
			    deployedNetwork && deployedNetwork.address,
			  );
			  setContract(instance);
			  setAccounts(accounts);

			  const prods = await instance.methods.produces(10, 0).call();
			  setProds(prods);
		}
		catch(error) {
		  alert(
		    `Failed to load web3, accounts, or contract. Check console for details.`,
		  );
		  console.error(error);
		}
	};

	const displayProduces = () => {
		if (prods) {
			return prods.map((produce) => {
			  return (
			    <ProduceCard produce={produce} key={produce}/>
			  )
			})
		}
	};

	return (
	  <div className="main-container">
	  	<h2>Home</h2>
	  	{displayProduces()}
	  </div>
	);
};

export default Home;