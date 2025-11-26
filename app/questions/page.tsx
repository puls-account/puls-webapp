'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './questions.module.css'

export default function QuestionsScreen() {
  const router = useRouter()
  const [loginData, setLoginData] = useState<any>(null)

  useEffect(() => {
    const data = sessionStorage.getItem('loginData')
    if (!data) {
      router.push('/login')
      return
    }
    
    const parsedData = JSON.parse(data)
    setLoginData(parsedData)
  }, [router])

  const checkQuestions = async (type: string) => {
    try {
      const response = await fetch(`/api/questions?type=${type}&studyType=${loginData.subtypes[0].id}`, {
        headers: {
          'Authorization': `Bearer ${loginData.access_token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const activeQuestions = data.filter((q: any) => q.question_status === 'active')
        
        if (activeQuestions.length === 0) {
          alert('There are no questions for this Survey, please try again')
          return
        }
        
        // Navigate to appropriate screen based on type
        router.push(`/${type}`)
      } else {
        alert('Failed to fetch questions')
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
      alert('Failed to fetch questions')
    }
  }

  const handleVideoClick = () => checkQuestions('video')
  const handleAudioClick = () => checkQuestions('audio')
  const handleTextClick = () => checkQuestions('text')

  if (!loginData) {
    return <div>Loading...</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.headerText}>
          {loginData.survey_type_value === 'shopper' 
            ? 'Shopper Experience' 
            : 'Consumer Experience'}
        </h1>
      </div>

      <div className={styles.questionContainer}>
        <p className={styles.questionText}>
          Thank you for giving your valuable opinion to improve our Product and Service.
          <br /><br />
          Please choose <strong>ANY ONE OPTION</strong>
        </p>
      </div>

      <div className={styles.optionsContainer}>
        <div className={styles.optionWrapper}>
          <button
            onClick={handleVideoClick}
            className={`${styles.option} ${styles.videoOption}`}
          >
            <Image
              src="/video-icon.png"
              alt="Video"
              width={30}
              height={30}
              className={styles.optionIcon}
            />
            <span className={styles.optionText}>Video</span>
          </button>
        </div>

        <div className={styles.optionWrapper}>
          <button
            onClick={handleAudioClick}
            className={`${styles.option} ${styles.audioOption}`}
          >
            <Image
              src="/audio-icon.png"
              alt="Audio"
              width={30}
              height={30}
              className={styles.optionIcon}
            />
            <span className={styles.optionText}>Audio</span>
          </button>
        </div>

        <div className={styles.optionWrapper}>
          <button
            onClick={handleTextClick}
            className={`${styles.option} ${styles.textOption}`}
          >
            <Image
              src="/text-icon.png"
              alt="Text"
              width={30}
              height={30}
              className={styles.optionIcon}
            />
            <span className={styles.optionText}>Text</span>
          </button>
        </div>
      </div>
    </div>
  )
}