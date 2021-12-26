const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");

let Voter;
let voter
let owner;

beforeEach(async function () {
  Voter = await ethers.getContractFactory("Voter");
  voter = await Voter.deploy();
  [owner] = await ethers.getSigners();
  await voter.deployed();
});

describe("Voter", function () {
  it("Should return a non usable vote when constructed", async function () {
    
    const finishTime = await voter.finishTime();
    const latestBlock = await ethers.provider.getBlock("latest")
    expect(finishTime).to.equal(latestBlock.timestamp);

  });

  it("Should need the correct fee", async function () {
    await expect(voter.startVote("q", "a1", "a2", "a3", 5, {
      value: ethers.utils.parseEther("0.04")
    })).to.be.revertedWith("Invalid fee!");
  });

  it("Should not allow anther vote", async function () {

    await voter.startVote("q", "a1", "a2", "a3", 5, {
      value: ethers.utils.parseEther("0.05")
    });

    await expect(voter.startVote("q", "a1", "a2", "a3", 5, {
      value: ethers.utils.parseEther("0.05")
    })).to.be.revertedWith("Vote is not finished yet!");
  });

  it("Should start a vote with correct data", async function () {
    await voter.startVote("q", "a1", "a2", "a3", 5, {
      value: ethers.utils.parseEther("0.05")
    });
    const latestBlock = await ethers.provider.getBlock("latest")
    const [a,b,c] = await voter.getResult();
    expect(a).to.equal(0);
    expect(b).to.equal(0);
    expect(c).to.equal(0);
    const [q, a1, a2, a3, ft] = await voter.getVoteInfo();
    expect(q).to.equal("q");
    expect(a1).to.equal("a1");
    expect(a2).to.equal("a2");
    expect(a3).to.equal("a3");
    expect(ft).to.equal(latestBlock.timestamp+86400*5);
  });

  it("Should emit event with correct data data", async function () {
    //const latestBlock = await hre.ethers.provider.getBlock("latest")
    await expect(voter.startVote("q", "a1", "a2", "a3", 5, {
      value: ethers.utils.parseEther("0.05")
    })).to.emit(voter, 'StartVote');//.withArgs(owner.address, "q", "a1", "a2", "a3", latestBlock.timestamp+86400*5);
  });

  it("Should do the vote", async function () {
    await voter.startVote("q", "a1", "a2", "a3", 5, {
      value: ethers.utils.parseEther("0.05")
    });
    await expect(voter.vote(0)).to.emit(voter, 'Vote').withArgs(owner.address, 0, 1);
    await expect(voter.vote(0)).to.emit(voter, 'Vote').withArgs(owner.address, 0, 2);
    await expect(voter.vote(2)).to.emit(voter, 'Vote').withArgs(owner.address, 2, 1);
    const [a,b,c] = await voter.getResult();
    expect(a).to.equal(2);
    expect(b).to.equal(0);
    expect(c).to.equal(1);
  });

  it("Should not allow voting on finished votes", async function () {
    await expect(voter.vote(0)).to.be.revertedWith("Vote is finished!");
  });

  function r(v) {
    return (Math.round(ethers.utils.formatEther(v)*100)/100);
  }

  it("Should withdraw funds", async function () {
    const provider = waffle.provider;
    
    let ownerBalance = await provider.getBalance(owner.address);
    let voterBalance = await provider.getBalance(voter.address);
    expect(voterBalance).to.equal(ethers.utils.parseEther("0.0"));
    await voter.startVote("q", "a1", "a2", "a3", 5, {
      value: ethers.utils.parseEther("0.05")
    });
    voterBalance = await provider.getBalance(voter.address);
    expect(voterBalance).to.equal(ethers.utils.parseEther("0.05"));
    
    let ownerBalanceAfterStart = await provider.getBalance(owner.address);
    
    await voter.withdraw();
    let ownerBalanceAfterWithdraw = await provider.getBalance(owner.address);
    //console.log(r(ownerBalance))
    //console.log(r(ownerBalanceAfterStart))
    //console.log(r(ownerBalanceAfterWithdraw))
    expect(r(ownerBalance)).to.be.closeTo(r(ownerBalanceAfterStart) + 0.05, 0.0001);
    expect(r(ownerBalance)).to.be.closeTo(r(ownerBalanceAfterWithdraw), 0.0001);
    


  });

});
