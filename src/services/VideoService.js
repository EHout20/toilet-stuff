import { db, storage } from '../firebase'
import { collection, addDoc, getDocs, getDoc, setDoc, updateDoc, doc, onSnapshot, orderBy, query, increment } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

class VideoService {
  constructor() {
    this.isFirebaseEnabled = db !== null && storage !== null
    this.localVideos = this.getLocalVideos()
  }

  // Get initial local videos
  getLocalVideos() {
    return [
      {
        id: '1',
        filename: 'video1.mov',
        title: 'Splashy Content #1',
        likes: 15,
        dislikes: 2,
        uploadedAt: new Date(),
        url: '/mp4s/video1.mov',
        isLocal: true
      },
      {
        id: '2', 
        filename: 'video2.mov',
        title: 'Splashy Content #2',
        likes: 8,
        dislikes: 1,
        uploadedAt: new Date(),
        url: '/mp4s/video2.mov',
        isLocal: true
      },
      {
        id: '3',
        filename: 'video3.mov', 
        title: 'Splashy Content #3',
        likes: 23,
        dislikes: 3,
        uploadedAt: new Date(),
        url: '/mp4s/video3.mov',
        isLocal: true
      },
      {
        id: '4',
        filename: 'video4.mov', 
        title: 'Splashy Content #4',
        likes: 12,
        dislikes: 0,
        uploadedAt: new Date(),
        url: '/mp4s/video4.mov',
        isLocal: true
      }
    ]
  }

  // Upload video to Firebase Storage
  async uploadVideo(file) {
    if (!this.isFirebaseEnabled) {
      throw new Error('Firebase not configured - videos will be stored locally only')
    }

    try {
      const timestamp = Date.now()
      const filename = `videos/${timestamp}_${file.name}`
      const storageRef = ref(storage, filename)
      
      console.log('🚀 Uploading video to Firebase Storage...', filename)
      console.log('📁 File size:', (file.size / 1024 / 1024).toFixed(2), 'MB')
      
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      console.log('✅ Video uploaded successfully:', downloadURL)
      return downloadURL
    } catch (error) {
      console.error('❌ Firebase Storage Error:', error.code, error.message)
      if (error.code === 'storage/unauthorized') {
        throw new Error('Firebase Storage blocked upload - set rules to allow public access')
      }
      throw error
    }
  }

  // Add video to Firestore database
  async addVideoToDatabase(videoData) {
    if (!this.isFirebaseEnabled) {
      // Add to local storage for now
      const newVideo = {
        ...videoData,
        id: Date.now().toString(),
        isLocal: true
      }
      this.localVideos.push(newVideo)
      return newVideo.id
    }

    try {
      console.log('💾 Adding video to Firestore database...')
      const docRef = await addDoc(collection(db, 'videos'), {
        ...videoData,
        createdAt: new Date(),
        likes: 0,
        dislikes: 0
      })
      console.log('✅ Video added to database with ID:', docRef.id)
      return docRef.id
    } catch (error) {
      console.error('❌ Firestore Database Error:', error.code, error.message)
      if (error.code === 'permission-denied') {
        throw new Error('Firestore blocked write - set rules to allow public access')
      }
      throw error
    }
  }

