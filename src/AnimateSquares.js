import React, { useEffect } from "react";
import anime from 'animejs';
import './css/App.css';

const AnimateSquares = () => {
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

    const squaresCount = 36;
    const shapes = Array(squaresCount)
        .fill()
        .map((_, index) => <div key={index} className="square"></div>);

    return (
        <div className="squares-container">
            {shapes}
        </div>
    );
};

export default AnimateSquares;
