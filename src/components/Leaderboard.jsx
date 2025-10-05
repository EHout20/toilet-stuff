import React, { useEffect, useState } from 'react'

export default function Leaderboard({ videos, onVideoSelect }){
  const [sortedVideos, setSortedVideos] = useState([])
  
  useEffect(() => {
    // Calculate scores and sort whenever videos change
    const videosWithScores = videos.map(video => ({
      ...video,
      score: (video.likes || 0) - (video.dislikes || 0)
    }));
    
    videosWithScores.sort((a, b) => b.score - a.score);
    setSortedVideos(videosWithScores);
  }, [videos])

  const getRankEmoji = (index) => {
    if (index === 0) return '🏆'
    if (index === 1) return '🥈' 
    if (index === 2) return '🥉'
    return `#${index + 1}`
  }

  const getScoreColor = (score) => {
    if (score > 5) return '#1f9d55'
    if (score > 0) return '#f59e0b'
    if (score === 0) return '#6b7280'
    return '#ef4444'
  }

  return (
    <div style={{color: '#fff', fontFamily: 'Inter, system-ui'}}>
      {sortedVideos.length === 0 ? (
        <div style={{
          textAlign: 'center', 
          padding: '40px 20px',
          color: '#888'
        }}>
          <h3>🎬 No Videos Yet</h3>
          <p>Videos will appear here as they get votes!</p>
        </div>
      ) : (
        <div style={{maxHeight:'calc(100vh - 80px)', overflowY:'auto'}}>
          {sortedVideos.map((video, index) => (
            <div 
              key={video.id} 
              onClick={() => onVideoSelect && onVideoSelect(video.id)}
              style={{
                display:'flex',
                alignItems:'center',
                justifyContent:'space-between',
                padding:'12px',
                marginBottom:'12px',
                background: index < 3 ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255,255,255,0.05)',
                borderRadius:'12px',
                border: index === 0 ? '2px solid #FFD700' : '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.background = index < 3 ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.background = index < 3 ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255,255,255,0.05)';
              }}
            >
              <div style={{display:'flex', alignItems:'center', gap:'12px', flex:1}}>
                <span style={{fontSize:'20px', minWidth:'32px'}}>
                  {getRankEmoji(index)}
                </span>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{
                    fontSize:'14px', 
                    fontWeight:'600',
                    color: '#fff',
                    overflow:'hidden',
                    textOverflow:'ellipsis',
                    whiteSpace:'nowrap'
                  }}>
                    {video.title || video.filename.replace(/\.(mp4|mov|m4v)$/i, '')}
                  </div>
                  <div style={{fontSize:'12px', color:'#aaa', marginTop: '4px'}}>
                    {video.likes||0} 👍  {video.dislikes||0} 👎
                  </div>
                </div>
              </div>
              
              <div style={{
                fontSize:'18px',
                fontWeight:'bold',
                color: getScoreColor(video.score),
                minWidth:'50px',
                textAlign:'right'
              }}>
                {video.score > 0 ? '+' : ''}{video.score}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
