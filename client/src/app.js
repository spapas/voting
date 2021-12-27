import { ethers } from "ethers";
import $ from "jquery";

let provider = undefined;
let currentAccount = null;

function disable(el) {
    el.prop("disabled", true);
    el.addClass("opacity-50").addClass("cursor-not-allowed");
}

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
        alert('Please connect to MetaMask.');
    } else if (accounts[0] !== currentAccount) {
        
        currentAccount = accounts[0];
        provider.getBalance(currentAccount).then(balance => {
            console.log(balance)
            $('#balance').text(ethers.utils.formatEther(balance) + " ETH");
        });
        
        $('#account').text(currentAccount);
        disable($('#enableEthereumButton'));
    }
}

$(function() { 
    if (typeof web3 !== 'undefined') {
        provider = new ethers.providers.Web3Provider(window.ethereum)
        
        if(ethereum.networkVersion == 1) {
            $('#networkVersion').text(ethereum.networkVersion + " (Warning: Mainnet!!!)");
            $('#networkVersion').addClass("font-black").addClass("text-red-500")
        }
        
        ethereum.request({ method: 'eth_accounts' })
        .then(handleAccountsChanged)
        .catch((err) => {
            console.error(err);
        });

        ethereum.on('accountsChanged', handleAccountsChanged);

        $('#enableEthereumButton').on("click", () => {
            disable($('#enableEthereumButton'));
            connect()
        });
      } else {
        alert("Metamask not found!");
        disable($('#enableEthereumButton'));
      }


})

