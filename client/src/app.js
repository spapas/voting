import { ethers } from "ethers";
import $ from "jquery";
import voterAbi from '../Voter.json';

const voterAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
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

        //const signer = provider.getSigner();
        //signer.signMessage("Some custom message").then(signature => {
            //console.log("OK", signature);
        //})
    }
}

$(function() { 
    if (typeof web3 !== 'undefined') {
        provider = new ethers.providers.Web3Provider(window.ethereum)
        
        if(ethereum.networkVersion == 1) {
            $('#networkVersion').text(ethereum.networkVersion + " (Warning: Mainnet!!!)");
        } else {
            $('#networkVersion').text(ethereum.networkVersion + " (Warning:  Test!!!)");
            $('#networkVersion').addClass("font-black").addClass("text-blue-500")

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

        const abi = voterAbi.abi
        const signer = provider.getSigner();
        //const voterContract = new ethers.Contract(voterAddress, abi, provider);
        const voterContract = new ethers.Contract(voterAddress, abi, signer);

        $('#startVoteButton').on("click", () => {
            const q = $('#question').val()
            const a = $('#answer_a').val()
            const b = $('#answer_b').val()
            const c = $('#answer_c').val()
            const d = $('#duration').val()
            if(!q || !a || !b || !c || !d) {
                alert("Please fill all params");
            } else {
                voterContract.startVote(q, a, b, c, d, {
                    value: ethers.utils.parseEther("0.05")
                }).then(tx => {
                    console.log(tx);
                }).catch(err => {
                    console.log(err);
                    alert(err.data.message)
                })
            }
            
        });

        
        voterContract.getVoteInfo().then(resp => {
            console.log(resp)
            let isActive = resp[0]
            if(isActive) {
                console.log("Vote is active")
                $('#doVote').removeClass("hidden")
            } else {
                console.log("Vote is not active")
                $('#newVote').removeClass("hidden")
                
            }
            
        }).catch((err) => {
            console.error(err);
        });

      } else {
        alert("Metamask not found!");
        disable($('#enableEthereumButton'));
      }


})

