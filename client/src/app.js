import { ethers } from "ethers";
import $ from "jquery";

let provider = undefined;
let currentAccount = null;

function connect() {
    ethereum
      .request({ method: 'eth_requestAccounts' })
      .then(handleAccountsChanged)
      .catch((err) => {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log('Please connect to MetaMask.');
        } else {
          console.error(err);
        }
      });
}


function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // MetaMask is locked or the user has not connected any accounts
        alert('Please connect to MetaMask.');
    } else if (accounts[0] !== currentAccount) {
        currentAccount = accounts[0];
        alert("Connected, " + currentAccount)
    }
}

$(function() { 
    if (typeof web3 !== 'undefined') {
        provider = new ethers.providers.Web3Provider(window.ethereum)
        console.log(provider)  
        console.log(ethereum.networkVersion)  
        console.log(ethereum.selectedAddress)  
        
        ethereum
        .request({ method: 'eth_accounts' })
        .then(handleAccountsChanged)
        .catch((err) => {
            
            console.error(err);
        });

        ethereum.on('accountsChanged', handleAccountsChanged);



        $('.enableEthereumButton').on("click", () => {
            $('.enableEthereumButton').attr("disabled", true);
            connect()
        });
      } else {
        alert("Metamask not found!");
      }


})


console.log($)