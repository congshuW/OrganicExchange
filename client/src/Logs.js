import React, { useState, useEffect } from "react";

import getWeb3 from "./getWeb3";
import LogsContract from "./contracts/Log.json";

const Logs = (props) => {
	const [ produceName, setProduceName ] = useState(null);
	const [ logs, setLogs ] = useState(null);
	const [ logList, setLogList ] = useState([]);

	useEffect(() => {
		const { produceName, logs } = props.location.state;
		setProduceName(produceName);
		setLogs(logs);
		init(logs);
	}, []);

	const init = async(logs) => {
	    try {
	    	const web3 = await getWeb3();
	    	const networkId = await web3.eth.net.getId();
	    	let logList = [];
	    	const numOfLogs = logs.length;
		    var i;
		    for (i = 0; i < numOfLogs; i++) {
		    	let instance = new web3.eth.Contract(LogsContract.abi, logs[i]);
		    	let logDescription = await instance.methods.logDescription().call();
		      	let logImageUrl = await instance.methods.logImageURL().call();
		      	let date = await instance.methods.date().call();
		      	let formattedDate = new Date(parseInt(date) * 1000).toString();
		      	logList.push({description: logDescription, imageUrl: logImageUrl, dt: formattedDate});
	      	}
	      	setLogList(logList);
	      	console.log(logList)
	    } catch(error) {
	      alert(
	        `Failed to load logs.`,
	      );
	      console.error(error);
	    }
	};

	const displayLogs = () => {
		return logList.map((log) => {
			return (
				<div key={log.description + log.dt}>
				  <p>{log.description}</p>
				  <img src={log.imageUrl} width='200px' height='200px' />
				  <p>{log.dt}</p>
				</div>
			)
		});
	};

	return (
	  <div className="log-container">
	    <div className="log-header">
	      <h3>Here shows how {produceName} is grown</h3>
	    </div>

	    <div className="log-info">
	      {displayLogs()}
	    </div>
	  </div>
	)
};

export default Logs;