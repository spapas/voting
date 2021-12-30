//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract Voter is Ownable {
    address public voteFrom; 
    string public question;
    string public choice_a;
    string public choice_b;
    string public choice_c;
    uint public vote_a;
    uint public vote_b;
    uint public vote_c;
    uint public finishTime;
    uint dayFee = 0.01 ether;

    event StartVote(address indexed startVoteFrom, string question, string choice_a, string choice_b, string choice_c, uint finishTime);
    event Vote(address indexed voteFrom, uint indexed choice, uint total);
    event FinishVote(address indexed from);

    constructor() {
        finishTime = block.timestamp;
    }

    modifier voteFinished() {
        require(block.timestamp >= finishTime, "Vote is not finished yet!");
        _;
    }

    modifier voteNotFinished() {
        require(block.timestamp < finishTime, "Vote is finished!");
        _;
    }

    function withdraw() external onlyOwner {
        address _owner = owner();
        payable(_owner).transfer(address(this).balance);
    }

    function startVote(string calldata _question, string calldata _choice_a, string calldata  _choice_b, string calldata  _choice_c, uint _days) public payable voteFinished {
        require(msg.value == dayFee * _days, "Invalid fee!");
        question = _question;
        choice_a = _choice_a;
        choice_b = _choice_b;
        choice_c = _choice_c;
        finishTime = block.timestamp + _days * 1 days;
        voteFrom = msg.sender;
        vote_a = 0;
        vote_b = 0;
        vote_c = 0;
        emit StartVote(msg.sender, question, choice_a, choice_b, choice_c, finishTime);
    }

    function vote(uint _choice) public voteNotFinished {
        
        uint tot = 0;
        if (_choice == 0) {
            vote_a += 1;
            tot = vote_a;
        } else if (_choice == 1) {
            vote_b += 1;
            tot = vote_b;
        } else {
            vote_c += 1;
            tot = vote_c;
        }
        emit Vote(msg.sender, _choice, tot);
    }

    function finish() public voteNotFinished {
        require(msg.sender == voteFrom || msg.sender == owner(), "Only the owner can finish the vote!");
        finishTime = block.timestamp;
        emit FinishVote(msg.sender);
    }

    function getResult() public view returns (uint, uint, uint) {
        return (vote_a, vote_b, vote_c);
    }

    function getVoteInfo() public view returns (bool, address, string memory, string memory, string memory, string memory, uint) {
        bool isActive = bool(block.timestamp < finishTime);
        return (isActive, voteFrom, question, choice_a, choice_b, choice_c, finishTime);
    }
    
}
