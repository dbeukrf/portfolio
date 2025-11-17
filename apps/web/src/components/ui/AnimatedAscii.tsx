import { useState, useEffect } from 'react'

interface AsciiAnimationProps {
  frames: string[]
  fps: number
  className?: string
  scrollMode?: boolean
}

// Function to get shading class for a character
const getShadingClass = (char: string): string => {
  // White/brightest characters - solid blocks
  if (char === '#' || char === '%') {
    return 'ascii-shade-white'
  }
  // Light characters - stars and plus signs
  if (char === '*' || char === '+') {
    return 'ascii-shade-light'
  }
  // Medium characters - equals and dashes
  if (char === '=' || char === '-') {
    return 'ascii-shade-medium'
  }
  // Dark characters - dots and colons
  if (char === '.' || char === ':') {
    return 'ascii-shade-dark'
  }
  // Black/darkest characters - spaces and newlines
  if (char === ' ' || char === '\n' || char === '\r') {
    return 'ascii-shade-black'
  }
  // Default for other characters - treat as medium
  return 'ascii-shade-medium'
}

// Function to render ASCII with shading
const renderAsciiWithShading = (asciiText: string): JSX.Element => {
  // Split by lines to preserve line structure, then render each line
  const lines = asciiText.split('\n')
  return (
    <>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex}>
          {line.split('').map((char, charIndex) => (
            <span key={charIndex} className={getShadingClass(char)}>
              {char}
            </span>
          ))}
          {lineIndex < lines.length - 1 && '\n'}
        </span>
      ))}
    </>
  )
}

const AnimatedAscii: React.FC<AsciiAnimationProps> = ({ frames, fps, className = '', scrollMode = false }) => {
  const [currentFrame, setCurrentFrame] = useState(0)

  useEffect(() => {
    console.log('AnimatedAscii: frames.length =', frames.length, 'fps =', fps)
    if (frames.length === 0) return

    // Reset to first frame when frames change
    setCurrentFrame(0)

    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        const next = (prev + 1) % frames.length
        return next
      })
    }, 1000 / fps)

    return () => clearInterval(interval)
  }, [frames, fps])

  if (frames.length === 0) {
    console.log('AnimatedAscii: No frames available')
    return null
  }

  if (!frames[currentFrame]) {
    console.log('AnimatedAscii: Current frame is undefined', currentFrame)
    return null
  }

  return (
    <pre className={className || 'header-ascii'}>
      {renderAsciiWithShading(frames[currentFrame])}
    </pre>
  )
}

export default AnimatedAscii