  // Get all videos
  async getVideos() {
    if (!this.isFirebaseEnabled) {
      return this.localVideos
    }

    try {
      const videosQuery = query(collection(db, 'videos'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(videosQuery)
      const videos = []
      
      querySnapshot.forEach((doc) => {
        videos.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      // Combine with local videos
      return [...this.localVideos, ...videos]
    } catch (error) {
      console.error('Error getting videos:', error)
      return this.localVideos
    }
  }

  // Listen to real-time updates (including vote changes)
  onVideosUpdate(callback) {
    if (!this.isFirebaseEnabled) {
      // For local videos, call callback whenever local videos change
      callback(this.localVideos)
      return () => {} // Return empty unsubscribe function
    }

    try {
      // Listen to ALL documents in videos collection (not just createdAt order)
      const videosQuery = query(collection(db, 'videos'), orderBy('uploadedAt', 'desc'))
      return onSnapshot(videosQuery, (snapshot) => {
        console.log('🔄 Firestore real-time update received')
        const cloudVideos = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          cloudVideos.push({
            id: doc.id,
            ...data,
            uploadedAt: data.uploadedAt?.toDate() || new Date(),
            likes: data.likes || 0,
            dislikes: data.dislikes || 0
          })
        })
        
        console.log('📊 Cloud videos with vote counts:', cloudVideos.map(v => ({
          id: v.id,
          filename: v.filename,
          likes: v.likes,
          dislikes: v.dislikes
        })))
        
        // Combine with local videos and ensure vote counts are preserved
        const allVideos = [...this.localVideos, ...cloudVideos]
        callback(allVideos)
      }, (error) => {
        console.error('❌ Firestore listener error:', error)
        callback(this.localVideos) // Fallback to local videos
      })
    } catch (error) {
      console.error('Error setting up videos listener:', error)
      callback(this.localVideos)
      return () => {}
    }
  }

  // Update video votes - returns updated video object to prevent double counting
  async updateVotes(videoId, isLike) {
    console.log(`📊 VideoService: Updating votes for ${videoId}, isLike: ${isLike}`)
    
    // Handle local videos
    const localVideo = this.localVideos.find(v => v.id === videoId)
    if (localVideo) {
      console.log(`📍 Local video found: ${localVideo.filename}`)
      console.log(`📊 Before: likes=${localVideo.likes || 0}, dislikes=${localVideo.dislikes || 0}`)
      
      if (isLike) {
        localVideo.likes = (localVideo.likes || 0) + 1
      } else {
        localVideo.dislikes = (localVideo.dislikes || 0) + 1
      }
      
      console.log(`📊 After: likes=${localVideo.likes}, dislikes=${localVideo.dislikes}`)
      
      // Also try to sync to Firestore if enabled
      if (this.isFirebaseEnabled) {
        try {
          console.log('☁️ Syncing local video vote to Firestore...')
          const videoData = {
            ...localVideo,
            uploadedAt: localVideo.uploadedAt || new Date(),
            likes: localVideo.likes,
            dislikes: localVideo.dislikes
          }
          delete videoData.id // Remove id from data object
          
          // Add to Firestore with the same ID if it doesn't exist
          const videoRef = doc(db, 'videos', videoId)
          const existingDoc = await getDoc(videoRef)
          
          if (!existingDoc.exists()) {
            await setDoc(videoRef, videoData)
            console.log('✅ Local video synced to Firestore')
          } else {
            // Update existing Firestore document
            const updateData = isLike 
              ? { likes: increment(1) }
              : { dislikes: increment(1) }
            await updateDoc(videoRef, updateData)
            console.log('✅ Firestore vote updated')
          }
        } catch (syncError) {
          console.log('⚠️ Failed to sync to Firestore:', syncError.message)
        }
      }
      
      return { ...localVideo } // Return updated video object
    }

    // Handle pure Firebase videos
    if (!this.isFirebaseEnabled) {
      console.log('❌ Firebase not enabled and video not found locally')
      return null
    }

    try {
      console.log('☁️ Updating Firestore video votes...')
      const videoRef = doc(db, 'videos', videoId)
      const updateData = isLike 
        ? { likes: increment(1) }
        : { dislikes: increment(1) }
      
      await updateDoc(videoRef, updateData)
      console.log('✅ Firestore votes updated successfully')
      
      // The real-time listener will handle the UI update
      // But return the updated document for immediate feedback
      const updatedDoc = await getDoc(videoRef)
      if (updatedDoc.exists()) {
        const data = updatedDoc.data()
        return {
          id: updatedDoc.id,
          ...data,
          uploadedAt: data.uploadedAt?.toDate() || new Date(),
          likes: data.likes || 0,
          dislikes: data.dislikes || 0
        }
      }
      
      return null
    } catch (error) {
      console.error('❌ Error updating Firestore votes:', error)
      throw error
    }
  }

  // Complete upload process
  async uploadAndAddVideo(file, title) {
    const uploadTimeout = 30000; // 30 second timeout
    
    try {
      console.log('🎬 Starting complete upload process...');
      
      let videoUrl = ''
      
      if (this.isFirebaseEnabled) {
        // Upload to Firebase Storage with timeout
        const uploadPromise = this.uploadVideo(file);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Upload timeout - Firebase rules may need updating')), uploadTimeout)
        );
        
        videoUrl = await Promise.race([uploadPromise, timeoutPromise]);
      } else {
        // For local development, just use the filename
        videoUrl = `/mp4s/${file.name}`
        console.log('Firebase not enabled - using local path:', videoUrl)
      }

      // Add to database
      const videoData = {
        filename: file.name,
        title: title || file.name.replace(/\.(mov|mp4|m4v)$/i, ''),
        url: videoUrl,
        uploadedAt: new Date(),
        likes: 0,
        dislikes: 0
      }

      const videoId = await this.addVideoToDatabase(videoData)
      
      console.log('✅ Complete upload process finished successfully!');
      
      return {
        id: videoId,
        ...videoData
      }
    } catch (error) {
      console.error('❌ Error in complete upload process:', error)
      throw error
    }
  }

  // Get all videos (both local and cloud)
  async getAllVideos() {
    if (!this.isFirebaseEnabled) {
      return [...this.localVideos]
    }

    try {
      const q = query(collection(db, 'videos'), orderBy('uploadedAt', 'desc'))
      const querySnapshot = await getDocs(q)
      const cloudVideos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate() || new Date()
      }))
      
      // Combine local and cloud videos
      return [...this.localVideos, ...cloudVideos]
    } catch (error) {
      console.error('Error getting videos:', error)
      // Fallback to local videos if cloud fails
      return [...this.localVideos]
    }
  }
}

export default new VideoService()