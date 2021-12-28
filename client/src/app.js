import { ethers } from "ethers";
import $ from "jquery";
import voterAbi from '../Voter.json';

const voterAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
let provider = undefined;
let currentAccount = null;

function showLoader(text) {
    $('#loader p').text(text);
    $('#loader').removeClass('hidden');
}

function hideLoader(text) {
    
    $('#loader').addClass('hidden');
}

function disable(el) {
    el.prop("disabled", true);
    el.addClass("opacity-50").addClass("cursor-not-allowed");
}

function enable(el) {
    el.prop("disabled", false);
    el.removeClass("opacity-50").removeClass("cursor-not-allowed");
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

        voterContract.on("StartVote", (from, question, choice_a, choice_b, choice_c, finishTime, event) => {
            console.log("StartVote EVENT", from, question, choice_a, choice_b, choice_c, finishTime, event);
            console.log(event)
            //alert("Start vote event received! with data: " + from + " " + question + " " + choice_a + " " + choice_b + " " + choice_c + " " + finishTime);
            //window.location = "/"
        });

        voterContract.on("Vote", (from, choice, total, event) => {
            console.log("Vote event received! with data: " + from + " " + choice + " " + total +" " + event);
            console.log(event)
            voterContract.getResult().then(result => {
                let [a, b, c] = result;
                console.log("RES", result)
                $('#resultsDiv').text(a.toString() + " / " + b.toString() + " / " + c.toString());
            })
        });

        
        voterContract.on("FinishVote", (from, event) => {
            console.log("FinishVote event received! with data: " + from +"  " + event);
            console.log(event)
            
        });

        $('#startVoteButton').on("click", () => {
            const q = $('#question').val()
            const a = $('#answer_a').val()
            const b = $('#answer_b').val()
            const c = $('#answer_c').val()
            const d = $('#duration').val()
            disable($('#startVoteButton'));
            if(!q || !a || !b || !c || !d) {
                alert("Please fill all params");
            } else {
                voterContract.startVote(q, a, b, c, d, {
                    value: ethers.utils.parseEther( (d * 0.01).toString() )
                }).then(tx => {
                    console.log(tx);
                    console.log(tx.hash);
                    showLoader("Transaction tx: " + tx + ". Waiting for transaction to be mined...");
                    provider.waitForTransaction(tx.hash).then(res => {
                        console.log("ok ", res)
                        
                        window.location="/"
                    }).catch(err => {
                        alert("Error: " + err.message);
                        enable($('#startVoteButton'));
                    })

                }).catch(err => {
                    console.log(err);
                    alert("Error: " + err.message);
                    enable($('#startVoteButton'));
                })
            }
        });

        $('#voteButton').on("click", () => {
            const v = $('input[name=vote]:checked').val()
            if(!v) {
                alert("Please select a choice!")
            } else {
                disable($('#voteButton'))
                voterContract.vote(v).then(tx => {
                    showLoader("Transaction tx: " + tx + ". Waiting for transaction to be mined...");
                    provider.waitForTransaction(tx.hash).then(res => {
                        console.log("ok ", res)
                        enable($('#voteButton'))
                        hideLoader();
                    }).catch(err => {
                        alert("Error: " + err.message);
                        hideLoader();
                    })
                    
                }).catch(err => {
                    enable($('#voteButton'))
                    alert(err.message)
                })
            }
        })

        $('#finishVoteButton').on("click", () => {
            voterContract.finish().then(tx => {
                
                showLoader("Vote finished! " + tx + ". Please wait for confirmation...");

                provider.waitForTransaction(tx.hash).then(res => {
                    
                    window.location="/"
                }).catch(err => {
                    alert("Error: " + err);
                    hideLoader()
                })

            }).catch(err => {
                console.log(err);
                hideLoader()
            })
            
        })



        voterContract.getVoteInfo().then(resp => {
            console.log(resp)
            let [isActive, voteFrom, question, answer_a, answer_b, answer_c, finishTime] = resp
            if(isActive) {
                console.log("Vote is active");
                
                $('#questionDiv').text(question);
                $('#answerAlabel').text(answer_a);
                $('#answerBlabel').text(answer_b);
                $('#answerClabel').text(answer_c);
                $('#finishOnDiv').text(new Date(1000*finishTime));

                $('#doVote').removeClass("hidden")
                console.log(voteFrom);
            } else {
                voterContract.getResult().then(resp => {
                    let [a, b, c] = resp
                    console.log("Vote is not active")
                    $('#newVote').removeClass("hidden")
                    let ovr = `Question: <b>${question}</b><br />
                    Answer A: <b>${answer_a} -> ${a}</b><br />
                    Answer B: <b>${answer_b} -> ${b} </b><br />
                    Answer C: <b>${answer_c} -> ${c}</b><br />
                    Finished on: ${new Date(1000*finishTime)}<br />
                    Vote from: ${voteFrom}`

                    $('#oldVoteResults').html(ovr)
                    console.log(ovr)
                }).catch(err => {
                    console.log(err);
                    alert(err.data.message)
                })
            }
            
        }).catch(err => {
            console.log(err);
        });

      } else {
        alert("Metamask not found!");
        disable($('#enableEthereumButton'));
      }


})

