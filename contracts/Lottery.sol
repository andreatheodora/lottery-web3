// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Lottery {
    address public manager;
    address[] public players;
    uint256 public prizePool;
    uint public numberOfTickets;
    address public winner;
    bool public lotteryIsOver;

    event NewEntry(
        address indexed from,
        uint256 timestamp,
        uint amount
    );

    struct Entry {
        address from;
        uint256 timestamp;
        uint amount;
    }


    constructor() {
        manager = msg.sender;
        numberOfTickets = 50;
        lotteryIsOver = false;
    }

    function enter(uint _amount) public payable {
        uint256 ticketPrice = 1000000000000000;

        uint256 _total = _amount * ticketPrice;

        require(msg.value >= _total, "Amount not enough.");

        uint j=0;

        for (j = 0; j < _amount; j += 1) {  //for loop example
            players.push(msg.sender);
        }

        numberOfTickets = numberOfTickets - _amount;
        
        emit NewEntry(
            msg.sender,
            block.timestamp,
            _amount
        );
    }

    function getPlayers() public view returns (address[] memory) {
        return players;
    }

     function pickWinner() public restricted {
        require(players.length > 0, "No players in the lottery");

        uint256 index = random() % players.length;
        address payable result = payable(players[index]);
        winner = result;
        result.transfer(address(this).balance);

        players = new address[](0); // Resetting the players array

        numberOfTickets = 50;
        lotteryIsOver = true;
    }

    function random() private view returns (uint256) {
        return uint256(
            keccak256(abi.encodePacked(block.difficulty, block.timestamp, players.length))
        );
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getTicketsRemaining() public view returns (uint) {
        return numberOfTickets;
    }

    function isAdmin(address _addr) public view returns (bool) {
        if (manager == _addr) {
            return true;
        } else {
            return false;
        }
    }

    function isWinner(address _addr) public view returns (bool) {
        if (winner == _addr) {
            return true;
        } else {
            return false;
        }
    }

    function getLotteryIsOver() public view returns (bool) {
        return lotteryIsOver;
    }

    function restartLottery() public restricted {
        lotteryIsOver = false;
    }

    modifier restricted() {
        require(msg.sender == manager, "Only the manager can call this function");
        _;
    }
}
