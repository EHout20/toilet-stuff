import React, { useState, useEffect, useRef } from 'react'
import ScrollWindow from './components/ScrollWindow'
import Leaderboard from './components/Leaderboard'
import VideoService from './services/VideoService'

export default function App(){
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const scrollWindowRef = useRef(null)

  useEffect(() => {
    // Load videos from VideoService (handles both local and cloud)
    const loadVideos = async () => {
      try {
        const initialVideos = await VideoService.getVideos()
        setVideos(initialVideos)
        setLoading(false)
        
        // Set up real-time listener for new videos
        const unsubscribe = VideoService.onVideosUpdate((updatedVideos) => {
          setVideos(updatedVideos)
        })
        
        return unsubscribe
      } catch (error) {
        console.error('Error loading videos:', error)
        setLoading(false)
      }
    }

    const unsubscribe = loadVideos()
    
    // Cleanup listener on component unmount
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [])

  const handleVote = async (id, isLike) => {
    try {
      console.log(`🗳️ Processing vote: ${isLike ? 'LIKE' : 'DISLIKE'} for video ${id}`)
      
      // Update votes through VideoService ONLY (no double counting)
      const updatedVideo = await VideoService.updateVotes(id, isLike)
      
      // For immediate UI feedback, update local state
      if (updatedVideo) {
        setVideos(prev => prev.map(video => 
          video.id === id ? { ...video, ...updatedVideo } : video
        ))
      }
      
      console.log(`✅ Vote processed successfully: ${isLike ? 'LIKE' : 'DISLIKE'}`)
      console.log('📊 Updated video:', updatedVideo)
    } catch (error) {
      console.error('❌ Error updating votes:', error)
    }
  }

  const handleVideoSelect = (videoId) => {
    // Find the video index and navigate to it
    const videoIndex = videos.findIndex(video => video.id === videoId)
    if (videoIndex !== -1 && scrollWindowRef.current) {
      scrollWindowRef.current.goToVideo(videoIndex)
    }
  }

  const handleVideoAdd = (newVideo) => {
    // Add new video to the list
    setVideos(prev => [...prev, newVideo])
    console.log('✅ New video added to list:', newVideo.filename)
  }

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'Inter, system-ui'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🌭</div>
          <h2>Loading Splashy's Videos...</h2>
          <p style={{ opacity: 0.7 }}>Connecting to cloud database</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      height: '100vh',
      width: '100vw', 
      overflow: 'hidden',
      background: '#000',
      display: 'flex'
    }}>
      {/* Main Instagram Reels-style feed */}
      <div style={{
        flex: 1,
        height: '100vh',
        position: 'relative'
      }}>
        <ScrollWindow ref={scrollWindowRef} videos={videos} onVote={handleVote} onVideoAdd={handleVideoAdd} />
      </div>
      
      {/* Side leaderboard */}
      <div style={{
        width: '300px',
        height: '100vh',
        background: '#1a1a1a',
        padding: '20px',
        overflowY: 'auto',
        borderLeft: '1px solid #333'
      }}>
        {/* Mascot Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
          padding: '20px',
          borderRadius: '15px',
          background: 'linear-gradient(135deg, #ff6b35, #f7931e, #ffab00)',
          boxShadow: '0 10px 30px rgba(255, 107, 53, 0.4)'
        }}>
          {/* Splashy the Sweaty Sausage mascot image */}
          <div style={{
            width: '100px',
            height: '100px',
            margin: '0 auto 15px',
            borderRadius: '50%',
            border: '4px solid #fff',
            boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(45deg, #ff6b35, #f7931e)'
          }}>
            <img 
              src="/splashy-mascot.png" 
              alt="Splashy the Sweaty Sausage"
              style={{
                width: '110%',
                height: '110%',
                objectFit: 'contain',
                transform: 'scale(1.1)'
              }}
              onError={(e) => {
                // Fallback to styled emoji if PNG doesn't exist
                e.target.style.display = 'none';
                const fallback = e.target.parentNode.querySelector('.emoji-fallback');
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div 
              className="emoji-fallback"
              style={{
                display: 'none',
                fontSize: '32px',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(45deg, #ff9a9e, #fecfef)',
                borderRadius: '50%'
              }}
            >
              🌭
            </div>
          </div>
          <h3 style={{
            color: '#fff',
            fontFamily: 'Inter, system-ui',
            fontSize: '16px',
            fontWeight: '900',
            margin: '0',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Splashy the Sweaty Sausage
          </h3>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '12px',
            margin: '5px 0 0',
            fontWeight: '500'
          }}>
            The Lucid Origin Mascot
          </p>
        </div>

        <h2 style={{
          color: '#fff', 
          fontFamily:'Inter, system-ui', 
          marginBottom:'20px',
          fontSize: '18px'
        }}>
          🏆 Leaderboard
        </h2>
        <Leaderboard videos={videos} onVideoSelect={handleVideoSelect} />
      </div>
    </div>
  )
}
