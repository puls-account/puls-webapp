'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './profile.module.css'

interface ProfileQuestion {
  profile_question_id: number
  question: string
  question_type: number
  question_type_value: string
  question_status: string
  choices: Array<{
    profile_choice_id: number
    values: string
  }>
}

export default function ProfileScreen() {
  const router = useRouter()
  const [loginData, setLoginData] = useState<any>(null)
  const [profileQuestions, setProfileQuestions] = useState<ProfileQuestion[]>([])
  const [formData, setFormData] = useState<{[key: number]: string}>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const data = sessionStorage.getItem('loginData')
    if (!data) {
      router.push('/login')
      return
    }
    
    const parsedData = JSON.parse(data)
    setLoginData(parsedData)
    
    fetchProfileQuestions(parsedData.access_token, parsedData.survey_id)
  }, [router])

  const fetchProfileQuestions = async (token: string, surveyId: string) => {
    try {
      const response = await fetch(`/api/profile-questions?survey_id=${surveyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProfileQuestions(data)
      }
    } catch (error) {
      console.error('Error fetching profile questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (value: string, questionId: number) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const capitalizeFirstLetter = (string: string) => {
    return string
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const validateForm = () => {
    const nameRegex = /^[a-zA-Z\s]+$/
    const phoneRegex = /^[0-9]{10}$/
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    for (const question of profileQuestions) {
      const inputValue = formData[question.profile_question_id]?.trim()

      if (!inputValue) {
        alert(`Please fill out ${question.question}`)
        return false
      }

      if (question.question_type_value === 'Free Text') {
        if (question.question.toLowerCase().includes('name')) {
          if (inputValue.length < 3) {
            alert('Name must be at least 3 characters long')
            return false
          }
          if (!nameRegex.test(inputValue)) {
            alert('Name can only contain letters and spaces')
            return false
          }
        }

        if (question.question.toLowerCase().includes('phone') || question.question.toLowerCase().includes('mobile')) {
          if (!phoneRegex.test(inputValue)) {
            alert('Mobile number must be exactly 10 digits')
            return false
          }
        }
      }

      if (question.question_type_value === 'email' && !emailRegex.test(inputValue)) {
        alert('Please enter a valid email address')
        return false
      }
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    const questions = profileQuestions.map(question => ({
      question_id: question.profile_question_id,
      choices: question.question_type_value === 'dropdown' && formData[question.profile_question_id] 
        ? [formData[question.profile_question_id]] 
        : [],
      input_value: formData[question.profile_question_id] || ''
    }))

    const requestData = {
      questions,
      phone_code: '+91',
      survey_id: loginData.survey_id,
      studytype_id: loginData.subtypes?.[0]?.id || null
    }

    try {
      const response = await fetch('/api/add-profile-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.access_token}`
        },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        const data = await response.json()
        sessionStorage.setItem('shopperId', data.customer_profile_id)
        router.push('/questions')
      } else {
        const error = await response.json()
        alert(error.detail || 'Failed to save profile data')
      }
    } catch (error) {
      alert('Failed to save profile data')
    }
  }

  const renderFormField = (question: ProfileQuestion) => {
    const capitalizedQuestion = capitalizeFirstLetter(question.question)

    if (question.question_type_value === 'email') {
      return (
        <div key={question.profile_question_id} className={styles.inputGroup}>
          <label className={styles.label}>
            {capitalizedQuestion} <span className={styles.asterisk}>*</span>
          </label>
          <input
            type="email"
            className={styles.input}
            value={formData[question.profile_question_id] || ''}
            onChange={(e) => handleInputChange(e.target.value, question.profile_question_id)}
          />
        </div>
      )
    }

    if (question.question_type_value === 'Free Text') {
      return (
        <div key={question.profile_question_id} className={styles.inputGroup}>
          <label className={styles.label}>
            {capitalizedQuestion} <span className={styles.asterisk}>*</span>
          </label>
          <input
            type={question.question === 'Phone_number' ? 'tel' : 'text'}
            className={styles.input}
            value={formData[question.profile_question_id] || ''}
            onChange={(e) => {
              let value = e.target.value
              if (question.question.toLowerCase().includes('phone') || question.question.toLowerCase().includes('mobile')) {
                value = value.replace(/[^0-9]/g, '').slice(0, 10)
              }
              handleInputChange(value, question.profile_question_id)
            }}
            maxLength={question.question.toLowerCase().includes('phone') || question.question.toLowerCase().includes('mobile') ? 10 : undefined}
          />
        </div>
      )
    }

    if (question.question_type_value === 'dropdown') {
      return (
        <div key={question.profile_question_id} className={styles.inputGroup}>
          <label className={styles.label}>
            {capitalizedQuestion} <span className={styles.asterisk}>*</span>
          </label>
          <select
            className={styles.select}
            value={formData[question.profile_question_id] || ''}
            onChange={(e) => handleInputChange(e.target.value, question.profile_question_id)}
          >
            <option value="">Select an option</option>
            {question.choices.map(choice => (
              <option key={choice.profile_choice_id} value={choice.profile_choice_id}>
                {choice.values}
              </option>
            ))}
          </select>
        </div>
      )
    }

    return null
  }

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

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
        </div>
      ) : (
        <div className={styles.form}>
          {profileQuestions.map(renderFormField)}
          
          <button
            className={styles.nextButton}
            onClick={handleSubmit}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}