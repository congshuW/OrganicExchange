const path = require("path");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  build_directory: path.join(__dirname, "client/src/contracts"),
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
    	host: "127.0.0.1",
      	port: 9545,
      	network_id: "*",
    }
  }
};
