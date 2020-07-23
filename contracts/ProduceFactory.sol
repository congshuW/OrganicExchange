pragma solidity >0.4.23 <0.7.0;

import "./Produce.sol";

contract ProduceFactory
{
	// the maximum number of produces can be returned from produces function
	uint256 constant maxLimit = 20;

	Produce[] private _produces;

	event ProduceCreated(Produce indexed produce, address indexed owner);

	function produceCount() public view returns(uint256) 
	{
		return _produces.length;
	}

	function createProduce
	(
		string memory _produceName, 
        string memory _produceDescription, 
        uint256 _producePrice, 
        //uint256 _produceQuantity, 
        string memory _url,
        string memory _imageURL,
        address payable _beneficiary
	)
		public
	{
		Produce produce = new Produce(
			_produceName,
			_produceDescription,
			_producePrice,
			//_produceQuantity,
			_url,
			_imageURL,
			msg.sender,
			_beneficiary
		);
		_produces.push(produce);
		emit ProduceCreated(produce, msg.sender);
	}

	function produces(uint256 limit, uint256 offset) public view returns(Produce[] memory produces)
	{
		require(offset <= produceCount(), "offset out of bounds");

		// size should be the smallest among count, limit and max limit
		uint256 size = produceCount() - offset;
		size = size < limit ? size : limit;
		size = size < maxLimit ? size : maxLimit;

		produces = new Produce[](size);
		for(uint256 i = 0; i < size; i++) {
			produces[i] = _produces[offset + i];
		}
		return produces;
	}
}