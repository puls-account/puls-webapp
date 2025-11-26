'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import styles from './video.module.css'

export default function VideoScreen() {
  const router = useRouter()
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [videoUri, setVideoUri] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCamera, setShowCamera] = useState(false)
  const [uploadedRecordings, setUploadedRecordings] = useState<any[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [loginData, setLoginData] = useState<any>(null)

  useEffect(() => {
    const data = sessionStorage.getItem('loginData')
    if (!data) {
      router.push('/login')
      return
    }
    
    const parsedData = JSON.parse(data)
    setLoginData(parsedData)
    fetchQuestions(parsedData)
  }, [router])

  const fetchQuestions = async (loginData: any) => {
    try {
      const response = await fetch(`/api/questions?type=video&studyType=${loginData.subtypes[0].id}`, {
        headers: {
          'Authorization': `Bearer ${loginData.access_token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const activeQuestions = data.filter((q: any) => q.question_status === 'active')
        setQuestions(activeQuestions)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const startCamera = async () => {
    console.log('🎥 Starting camera...')
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported on this device')
      }

      const constraints = {
        video: { facingMode: 'user' },
        audio: true
      }

      console.log('🎥 Requesting camera permissions...')
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log('🎥 Camera stream obtained:', stream)
      
      setShowCamera(true)
      
      // Wait for video element to be created
      setTimeout(() => {
        console.log('🎥 Checking videoRef after setShowCamera:', videoRef.current)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          console.log('🎥 Camera stream set to video element')
          
          videoRef.current.onloadedmetadata = () => {
            console.log('🎥 Video metadata loaded')
            videoRef.current?.play().then(() => {
              console.log('🎥 Video playing, starting recording in 500ms...')
              setTimeout(() => {
                console.log('🎥 Calling startActualRecording...')
                startActualRecording()
              }, 500)
            }).catch(err => {
              console.error('🎥 Video play failed:', err)
            })
          }
        } else {
          console.error('🎥 videoRef.current still null after timeout')
        }
      }, 100)
    } catch (error) {
      console.error('🎥 Error accessing camera:', error)
      alert('Unable to access camera. Please check permissions and try again.')
    }
  }

  const startRecording = async () => {
    console.log('🎥 startRecording button clicked')
    setVideoUri(null)
    await startCamera()
  }

  const startActualRecording = () => {
    console.log('🎥 startActualRecording called')
    const stream = videoRef.current?.srcObject as MediaStream
    
    if (!stream) {
      console.error('🎥 No stream available')
      alert('Camera not ready. Please try again.')
      return
    }

    console.log('🎥 Stream available:', stream)

    // Check MediaRecorder support
    if (!window.MediaRecorder) {
      console.error('🎥 MediaRecorder not supported')
      alert('Video recording is not supported on this device')
      return
    }

    console.log('🎥 MediaRecorder supported')

    let options: MediaRecorderOptions = {}
    
    // Try different MIME types for better mobile compatibility
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      options.mimeType = 'video/webm;codecs=vp9'
      console.log('🎥 Using video/webm;codecs=vp9')
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
      options.mimeType = 'video/webm;codecs=vp8'
      console.log('🎥 Using video/webm;codecs=vp8')
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      options.mimeType = 'video/webm'
      console.log('🎥 Using video/webm')
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      options.mimeType = 'video/mp4'
      console.log('🎥 Using video/mp4')
    } else {
      console.log('🎥 Using default MIME type')
    }

    const mediaRecorder = new MediaRecorder(stream, options)
    const chunks: BlobPart[] = []

    console.log('🎥 MediaRecorder created:', mediaRecorder)

    mediaRecorder.ondataavailable = (event) => {
      console.log('🎥 Data available:', event.data.size)
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      console.log('🎥 Recording stopped, chunks:', chunks.length)
      const mimeType = options.mimeType || 'video/webm'
      const blob = new Blob(chunks, { type: mimeType })
      const url = URL.createObjectURL(blob)
      console.log('🎥 Video URL created:', url)
      setVideoUri(url)
      setShowCamera(false)
      
      // Stop camera stream
      stream.getTracks().forEach(track => track.stop())
    }

    mediaRecorder.onerror = (event) => {
      console.error('🎥 MediaRecorder error:', event)
      alert('Recording failed. Please try again.')
      setIsRecording(false)
    }

    mediaRecorderRef.current = mediaRecorder
    
    try {
      console.log('🎥 Starting MediaRecorder...')
      mediaRecorder.start(1000) // Record in 1-second chunks
      setIsRecording(true)
      console.log('🎥 Recording started successfully')

      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          console.log('🎥 Auto-stopping after 30 seconds')
          stopRecording()
        }
      }, 30000)
    } catch (error) {
      console.error('🎥 Failed to start recording:', error)
      alert('Failed to start recording. Please try again.')
    }
  }

  const stopRecording = () => {
    console.log('🎥 stopRecording called, state:', mediaRecorderRef.current?.state)
    if (mediaRecorderRef.current?.state === 'recording') {
      console.log('🎥 Stopping MediaRecorder...')
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    } else {
      console.log('🎥 MediaRecorder not in recording state')
    }
  }

  const uploadToS3 = async (videoBlob: Blob, questionnaireId: number) => {
    setLoading(true)
    
    try {
      const fileName = `video_${Date.now()}_${questionnaireId}.webm`
      const formData = new FormData()
      formData.append('file', videoBlob, fileName)
      formData.append('questionnaireId', questionnaireId.toString())
      
      const response = await fetch('/api/upload-video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${loginData.access_token}`
        },
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        return { questionnaireId, key: result.key, response: result }
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload video. Please try again.')
      return null
    } finally {
      setLoading(false)
    }
  }

  const handleNext = async () => {
    if (!videoUri) {
      alert('Please record a video to proceed')
      return
    }

    const videoBlob = await fetch(videoUri).then(r => r.blob())
    const uploadResult = await uploadToS3(videoBlob, questions[currentQuestion].questionnaire_id)
    
    if (uploadResult) {
      setUploadedRecordings(prev => [...prev, uploadResult])
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setVideoUri(null)
      } else {
        await submitSurvey([...uploadedRecordings, uploadResult])
      }
    }
  }

  const submitSurvey = async (recordings: any[]) => {
    const surveyData = {
      AddSurveyResults: recordings.map(rec => ({
        questionnaire_id: rec.questionnaireId,
        choice_id: [],
        input_value: '',
        file_link: rec.key
      })),
      survey_id: loginData.survey_id,
      studytype_id: loginData.subtypes[0].id,
      store_id: loginData.store_id,
      created_by_id: sessionStorage.getItem('shopperId')
    }

    try {
      const response = await fetch('/api/survey_results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.access_token}`
        },
        body: JSON.stringify(surveyData)
      })

      if (response.ok) {
        router.push('/success')
      } else {
        throw new Error('Submit failed')
      }
    } catch (error) {
      alert('Failed to submit survey. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.noQuestions}>
          <p>No video questions available.</p>
          <button onClick={() => router.push('/questions')}>Back to Options</button>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]

  return (
    <div className={styles.container}>
      {!isRecording && (
        <div className={styles.questionContainer}>
          <div className={styles.questionWrapper}>
            <div className={styles.questionNumber}>Q{currentQuestion + 1}.</div>
            <div className={styles.questionText}>
              <h2>{question.question}</h2>
              {question.secondary_question && (
                <p className={styles.secondaryQuestion}>{question.secondary_question}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={styles.videoContainer}>
        {showCamera && (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            webkit-playsinline="true"
            className={styles.video}
            style={{ transform: 'scaleX(-1)' }}
          />
        )}
        
        {videoUri && !showCamera && (
          <video
            src={videoUri}
            controls
            playsInline
            className={styles.video}
          />
        )}
      </div>

      {isRecording && (
        <div className={styles.recordingOverlay}>
          <div className={styles.recordingQuestion}>
            <div className={styles.questionNumber}>Q{currentQuestion + 1}.</div>
            <div className={styles.questionText}>
              <h3>{question.question}</h3>
              {question.secondary_question && (
                <p>{question.secondary_question}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={styles.controls}>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`${styles.recordButton} ${isRecording ? styles.recording : ''}`}
          disabled={loading}
        >
          <span className={styles.buttonIcon}>{isRecording ? '⏹️' : '🎥'}</span>
          <span className={styles.buttonText}>
            {loading ? 'Uploading...' : isRecording ? 'Click to Stop Recording' : 'Click to Start Video Recording'}
          </span>
        </button>
        {isRecording && (
          <div className={styles.recordingTimer}>
            Recording... (Max 30 seconds)
          </div>
        )}
      </div>

      {!isRecording && videoUri && (
        <div className={styles.nextContainer}>
          <button
            onClick={() => {
              setVideoUri(null)
              setShowCamera(false)
            }}
            className={styles.retakeButton}
          >
            Retake
          </button>
          <button
            onClick={handleNext}
            className={styles.nextButton}
            disabled={loading}
          >
            {currentQuestion === questions.length - 1 ? 'Submit' : 'Next'}
          </button>
        </div>
      )}
    </div>
  )
}