pragma solidity >0.4.23 <0.7.0;

import "../client/node_modules/@openzeppelin/contracts/ownership/Ownable.sol";
import "../client/node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import "./Log.sol";

contract Produce is Ownable
{
    using SafeMath for uint256;

    // struct CareLog
    // {
    //     // to be expanded...
    //     string careDescription;
    //     uint256 date;
    // }

    struct Purchase
    {
        uint256 value;
        uint256 date;
    }

    // the maximum number of logs can be returned from getLogs function
    uint256 constant logsMaxLimit = 10;
    Log[] private _logs;

    string public produceName;
    string public produceDescription;
    uint256 public producePrice;
    //uint256 public produceQuantity;
    string public url;
    string public imageURL;
    address public custodian;
    address payable public beneficiary;

    uint256 public totalPurchasesCount;
    uint256 public totalPurchasesAmount;

    //uint256 public totalCareLogsCount;

    //mapping(uint256 => CareLog) public careLogs;
    mapping(address => Purchase[]) private _purchasesHistory;        // key: buyer address; value: purchases

    event PurchaseReceived(address indexed buyer, uint256 value);
    event Withdraw(uint256 balance);
    event LogAdded(Log indexed log, address indexed owner);

    constructor
    (
        string memory _produceName, 
        string memory _produceDescription, 
        uint256 _producePrice, 
        //uint256 _produceQuantity, 
        string memory _url,
        string memory _imageURL,
        address _custodian,
        address payable _beneficiary
    )
        public
    {
        produceName = _produceName;
        produceDescription = _produceDescription;
        producePrice = _producePrice;
        //produceQuantity = _produceQuantity;
        url = _url;
        imageURL = _imageURL;
        _transferOwnership(_custodian);
        beneficiary = _beneficiary;
        //totalCareLogsCount = 0;
    }

    function setBeneficiary(address payable _beneficiary) public onlyOwner 
    {
        beneficiary = _beneficiary;
    }

    function getBuyerPurchasesCount() public view returns(uint256) 
    {
        return _purchasesHistory[msg.sender].length;
    }

    function purchase() public payable
    {
        Purchase memory _purchase = Purchase({value: msg.value, date: block.timestamp});
        _purchasesHistory[msg.sender].push(_purchase);
        totalPurchasesAmount = totalPurchasesAmount.add(msg.value);
        totalPurchasesCount = totalPurchasesCount.add(1);
        emit PurchaseReceived(msg.sender, msg.value);
    }

    function getBuyerPurchasesHistory() public view returns(uint256[] memory values, uint256[] memory dates)
    {
        uint256 _buyerPurchasesCount = getBuyerPurchasesCount();
        values = new uint256[](_buyerPurchasesCount);
        dates = new uint256[](_buyerPurchasesCount);
        for (uint256 i = 0; i < _buyerPurchasesCount; i++) 
        {
            Purchase storage _purchase = _purchasesHistory[msg.sender][i];
            values[i] = _purchase.value;
            dates[i] = _purchase.date;
        }
        return (values, dates);
    }

    function withdrawIncomes() public onlyOwner
    {
        address payable self = address(this);
        uint256 balance = self.balance;
        beneficiary.transfer(balance);
        emit Withdraw(balance);
    } 

    function logCount() public view returns(uint256)
    {
        return _logs.length;
    }

    function addLog(string memory _logDescription, string memory _logImageURL) public onlyOwner
    {
        Log log = new Log(_logDescription, _logImageURL, block.timestamp);
        _logs.push(log);
        emit LogAdded(log, msg.sender);
    }

    function getLogs() public view returns(Log[] memory logs)
    {
        uint256 numOfLogs = logCount();
        uint256 startIx = numOfLogs <= logsMaxLimit ? 0 : numOfLogs - logsMaxLimit;
        uint256 size = numOfLogs - startIx;

        logs = new Log[](size);
        for(uint256 i = 0; i < size; i++)
        {
            logs[i] = _logs[startIx + i];
        }

        return logs;
    }

    // fallback function
    function () external payable
    {
        totalPurchasesAmount = totalPurchasesAmount.add(msg.value);
        totalPurchasesCount = totalPurchasesCount.add(1);
    }

}