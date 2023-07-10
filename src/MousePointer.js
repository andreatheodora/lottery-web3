import React, { useState, useEffect } from 'react';
import './css/App.css'

const MousePointer = () => {
    const [position, setPosition] = useState({ x: -100, y: -100 }); // Initialize with off-screen coordinates

    useEffect(() => {
        const handleMouseMove = (event) => {
            setPosition({ x: event.clientX, y: event.clientY });
        };

        const handleMouseEnter = (event) => {
            setPosition({ x: event.clientX, y: event.clientY });
        };

        const handleMouseLeave = () => {
            setPosition({ x: -100, y: -100 }); // Move off-screen when cursor leaves the page
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseenter', handleMouseEnter);
        window.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseenter', handleMouseEnter);
            window.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <div
            className="mouse-pointer"
            style={{ left: position.x, top: position.y }}
        ></div>
    );
};

export default MousePointer;
