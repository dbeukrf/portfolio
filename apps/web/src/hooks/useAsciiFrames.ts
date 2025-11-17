import { useState, useEffect } from 'react'

interface AsciiMetadata {
  total_frames: number
  width: number
  height: number
  fps: number
  duration: number
  original_fps: number
  original_duration: number
}

export const useAsciiFrames = () => {
  const [frames, setFrames] = useState<string[]>([])
  const [metadata, setMetadata] = useState<AsciiMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadFrames = async () => {
      try {
        console.log('Loading ASCII frames...')
        // Load metadata first
        const metadataResponse = await fetch('/ascii_frames/metadata.json')
        
        // Read the response text once
        const text = await metadataResponse.text()
        
        if (!metadataResponse.ok) {
          console.error('Metadata response error:', text.substring(0, 200))
          throw new Error(`Failed to load metadata: ${metadataResponse.status} ${metadataResponse.statusText}`)
        }
        
        // Check if we got HTML instead of JSON (common when file doesn't exist or route is intercepted)
        if (text.trim().toLowerCase().startsWith('<!doctype') || text.trim().toLowerCase().startsWith('<html')) {
          console.error('Received HTML instead of JSON. Response:', text.substring(0, 500))
          throw new Error('Received HTML instead of JSON. The file /ascii_frames/metadata.json may not exist or the path is incorrect. Make sure the dev server is running and the file exists in the public folder.')
        }
        
        // Try to parse as JSON
        let metadataData: AsciiMetadata
        try {
          metadataData = JSON.parse(text)
        } catch (parseError) {
          console.error('Failed to parse JSON. Response:', text.substring(0, 500))
          throw new Error(`Failed to parse metadata as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
        }
        console.log('Metadata loaded:', metadataData)
        setMetadata(metadataData)

        // Load all frames
        const framePromises = []
        for (let i = 0; i < metadataData.total_frames; i++) {
          const frameNumber = i.toString().padStart(4, '0')
          framePromises.push(
            fetch(`/ascii_frames/frame_${frameNumber}.txt`)
              .then(response => {
                if (!response.ok) {
                  throw new Error(`Failed to load frame ${frameNumber}: ${response.status}`)
                }
                return response.text()
              })
          )
        }

        const frameTexts = await Promise.all(framePromises)
        console.log('Frames loaded:', frameTexts.length)
        
        if (frameTexts.length === 0) {
          throw new Error('No frames were loaded')
        }
        
        if (frameTexts.length !== metadataData.total_frames) {
          console.warn(`Expected ${metadataData.total_frames} frames but loaded ${frameTexts.length}`)
        }
        
        setFrames(frameTexts)
        setLoading(false)
      } catch (err) {
        console.error('Error loading ASCII frames:', err)
        setError(err instanceof Error ? err.message : 'Failed to load ASCII frames')
        setLoading(false)
      }
    }

    loadFrames()
  }, [])

  return { frames, metadata, loading, error }
}