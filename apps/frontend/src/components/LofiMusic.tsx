import { useEffect, useRef, useState } from 'react'
import { useMusicStore } from '../stores/musicStore'

export default function LofiMusic() {
  const { isPlaying, volume, toggle } = useMusicStore()
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [iframeLoaded, setIframeLoaded] = useState(false)

  // Send command to iframe
  const sendCommand = (func: string, args: number[] = []) => {
    if (iframeRef.current?.contentWindow && iframeLoaded) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func,
            args,
            volume: 100,
          }),
          '*'
        )
      } catch (error) {
        console.error('Error controlling music:', error)
      }
    }
  }

  // Handle iframe load - start playback if isPlaying is true
  const handleIframeLoad = () => {
    setIframeLoaded(true)
    if (isPlaying) {
      // Small delay to ensure iframe is fully ready
      setTimeout(() => {
        sendCommand('playVideo')
        sendCommand('setVolume', [Math.min(Math.round(volume * 100), 100)])
      }, 100)
    }
  }

  useEffect(() => {
    // Handle audio playback with YouTube iframe API
    if (!iframeLoaded) return

    if (isPlaying) {
      // Play the video and set volume (capped at 100)
      sendCommand('playVideo')
      sendCommand('setVolume', [Math.min(Math.round(volume * 100), 100)])
    } else {
      // Pause the video
      sendCommand('pauseVideo')
    }
  }, [isPlaying, iframeLoaded, volume])

  // Set volume when it changes
  useEffect(() => {
    if (!iframeLoaded) return
    sendCommand('setVolume', [Math.min(Math.round(volume * 100), 100)])
  }, [volume, iframeLoaded])

  return (
    <div className="relative">
      {/* Hidden YouTube iframe for lofi music */}
      <iframe
        ref={iframeRef}
        width="0"
        height="0"
        src={`https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=0&loop=1&playlist=jfKfPfyJRdk&enablejsapi=1&controls=0&modestbranding=1`}
        allow="autoplay; encrypted-media"
        style={{ display: 'none' }}
        title="Lofi Music"
        onLoad={handleIframeLoad}
      />

      {/* Toggle button */}
      <button
        onClick={toggle}
        className={`p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center ${
          isPlaying
            ? 'bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2d2d44]'
        }`}
        title={isPlaying ? 'Stop Lofi Music' : 'Play Lofi Music'}
        aria-label={isPlaying ? 'Stop Lofi Music' : 'Play Lofi Music'}
      >
        {isPlaying ? '🎵' : '🔇'}
      </button>
    </div>
  )
}
