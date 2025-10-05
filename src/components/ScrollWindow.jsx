import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import VideoCard from './VideoCard';

const ScrollWindow = forwardRef(({ videos, onVote, onVideoAdd }, ref) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  // Expose navigation function to parent component
  useImperativeHandle(ref, () => ({
    goToVideo: (index) => {
      if (index >= 0 && index < videos.length) {
        setCurrentIndex(index);
      }
    }
  }));

  useEffect(() => {
    // Handle scroll for Instagram Reels-style navigation
    const handleScroll = (e) => {
      e.preventDefault();
      if (e.deltaY > 0 && currentIndex < videos.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleScroll, { passive: false });
      return () => container.removeEventListener('wheel', handleScroll);
    }
  }, [currentIndex, videos.length]);

  const handleVote = (id, isLike) => {
    // Use the parent's vote handler to update shared state
    onVote(id, isLike);
  };

  const goToNextVideo = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Loop back to first video when reaching the end
      setCurrentIndex(0);
    }
  };

  const handleFileUpload = async (event) => {
    console.log('📤 File upload triggered');
    
    const file = event.target.files[0];
    if (!file) {
      console.log('❌ No file selected');
      return;
    }
    
    console.log('📁 File selected:', file.name);
    
    // Privacy warning confirmation
    const confirmed = window.confirm(
      `⚠️ PRIVACY WARNING ⚠️\n\n` +
      `You are about to upload "${file.name}" to a PUBLIC app.\n\n` +
      `• Anyone can see this video\n` +
      `• Do NOT upload sensitive/private content\n` +
      `• Content may be stored permanently\n\n` +
      `Are you sure you want to continue?`
    );
    
    if (!confirmed) {
      event.target.value = '';
      return;
    }
    
    // Prevent multiple uploads
    if (event.target.disabled) return;
    event.target.disabled = true;
    
    try {
      console.log('🚀 Starting upload process for:', file.name);
      console.log('📁 File type:', file.type);
      console.log('📏 File size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      console.log('🔍 File details:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      });
      
      // Check file type - support video and audio
      const isVideo = file.type.startsWith('video/');
      const isAudio = file.type.startsWith('audio/');
      const hasValidExtension = /\.(mp4|mov|avi|wmv|flv|webm|mkv|m4v|3gp|3gpp|mp3|wav|m4a|aac|ogg)$/i.test(file.name);
      const isMOV = file.name.toLowerCase().endsWith('.mov');
      
      if (!isVideo && !isAudio && !hasValidExtension) {
        throw new Error('Please upload a valid media file (video or audio formats supported)');
      }
      
      // Special warning for MOV files
      if (isMOV) {
        const proceed = window.confirm(
          `⚠️ MOV FILE DETECTED ⚠️\n\n` +
          `MOV files often have issues in web browsers:\n` +
          `• May not play correctly\n` +
          `• Very slow upload times\n` +
          `• Poor compatibility\n\n` +
          `RECOMMENDATION: Convert to MP4 first!\n\n` +
          `Continue anyway? (Upload may be very slow)`
        );
        
        if (!proceed) {
          event.target.value = '';
          event.target.disabled = false;
          return;
        }
      }
      
      console.log('📱 Media type detected:', isVideo ? 'Video' : isAudio ? 'Audio' : 'Unknown (by extension)');
      console.log('📁 File size:', (file.size / 1024 / 1024).toFixed(1) + 'MB');
      
      // Show upload progress with file size warning
      const sizeWarning = file.size > 50 * 1024 * 1024 ? ' (Large file - this may take a while!)' : '';
      alert(`Uploading "${file.name}"${sizeWarning}...`);
      
      // Check file size limit
      const maxSize = 100 * 1024 * 1024; // 100MB limit
      if (file.size > maxSize) {
        throw new Error(`File too large! Maximum size is 100MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`);
      }
      
      // For now, let's try a simpler approach - just copy to local folder and add to list
      console.log('📁 Attempting simple local upload...');
      
      // Create a local file URL for immediate playback
      let localURL;
      try {
        localURL = URL.createObjectURL(file);
        console.log('✅ Created local URL:', localURL);
      } catch (urlError) {
        console.error('❌ Failed to create local URL:', urlError);
        throw new Error(`Failed to process file: ${urlError.message}`);
      }
      
      // Add to local videos immediately - this works instantly!
      const newVideo = {
        id: Date.now().toString(),
        filename: file.name,
        title: file.name.replace(/\.(mov|mp4|m4v|mp3|wav|m4a|aac|ogg)$/i, ''),
        url: localURL,
        likes: 0,
        dislikes: 0,
        uploadedAt: new Date(),
        isLocal: true
      };
      
      console.log('📝 Created video object:', newVideo);
      
      // Skip Firebase upload for MOV files (they cause issues)
      if (!isMOV) {
        try {
          console.log('☁️ Attempting cloud upload...');
          const { default: VideoService } = await import('../services/VideoService');
          
          // Set a timeout for cloud upload
          const uploadPromise = VideoService.uploadAndAddVideo(file, newVideo.title);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Upload timeout - taking too long')), 30000)
          );
          
          const cloudVideo = await Promise.race([uploadPromise, timeoutPromise]);
          console.log('✅ Cloud upload successful:', cloudVideo);
        } catch (cloudError) {
          console.log('⚠️ Cloud upload failed, using local only:', cloudError.message);
        }
      } else {
        console.log('⚠️ Skipping cloud upload for MOV file - using local only');
      }
      
      // Notify parent component about new video
      if (onVideoAdd) {
        onVideoAdd(newVideo);
      }
      
      alert(`Media "${file.name}" added successfully! 🎉`);
      event.target.value = '';
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      
      let errorMessage = `Upload failed: ${error.message}`;
      
      if (file.name.toLowerCase().endsWith('.mov')) {
        errorMessage += `\n\n🎬 MOV FILE SOLUTIONS:\n` +
          `1. Convert to MP4 using QuickTime Player\n` +
          `2. Use online converter (CloudConvert)\n` +
          `3. Try a smaller MOV file\n` +
          `4. Use different video format`;
      } else if (error.message.includes('timeout')) {
        errorMessage += `\n\nFile took too long to upload. Try:\n` +
          `• Smaller file size\n` +
          `• Better internet connection\n` +
          `• Different file format`;
      }
      
      alert(errorMessage);
      event.target.value = '';
      
    } finally {
      // Re-enable upload button
      event.target.disabled = false;
    }
  };

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        color: '#fff'
      }}>
        <h3>🔄 Loading videos...</h3>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        color: '#fff'
      }}>
        <div style={{textAlign: 'center'}}>
          <h3>🎬 No Videos Yet!</h3>
          <p>Add your MOV files to public/mp4s/ folder</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      style={{
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        background: '#000'
      }}
    >
      {/* Upload button */}
      <input 
        type="file" 
        accept="video/*,audio/*,.mp4,.mov,.avi,.wmv,.flv,.webm,.mkv,.m4v,.3gp,.3gpp,.mp3,.wav,.m4a,.aac,.ogg" 
        onChange={handleFileUpload}
        style={{display:'none'}} 
        id="video-upload"
      />
      <label 
        htmlFor="video-upload" 
        style={{
          position:'absolute', 
          top:'20px', 
          right:'20px', 
          background:'rgba(255,255,255,0.2)', 
          color:'white', 
          border:'none', 
          borderRadius:'50%', 
          width:'50px', 
          height:'50px', 
          cursor:'pointer',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          fontSize:'24px',
          zIndex:1000,
          backdropFilter: 'blur(10px)'
        }}
        title="Upload Video - PUBLIC ACCESS: Do not upload sensitive/private content!"
      >
        +
      </label>

      {/* Privacy Warning */}
      <div style={{
        position: 'absolute',
        top: '80px',
        right: '20px',
        background: 'rgba(255, 69, 0, 0.9)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        maxWidth: '200px',
        textAlign: 'center',
        zIndex: 999,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        ⚠️ <strong>PUBLIC APP</strong><br/>
        Never upload sensitive content!
      </div>

      {/* MOV File Help */}
      <div style={{
        position: 'absolute',
        top: '160px',
        right: '20px',
        background: 'rgba(0, 123, 255, 0.9)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '11px',
        maxWidth: '200px',
        textAlign: 'center',
        zIndex: 999,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        💡 <strong>MOV ISSUES?</strong><br/>
        Convert to MP4 first!<br/>
        <a 
          href="https://cloudconvert.com/mov-to-mp4" 
          target="_blank" 
          style={{color: '#87CEEB', textDecoration: 'underline'}}
        >
          Quick Converter
        </a>
      </div>

      {/* Current video */}
      {videos[currentIndex] && (
        <VideoCard 
          key={`${videos[currentIndex].id}-${currentIndex}`}
          video={videos[currentIndex]} 
          onVote={handleVote}
          onNextVideo={goToNextVideo}
          isActive={true}
        />
      )}

      {/* Navigation indicators */}
      <div style={{
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 100
      }}>
        {videos.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            style={{
              width: '4px',
              height: '30px',
              background: index === currentIndex ? '#fff' : 'rgba(255,255,255,0.4)',
              borderRadius: '2px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: index === currentIndex ? 'scale(1.2)' : 'scale(1)',
              boxShadow: index === currentIndex ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (index !== currentIndex) {
                e.target.style.background = 'rgba(255,255,255,0.7)';
                e.target.style.transform = 'scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (index !== currentIndex) {
                e.target.style.background = 'rgba(255,255,255,0.4)';
                e.target.style.transform = 'scale(1)';
              }
            }}
          />
        ))}
      </div>
    </div>
  );
});

export default ScrollWindow;
