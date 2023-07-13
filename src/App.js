import abi from './utils/Lottery.json';
import {BigNumber, ethers} from 'ethers';
import React, {useState, useEffect} from 'react';
import AnimateSquares from "./AnimateSquares";
import './css/App.css';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

const App = () => {
    // Contract address & ABI
    const contractAddress = "0x02ed624965D67e6c0F20Fb3B4731d0D995DebB08"
    const contractABI = abi.abi

    // Wallet Check & Connect, Ticket prices functionality, Lottery info
    const [currentAccount, setCurrentAccount] = useState("");
    const [showHiddenDiv, setShowHiddenDiv] = useState(false);
    const [numberOfTickets, setNumberOfTickets] = useState(0);
    const [totalCost, setTotalCost] = useState(0);
    const [lotteryIsOver, setLotteryIsOver] = useState(false);

    useEffect(() => {
        const checkMetaMaskConnection = async () => {
            const {ethereum} = window;
            if (ethereum && ethereum.selectedAddress) {
                console.log("MetaMask is connected");
                setCurrentAccount(ethereum.selectedAddress);
                console.log("Logged in as: " + ethereum.selectedAddress);
            } else {
                console.log("Connect your MetaMask account!");
            }
        };

        const getLotteryIsOver = async () => {
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

                    const isOver = await lottery.getLotteryIsOver();

                    setLotteryIsOver(isOver);
                }
            } catch (error) {
                console.log(error)
            }
        }

        checkMetaMaskConnection();
        getLotteryIsOver();
    }, []);

    // Lottery Info
    const [currentPrize, setCurrentPrize] = useState(0)
    const [ticketsRemaining, setTicketsRemaining] = useState(0)

    useEffect(() => {
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

        getLotteryInfo();
    });

    // Lottery Draw
    const pricePerTicket = 1000000000000000; // Example: Price per ticket in Wei
    const networkFees = 1000000000000;

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
        if (isNaN(inputtedTickets) || inputtedTickets < 0) {
            setNumberOfTickets(0);
        } else if (inputtedTickets <= ticketsRemaining) {
            setNumberOfTickets(inputtedTickets);
        } else {
            setNumberOfTickets(ticketsRemaining);
        }
    };

    // Admin , Winner, and LotteryOver Checker logic
    const [isAdmin, setIsAdmin] = useState(false);
    const [isWinner, setIsWinner] = useState(false);

    useEffect(() => {
        const checkRole = async () => {
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

                    const role = await lottery.isAdmin(currentAccount);
                    console.log("Admin? " + role);
                    setIsAdmin(role);
                }
            } catch (error) {
                console.log(error);
            }
        }

        const checkIsWinner = async () => {
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

                    const result = await lottery.isWinner(currentAccount);

                    console.log("Winner?" + result);

                    setIsWinner(result);
                }
            } catch (error) {
                console.log(error)
            }
        }

        checkIsWinner();
        checkRole();
    }, [currentAccount])

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

    const endLottery = async () => {
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

                const winner = await lottery.pickWinner();
                console.log(winner);

                setLotteryIsOver(true);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const restartLottery = async () => {
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

                await lottery.restartLottery();
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

                const totalCostInString = totalCost.toString();

                const entryTxn = await lottery.enter(
                    numberOfTickets,
                    {value: BigNumber.from(totalCostInString)}
                ).then(() => {
                    setShowNotification(true);

                    // Hide the notification after 3 seconds
                    setTimeout(() => {
                        setShowNotification(false);
                    }, 3000);
                });

                console.log(entryTxn);
            }
        } catch (error) {
            console.log(error)
        }
    }

    const [showNotification, setShowNotification] = useState(false);

    return (
        <div>
            {/*Main Landing Page*/}
            {!showHiddenDiv && (
                <div>
                    {/* Home page content */}
                    <div className="centered">
                        <h2 id="title">
                            Welcome to Our
                            <h2 id="title" className="fancy">
                                <span className="gradient-text">Lottery.</span>
                            </h2>
                        </h2>
                        <button id="btn" style={{marginTop: '1em'}} onClick={connectWallet}>
                            Try Your Luck
                        </button>
                    </div>
                    <div className="grid"></div>
                    <AnimateSquares/>
                </div>
            )}

            {/*Lottery Purchase Page, Admin Button*/}
            {showHiddenDiv && !lotteryIsOver && (
                <div className="container">
                    {/* Hidden div content */}
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
                                    <span className="panel-item-label">Price per Ticket</span>
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
                                    <span className="panel-item-label">Network Fees Est.</span>
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

            {/*Lottery is over and not winner page*/}
            {showHiddenDiv && !isWinner && lotteryIsOver && (
                <div className="result-container">
                    <div className="centered">
                        <h2 id="title">Sorry.. </h2>
                        <h2 id="title" className="fancy">
                            {' '}
                            <span className="gradient-text">You didn't Win.</span>
                            <h2 id="title">
                                <span className="gradient-text">Better luck next time!</span>
                            </h2>
                        </h2>
                    </div>
                </div>
            )}

            {/*Lottery is over and is winner page*/}
            {showHiddenDiv && isWinner && lotteryIsOver && (
                <div className="result-container">
                    <div className="centered">
                        <h2 id="title">Congratulations </h2>
                        <h2 id="title" className="fancy">
                            {' '}
                            <span className="gradient-text">You are the Winner!</span>
                        </h2>
                    </div>
                </div>
            )}

            {showHiddenDiv && isAdmin && lotteryIsOver && (
                <div className="admin-button-container">
                    <button className="admin-button" onClick={restartLottery}>
                        Restart
                    </button>
                </div>
            )}

            {showNotification && (
                <div className="popup">
                    <TaskAltIcon style={{color: 'green', fontSize: '3rem'}}/>
                    <p>Purchase complete!</p>
                </div>
            )}
        </div>
    );
};

export default App;
