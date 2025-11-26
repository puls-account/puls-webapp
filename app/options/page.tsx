'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './options.module.css'

export default function OptionsScreen() {
  const router = useRouter()
  const [studyType, setStudyType] = useState<any>(null)
  const [loginData, setLoginData] = useState<any>(null)

  useEffect(() => {
    const storedStudyType = sessionStorage.getItem('selectedStudyType')
    const storedLoginData = sessionStorage.getItem('loginData')
    
    if (!storedStudyType || !storedLoginData) {
      router.push('/home')
      return
    }
    
    setStudyType(JSON.parse(storedStudyType))
    setLoginData(JSON.parse(storedLoginData))
  }, [router])

  const handleOptionSelect = async (option: string) => {
    try {
      const response = await fetch(`/api/questions?studytype_id=${loginData.subtypes[0].id}&type=${option}`, {
        headers: {
          'Authorization': `Bearer ${loginData.access_token}`,
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      const activeQuestions = data.questions?.filter((q: any) => q.question_status === 'active') || []
      
      if (activeQuestions.length === 0) {
        alert('There are no questions for this Survey, please try again')
        return
      }
      
      if (option === 'text') {
        router.push('/text-questions')
      } else if (option === 'audio') {
        router.push('/audio-recording')
      } else if (option === 'video') {
        router.push('/video-recording')
      }
    } catch (error) {
      console.error('Error validating questions:', error)
      if (option === 'text') {
        router.push('/text-questions')
      } else if (option === 'audio') {
        router.push('/audio-recording')
      } else if (option === 'video') {
        router.push('/video-recording')
      }
    }
  }

  if (!studyType || !loginData) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{loginData.org_name}</h1>
        <p className={styles.subtitle}>Survey Platform</p>
      </div>
      
      <div className={styles.content}>
        <div className={styles.surveyCard}>
          <h2 className={styles.surveyTitle}>Choose Survey Method</h2>
          <p className={styles.surveyDescription}>
            Please select your preferred method to complete the survey
          </p>
          
          <div className={styles.options}>
            <button 
              className={`${styles.optionButton} ${styles.textOption}`}
              onClick={() => handleOptionSelect('text')}
            >
              <div className={styles.optionIcon}>📝</div>
              <div className={styles.optionContent}>
                <h3>Text Survey</h3>
                <p>Answer questions by typing</p>
              </div>
            </button>
            
            <button 
              className={`${styles.optionButton} ${styles.audioOption}`}
              onClick={() => handleOptionSelect('audio')}
            >
              <div className={styles.optionIcon}>🎤</div>
              <div className={styles.optionContent}>
                <h3>Audio Survey</h3>
                <p>Record voice responses</p>
              </div>
            </button>
            
            <button 
              className={`${styles.optionButton} ${styles.videoOption}`}
              onClick={() => handleOptionSelect('video')}
            >
              <div className={styles.optionIcon}>📹</div>
              <div className={styles.optionContent}>
                <h3>Video Survey</h3>
                <p>Record video responses</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}