import React, { useEffect, useState } from 'react';

const CustomCursor = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const moveMouse = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseOver = (e) => {
            // Check if element is clickable
            const target = e.target;
            const isClickable = 
                target.tagName === 'BUTTON' || 
                target.tagName === 'A' || 
                target.closest('button') || 
                target.closest('a') ||
                window.getComputedStyle(target).cursor === 'pointer';
            
            setIsHovering(isClickable);
        };

        window.addEventListener('mousemove', moveMouse);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', moveMouse);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <>
            <div 
                className={`custom-cursor-dot ${isHovering ? 'hover' : ''}`}
                style={{ 
                    left: `${position.x}px`, 
                    top: `${position.y}px` 
                }}
            />
            <div 
                className={`custom-cursor-outline ${isHovering ? 'hover' : ''}`}
                style={{ 
                    left: `${position.x}px`, 
                    top: `${position.y}px` 
                }}
            />
            <style dangerouslySetInnerHTML={{ __html: `
                * {
                    cursor: none !important;
                }
                
                .custom-cursor-dot {
                    position: fixed;
                    width: 8px;
                    height: 8px;
                    background-color: white;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 99999;
                    transform: translate(-50%, -50%);
                    box-shadow: 0 0 12px var(--accent);
                    transition: width 0.3s, height 0.3s, background-color 0.3s;
                }

                .custom-cursor-outline {
                    position: fixed;
                    width: 40px;
                    height: 40px;
                    border: 1.5px solid white;
                    background-color: rgba(26, 86, 178, 0.05); /* Very light blue tint */
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 99998;
                    transform: translate(-50%, -50%);
                    box-shadow: 0 0 8px rgba(255, 255, 255, 0.5), inset 0 0 8px rgba(26, 86, 178, 0.1);
                    transition: width 0.4s, height 0.4s, border-color 0.3s, opacity 0.3s, transform 0.2s ease-out;
                }

                .custom-cursor-dot.hover {
                    width: 12px;
                    height: 12px;
                    background-color: var(--accent);
                    box-shadow: 0 0 15px white;
                }

                .custom-cursor-outline.hover {
                    width: 60px;
                    height: 60px;
                    border-color: var(--accent);
                    background-color: rgba(255, 255, 255, 0.1);
                    opacity: 0.9;
                }

                @media (max-width: 1024px) {
                    .custom-cursor-dot, .custom-cursor-outline {
                        display: none;
                    }
                    * {
                        cursor: auto !important;
                    }
                }
            `}} />
        </>
    );
};

export default CustomCursor;
