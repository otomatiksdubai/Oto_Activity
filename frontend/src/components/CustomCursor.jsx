import React, { useEffect, useState, useRef } from 'react';

const CustomCursor = () => {
    const dotRef = useRef(null);
    const outlineRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const moveMouse = (e) => {
            if (!isVisible) setIsVisible(true);

            // Use direct DOM manipulation to prevent laggy React state updates
            if (dotRef.current) {
                dotRef.current.style.left = `${e.clientX}px`;
                dotRef.current.style.top = `${e.clientY}px`;
            }
            if (outlineRef.current) {
                outlineRef.current.style.left = `${e.clientX}px`;
                outlineRef.current.style.top = `${e.clientY}px`;
            }
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
                ref={dotRef}
                className={`custom-cursor-dot ${isHovering ? 'hover' : ''}`}
            />
            <div
                ref={outlineRef}
                className={`custom-cursor-outline ${isHovering ? 'hover' : ''}`}
            />
            <style dangerouslySetInnerHTML={{
                __html: `
                * {
                    cursor: none !important;
                }
                
                .custom-cursor-dot {
                    position: fixed;
                    width: 8px;
                    height: 8px;
                    background-color: var(--accent);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 99999;
                    transform: translate(-50%, -50%);
                    box-shadow: 0 0 10px white;
                    transition: width 0.3s, height 0.3s, background-color 0.3s;
                }

                .custom-cursor-outline {
                    position: fixed;
                    width: 40px;
                    height: 40px;
                    border: 1.5px solid var(--accent);
                    background-color: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 99998;
                    transform: translate(-50%, -50%);
                    box-shadow: 0 0 8px rgba(26, 86, 178, 0.2), inset 0 0 8px rgba(255, 255, 255, 0.2);
                    transition: width 0.4s, height 0.4s, border-color 0.3s, opacity 0.3s, transform 0.2s ease-out;
                }

                .custom-cursor-dot.hover {
                    width: 12px;
                    height: 12px;
                    background-color: white;
                    box-shadow: 0 0 15px var(--accent);
                }

                .custom-cursor-outline.hover {
                    width: 60px;
                    height: 60px;
                    border-color: white;
                    background-color: rgba(26, 86, 178, 0.2);
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
