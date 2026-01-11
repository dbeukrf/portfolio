import React, { useState, useEffect } from 'react';

interface TypingTextProps {
    text: string;
    speed?: number;     // Typing speed in ms
    deleteSpeed?: number; // Deleting speed in ms
    waitTimeout?: number; // Time to wait before deleting in ms
    className?: string;
    cursor?: boolean;
}

const TypingText: React.FC<TypingTextProps> = ({
    text,
    speed = 100,
    deleteSpeed = 50,
    waitTimeout = 2000,
    className = '',
    cursor = true
}) => {
    const [index, setIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    // Reset if text changes
    useEffect(() => {
        setIndex(0);
        setIsDeleting(false);
    }, [text]);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (!isDeleting && index === text.length) {
            // Finished typing, wait before deleting
            timer = setTimeout(() => setIsDeleting(true), waitTimeout);
        } else if (isDeleting && index === 0) {
            // Finished deleting, start typing again immediately (or could add a small pause)
            setIsDeleting(false);
        } else {
            // Typing or Deleting
            const currentSpeed = isDeleting ? deleteSpeed : speed;
            timer = setTimeout(() => {
                setIndex(prev => {
                    if (!isDeleting) return prev + 1;
                    return prev - 1;
                });
            }, currentSpeed);
        }

        return () => clearTimeout(timer);
    }, [index, isDeleting, text.length, waitTimeout, speed, deleteSpeed]);

    const displayedText = text.substring(0, index);

    return (
        <span className={className}>
            {displayedText}
            {cursor && (
                <span
                    style={{
                        display: 'inline-block',
                        width: '2px',
                        height: '1em',
                        backgroundColor: 'currentColor',
                        marginLeft: '2px',
                        verticalAlign: 'text-bottom',
                        animation: 'blink 1s step-end infinite'
                    }}
                />
            )}
            <style>
                {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}
            </style>
        </span>
    );
};

export default TypingText;
