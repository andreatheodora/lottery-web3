import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import MousePointer from './MousePointer';
import anime from 'animejs';
import './css/App.css'

const App = () => {
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
                    { rotate: '0deg', scale: 1, borderRadius: '0%', opacity: '100%' },
                    { rotate: '360deg', scale: 1.25, borderRadius: '50%' },
                    { rotate: '720deg', scale: 1, borderRadius: '0%', opacity: '0%' },
                ],
                duration: 4000,
                easing: 'easeInOutQuad',
                loop: true,
                delay: delay,
            });
        });
    }, []);

    const [currentAccount, setCurrentAccount] = useState("");
    const [showHiddenDiv, setShowHiddenDiv] = useState(false);

    useEffect(() => {
        const checkMetaMaskConnection = async () => {
            const { ethereum } = window;
            if (ethereum && ethereum.selectedAddress) {
                console.log("MetaMask is connected");
                setCurrentAccount(ethereum.selectedAddress);
            } else {
                console.log("Connect your MetaMask account!");
            }
        };

        checkMetaMaskConnection();
    }, []);

    const connectWallet = async () => {
        try {
            const { ethereum } = window;

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

    return (
        <div>
            {!showHiddenDiv && (
                <div>
                    {/* Home page content */}
                    <MousePointer />
                    <div className="centered">
                        <h2 id="title">
                            Welcome to Our
                            <h2 id="title" className="fancy">
                                {' '}
                                <span className="gradient-text">Lottery.</span>
                            </h2>
                        </h2>
                        <button id="btn" style={{ marginTop: '1em' }} onClick={connectWallet}>
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
                    <MousePointer />
                    <div className="grid"></div>
                    <div id="hidden-div-title" className="center-top">
                        <h5 className="fancy">
                            <span className="gradient-text">Spin the wheel</span>
                        </h5>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
