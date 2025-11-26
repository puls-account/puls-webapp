'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './audio.module.css'

export default function AudioScreen() {
  const router = useRouter()
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [audioUri, setAudioUri] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadedRecordings, setUploadedRecordings] = useState<any[]>([])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [loginData, setLoginData] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)

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
      const response = await fetch(`/api/questions?type=audio&studyType=${loginData.subtypes[0].id}`, {
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        const url = URL.createObjectURL(blob)
        setAudioUri(url)
        
        // Stop microphone stream
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)

      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording()
        }
      }, 30000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Unable to access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const uploadToS3 = async (audioBlob: Blob, questionnaireId: number) => {
    setLoading(true)
    
    try {
      const fileName = `audio_${Date.now()}_${questionnaireId}.wav`
      const formData = new FormData()
      formData.append('file', audioBlob, fileName)
      formData.append('questionnaireId', questionnaireId.toString())
      
      const response = await fetch('/api/upload-audio', {
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
      alert('Failed to upload audio. Please try again.')
      return null
    } finally {
      setLoading(false)
    }
  }

  const handleNext = async () => {
    if (!audioUri || isUploading) return
    
    setIsUploading(true)
    try {
      const audioBlob = await fetch(audioUri).then(r => r.blob())
      const uploadResult = await uploadToS3(audioBlob, questions[currentQuestion].questionnaire_id)
      
      if (uploadResult) {
        setUploadedRecordings(prev => [...prev, uploadResult])
        
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(prev => prev + 1)
          setAudioUri(null)
        } else {
          await submitSurvey([...uploadedRecordings, uploadResult])
        }
      }
    } finally {
      setIsUploading(false)
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
          <p>No audio questions available.</p>
          <button onClick={() => router.push('/questions')}>Back to Options</button>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]

  return (
    <div className={styles.container}>
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

      <div className={styles.audioContainer}>
        <Image
          src="/audio-img.png"
          alt="Audio Recording"
          width={250}
          height={250}
          className={styles.audioImage}
          priority
        />
        
        {audioUri && (
          <audio
            src={audioUri}
            controls
            className={styles.audioPlayer}
          />
        )}
      </div>

      <div className={styles.controls}>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`${styles.recordButton} ${isRecording ? styles.recording : ''}`}
          disabled={loading}
        >
          <span className={styles.buttonIcon}>{isRecording ? '⏹️' : '🎤'}</span>
          <span className={styles.buttonText}>
            {loading ? 'Uploading audio...' : isRecording ? 'Click to Stop Recording' : 'Click to Start Audio Recording'}
          </span>
        </button>
        {isRecording && (
          <div className={styles.recordingTimer}>
            Recording... (Max 30 seconds)
          </div>
        )}
      </div>

      {audioUri && (
        <div className={styles.nextContainer}>
          <button
            onClick={() => {
              setAudioUri(null)
              setIsRecording(false)
            }}
            className={styles.retakeButton}
          >
            Retake
          </button>
          <button
            onClick={handleNext}
            className={styles.nextButton}
            disabled={loading || isUploading}
          >
            {isUploading ? 'Processing...' : currentQuestion === questions.length - 1 ? 'Submit' : 'Next'}
          </button>
        </div>
      )}
    </div>
  )
}