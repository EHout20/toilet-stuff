import React, { useState, useEffect, useRef } from 'react'

export default function VideoCard({ video, onVote, onNextVideo, isActive }){
  const [voting, setVoting] = useState(false)
  const [mediaLoaded, setMediaLoaded] = useState(false)
  const [lastVoteTime, setLastVoteTime] = useState(0) // Prevent spam clicking only
  const mediaRef = useRef(null)
  
  // Debug: Log video object details
  console.log('🎬 VideoCard received video object:', {
    id: video.id,
    filename: video.filename,
    url: video.url,
    likes: video.likes,
    dislikes: video.dislikes,
    votes: video.votes,
    file: video.file,
    type: typeof video.file,
    keys: Object.keys(video)
  })
  
  // Debug: Log current vote counts
  console.log(`📊 Current vote display: 👍 ${video.likes || 0} | 👎 ${video.dislikes || 0}`)
  
  // Use video.url if available (from cloud), otherwise fallback to local path
  const src = video.url || `/mp4s/${video.filename}`
  console.log('🔗 Final src for VideoCard:', src)
  
  // Detect if this is audio or video
  const isAudio = video.filename?.match(/\.(mp3|wav|m4a|aac|ogg)$/i) || src.includes('audio')
  const isVideo = !isAudio

  useEffect(() => {
    // Auto-play media when it becomes active
    if (isActive && mediaRef.current) {
      mediaRef.current.play().catch(console.error)
    } else if (!isActive && mediaRef.current) {
      mediaRef.current.pause()
    }
  }, [isActive])

  const vote = (isLike) => {
    const now = Date.now()
    
    // Only prevent rapid spam clicking (250ms cooldown)
    if (now - lastVoteTime < 250) {
      console.log('🚫 Vote blocked: Too fast clicking (spam protection)')
      return
    }
    
    // Prevent double-clicking during vote processing
    if (voting) {
      console.log('🚫 Vote blocked: Already processing vote')
      return
    }
    
    setVoting(true)
    setLastVoteTime(now)
    
    console.log(`${isLike ? '👍 Liked' : '👎 Disliked'} ${video.filename}`)
    
    // Update the parent component - this should only increment by 1
    onVote(video.id, isLike)
    
    // Auto-advance to next video after voting
    setTimeout(() => {
      setVoting(false)
      if (onNextVideo) {
        onNextVideo() // Move to next video
      }
    }, 800) // Shorter delay for faster progression
  }

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000'
    }}>
      {/* Media player - supports both video and audio */}
      {isVideo ? (
        <video 
          ref={mediaRef}
          src={src}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center center',
            backgroundColor: '#000'
          }} 
          autoPlay
          muted 
          loop 
          playsInline
          controls={false}
          onError={(e) => {
            console.error('❌ Video failed to load:', e.target.error)
            console.log('Failed video src:', src)
            console.log('Video filename:', video.filename)
            console.log('Video object:', video)
            console.log('Error code:', e.target.error?.code)
            console.log('Error message:', e.target.error?.message)
            console.log('Network state:', e.target.networkState)
            console.log('Ready state:', e.target.readyState)
            setMediaLoaded(false)
          }}
          onLoadStart={() => {
            console.log('🎬 Video started loading:', src)
          }}
          onCanPlay={() => {
            console.log('✅ Video can play:', src)
            setMediaLoaded(true)
          }}
          onLoadedData={() => {
            console.log('📹 Video data loaded:', src)
            setMediaLoaded(true)
          }}
          onLoadedMetadata={() => {
            console.log('📊 Video metadata loaded:', src)
          }}
          preload="metadata"
        />
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{
            fontSize: '80px',
            marginBottom: '20px',
            opacity: 0.8
          }}>🎵</div>
          <div style={{
            fontSize: '24px',
            color: 'white',
            fontWeight: 'bold',
            marginBottom: '10px',
            textAlign: 'center'
          }}>
            {video.title || video.filename?.replace(/\.[^/.]+$/, "")}
          </div>
          <audio 
            ref={mediaRef}
            src={src}
            autoPlay
            loop
            controls={false}
            onError={(e) => {
              console.error('❌ Audio failed to load:', e.target.error)
              console.log('Failed audio src:', src)
              console.log('Audio filename:', video.filename)
              console.log('Audio object:', video)
              console.log('Error code:', e.target.error?.code)
              console.log('Error message:', e.target.error?.message)
              console.log('Network state:', e.target.networkState)
              console.log('Ready state:', e.target.readyState)
              setMediaLoaded(false)
            }}
            onLoadStart={() => {
              console.log('🎵 Audio started loading:', src)
            }}
            onCanPlay={() => {
              console.log('✅ Audio can play:', src)
              setMediaLoaded(true)
            }}
            onLoadedData={() => {
              console.log('🎵 Audio data loaded:', src)
              setMediaLoaded(true)
            }}
            preload="metadata"
          />
        </div>
      )}
      
      {/* Right-side action buttons (Instagram style) */}
      <div style={{
        position: 'absolute',
        right: '20px',
        bottom: '120px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        zIndex: 10
      }}>
        {/* Like button */}
        <div style={{textAlign: 'center'}}>
          <button 
            onClick={() => vote(true)}
            disabled={voting}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              border: 'none',
              background: voting ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '24px',
              cursor: voting ? 'not-allowed' : 'pointer',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            👍
          </button>
          <div style={{
            color: 'white',
            fontSize: '12px',
            marginTop: '4px',
            fontWeight: 'bold'
          }}>
            {video.likes || 0}
          </div>
        </div>

        {/* Dislike button */}
        <div style={{textAlign: 'center'}}>
          <button 
            onClick={() => vote(false)}
            disabled={voting}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              border: 'none',
              background: voting ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '24px',
              cursor: voting ? 'not-allowed' : 'pointer',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            👎
          </button>
          <div style={{
            color: 'white',
            fontSize: '12px',
            marginTop: '4px',
            fontWeight: 'bold'
          }}>
            {video.dislikes || 0}
          </div>
        </div>
      </div>

      {/* Bottom overlay with video info */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        right: '100px',
        color: 'white',
        zIndex: 10
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '8px',
          textShadow: '0 1px 3px rgba(0,0,0,0.8)'
        }}>
          {video.filename.replace(/\.(mov|mp4)$/i, '')}
        </div>
        
        <div style={{
          fontSize: '14px',
          opacity: 0.9,
          textShadow: '0 1px 3px rgba(0,0,0,0.8)'
        }}>
          Score: {(video.likes || 0) - (video.dislikes || 0)} • Splashy's Pisser Content
        </div>
      </div>

      {/* Media loading indicator */}
      {!mediaLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          fontSize: '16px',
          textAlign: 'center',
          zIndex: 50
        }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>
            {isVideo ? '🎬' : '🎵'}
          </div>
          Loading {isVideo ? 'video' : 'audio'}...
          <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.7 }}>
            {video.filename}
          </div>
          {video.filename?.endsWith('.mov') && (
            <div style={{ fontSize: '11px', marginTop: '8px', color: '#ff6b6b' }}>
              ⚠️ MOV files may not play in all browsers.<br/>
              Try converting to MP4 for better compatibility.
            </div>
          )}
        </div>
      )}

      {/* Voting feedback overlay */}
      {voting && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          fontSize: '18px',
          fontWeight: 'bold',
          zIndex: 100
        }}>
          Vote recorded! 🎉
        </div>
      )}
    </div>
  )
}
