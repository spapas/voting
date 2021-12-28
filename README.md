# Voting in the blockchain

This project demonstrates a basic voting app with the Ethereum blockchain. It contains a Solidity
smart contract along with a simple client app. 

The smart contract has been implemented with hardhat. The client has been implemented with ethers.js
and jquery to be as simple as possible.

# Development


1. Edit the `Voter.sol` solidity contract
2. Run the tests: `npx hardhat test`
3. Copy over Voter ABI to be used by the js: `copy artifacts\contracts\Voter.sol\Voter.json client\Voter.json`
4. Run the local hardhat node: `npx hardhat node`
5. Deploy the contract to the local node: `npx hardhat run --network localhost scripts/deploy.js`
6. Import the local account to metamask
7. Run esbuild to watch for changes: `npm run watch`
8. Edit `client\src\app.js` and `client\index.html`
