import abi from './utils/Lottery.json';
import {BigNumber, ethers} from 'ethers';
import React, {useState, useEffect} from 'react';
import MousePointer from './MousePointer';
import anime from 'animejs';
import './css/App.css';

const App = () => {
    // Contract address & ABI
    const contractAddress = "0x8Ce74680a93ba181e4D4200AeC084Ac9b9eb4d35"
    const contractABI = abi.abi

    // Spinning squares animation
    const squaresCount = 36;

    const shapes = Array(squaresCount)
        .fill()
        .map((_, index) => <div key={index} className="square"></div>);

    useEffect(() => {
        const squares = document.querySelectorAll('.square');

        squares.forEach((square, index) => {
            const row = Math.floor(index / 6);
            const col = index % 6;

            const delay = row * 100 + col * 100;
            anime({
                targets: square,
                keyframes: [
                    {rotate: '0deg', scale: 1, borderRadius: '0%', opacity: '100%'},
                    {rotate: '360deg', scale: 1.25, borderRadius: '50%'},
                    {rotate: '720deg', scale: 1, borderRadius: '0%', opacity: '0%'},
                ],
                duration: 4000,
                easing: 'easeInOutQuad',
                loop: true,
                delay: delay,
            });
        });
    }, []);

    // Wallet Check & Connect, Ticket prices functionality
    const [currentAccount, setCurrentAccount] = useState("");
    const [showHiddenDiv, setShowHiddenDiv] = useState(false);
    const [numberOfTickets, setNumberOfTickets] = useState(0);
    const [totalCost, setTotalCost] = useState(0);

    // Lottery Info

    const [currentPrize, setCurrentPrize] = useState(0)
    const [ticketsRemaining, setTicketsRemaining] = useState(0)

    const getLotteryInfo = async () => {
        try {
            const {ethereum} = window;
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum)
                const signer = provider.getSigner();
                const lottery = new ethers.Contract(
                    contractAddress,
                    contractABI,
                    signer
                );

                console.log("fetching lottery data...");
                const prizeInWei = await lottery.getContractBalance();
                const prize = prizeInWei / (10 ** 18);
                console.log(prize.toString());
                setCurrentPrize(prize.toString());
                const ticketsRemaining = await lottery.getTicketsRemaining();
                console.log(ticketsRemaining)
                setTicketsRemaining(parseInt(ticketsRemaining));
                console.log("fetched!");

            }
        } catch (error) {
            console.log(error);
        }
    };

    const checkMetaMaskConnection = async () => {
        const {ethereum} = window;
        if (ethereum && ethereum.selectedAddress) {
            console.log("MetaMask is connected");
            setCurrentAccount(ethereum.selectedAddress);
            console.log("Logged in as: "+ethereum.selectedAddress);
        } else {
            console.log("Connect your MetaMask account!");
        }
    };

    useEffect(() => {
        checkMetaMaskConnection();
     //   getLotteryInfo();
    }, []);

    // Lottery Draw

    const pricePerTicket = 1000000000000000; // Example: Price per ticket in Wei
    const networkFees = 1000000000000;
    const serviceFees = 100000000000000;

    // Calculate total cost of tickets
    useEffect(() => {
        const calculateTotalCost = () => {
            const cost = numberOfTickets * pricePerTicket;
            setTotalCost(cost);
        };

        calculateTotalCost();
    }, [numberOfTickets]);


    const handleTicketInputChange = (e) => {
        const inputtedTickets = parseInt(e.target.value);
        if (isNaN(inputtedTickets)) {
            setNumberOfTickets(0);
        } else if (inputtedTickets <= ticketsRemaining) {
            setNumberOfTickets(inputtedTickets);
        } else {
            setNumberOfTickets(ticketsRemaining);
        }
    };

    const connectWallet = async () => {
        try {
            const {ethereum} = window;

            if (!ethereum) {
                alert("Please install MetaMask!");
                console.log("Please install MetaMask");
                return;
            }

            const accounts = await ethereum.request({
                method: 'eth_requestAccounts'
            });

            setCurrentAccount(accounts[0]);
            setShowHiddenDiv(true);
        } catch (error) {
            console.log(error);
        }
    };
    // Admin Checker logic
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(()=>{
        const checkRole = async () => {
            try {
                const { ethereum } = window;
    
                if (ethereum) {
                    const provider = new ethers.providers.Web3Provider(ethereum, "any");
                    const signer = provider.getSigner();
                    const lottery = new ethers.Contract(
                        contractAddress,
                        contractABI,
                        signer
                    );
    
                    const role = await lottery.isAdmin(currentAccount);
                    console.log("Admin? "+role);
                    setIsAdmin(role);
                }
            } catch (error) {
                console.log(error);
            }
        }
        checkRole();
        getLotteryInfo();
    })

    const endLottery = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum, "any");
                const signer = provider.getSigner();
                const lottery = new ethers.Contract(
                    contractAddress,
                    contractABI,
                    signer
                );

                const winner = await lottery.pickWinner();
                console.log(winner);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const purchase = async () => {
        try {
            const {ethereum} = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum, "any");
                const signer = provider.getSigner();
                const lottery = new ethers.Contract(
                    contractAddress,
                    contractABI,
                    signer
                );

                const entryTxn = await lottery.enter(
                    numberOfTickets,
                    {value: totalCost}
                );

                console.log(entryTxn);
            }
        } catch (error) {
            console.log(error)
        }
    }

    const getWinner = async () => {
        try {
            const {ethereum} = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum, "any");
                const signer = provider.getSigner();
                const lottery = new ethers.Contract(
                    contractAddress,
                    contractABI,
                    signer
                );

                const winner = await lottery.getWinner();

                console.log("Winner address: "+winner);
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div>
            {!showHiddenDiv && (
                <div>
                    {/* Home page content */}
                    <MousePointer/>
                    <div className="centered">
                        <h2 id="title">
                            Welcome to Our
                            <h2 id="title" className="fancy">
                                {' '}
                                <span className="gradient-text">Lottery.</span>
                            </h2>
                        </h2>
                        <button id="btn" style={{marginTop: '1em'}} onClick={connectWallet}>
                            Try Your Luck
                        </button>
                    </div>
                    <div className="grid"></div>
                    <div className="squares-container">
                        <div className="squares-container">{shapes}</div>
                    </div>
                </div>
            )}

            {showHiddenDiv && (
                <div>
                    {/* Hidden div content */}
                    <MousePointer/>
                    <div className="grid"></div>
                    <div id="hidden-div-title" className="center-top">
                        <h5 className="fancy">
                            <span className="gradient-text">Lottery Draw</span>
                        </h5>
                    </div>
                    <div className="panel">
                        <div className="panel-item">
                            <div>
                                <span className="panel-item-label">Current Prize</span>
                                <span className="panel-item-value">{currentPrize} ETH</span>
                            </div>
                            <div>
                                <span className="panel-item-label">Tickets Remaining</span>
                                <span className="panel-item-value">{ticketsRemaining}</span>
                            </div>
                        </div>
                    </div>

                    <div className="second-panel">
                        <table className="panel-table">
                            <tbody>
                            <tr>
                                <td>
                                    <span className="panel-item-label">Prize per Ticket</span>
                                </td>
                                <td>
                                    <span className="panel-item-value italic">{(pricePerTicket) / 10 ** 18} ETH</span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <span className="panel-item-label">Number of Tickets</span>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="panel-item-input"
                                        value={numberOfTickets}
                                        onChange={handleTicketInputChange}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <span className="panel-item-label">Total Cost of Tickets</span>
                                </td>
                                <td>
                                    <span className="panel-item-value italic">{totalCost / (10 ** 18)} ETH</span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <span className="panel-item-label italic">Service Fees</span>
                                </td>
                                <td>
                                    <span className="panel-item-value italic">0.0001 ETH</span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <span className="panel-item-label italic">Network Fees</span>
                                </td>
                                <td>
                                    <span className="panel-item-value italic">{networkFees / (10 ** 18)} ETH</span>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="2">
                                    <div className="purchase-button">
                                        <button className="purchase-button" onClick={purchase}>Purchase</button>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <div>
                        {isAdmin && showHiddenDiv && (
                            <div className="admin-button-container">
                                <button className="admin-button" onClick={endLottery}>
                                    End Lottery
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
