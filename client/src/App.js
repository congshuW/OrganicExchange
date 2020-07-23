import React, { useState, useEffect } from "react";
import ProduceFactoryContract from "./contracts/ProduceFactory.json";
import getWeb3 from "./getWeb3";
import { BrowserRouter as Router, Route, NavLink } from "react-router-dom";

import Home from './Home'
import NewProduce from './NewProduce'
import Receipts from './Receipts'
import Logs from './Logs'
import "./App.css";

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

const App = () => {
  const [state, setState] =
      useState({web3: null, accounts: null, contract: null});
  const [storageValue, setStorageValue] = useState(0);

  useEffect(() => {
    const init = async() => {
      try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = ProduceFactoryContract.networks[networkId];
        const instance = new web3.eth.Contract(
          ProduceFactoryContract.abi,
          deployedNetwork && deployedNetwork.address,
        );

        setState({web3, accounts, contract: instance});
      } catch(error) {
        alert(
          `Failed to load web3, accounts, or contract.
          Check console for details.`,
        )
        console.error(error);
      }
    }
    init();
  }, []);

  const useStyles = makeStyles({
    root: {
      flexGrow: 1,
    },
  });

  const classes = useStyles();

  const runExample = async () => {
    const { accounts, contract } = state;
  };

  return(
    <Router>
      <div>
        <AppBar position="static" color="default">
          <Toolbar>
           <Typography variant="h6" color="inherit">
             <NavLink className="nav-link" to="/">Home</NavLink>
           </Typography>
           <NavLink className="nav-link" to="/new/">New Produce</NavLink>
          </Toolbar>
       </AppBar>

        <Route path="/" exact component={Home} />
        <Route path="/new/" component={NewProduce} />
        <Route path="/receipts" component={Receipts} />
        <Route path="/logs" component={Logs} />
      </div>
    </Router>
  );
}

export default App;