pragma solidity >0.4.23 <0.7.0;

import "../client/node_modules/@openzeppelin/contracts/ownership/Ownable.sol";

contract Log is Ownable
{
	string public logDescription;
	string public logImageURL;
	uint256 public date;

	constructor(string memory _logDescription, string memory _logImageURL, uint256 _date) public
	{
		logDescription = _logDescription;
		logImageURL = _logImageURL;
		date = _date;
	}
}