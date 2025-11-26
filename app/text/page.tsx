'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './text.module.css'

export default function TextScreen() {
  const router = useRouter()
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<{[key: number]: string | string[]}>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loginData = sessionStorage.getItem('loginData')
    if (!loginData) {
      router.push('/login')
      return
    }

    fetchQuestions()
  }, [router])

  const fetchQuestions = async () => {
    try {
      const loginData = JSON.parse(sessionStorage.getItem('loginData') || '{}')
      
      const response = await fetch(`/api/questions?type=text&studyType=${loginData.subtypes[0].id}`, {
        headers: {
          'Authorization': `Bearer ${loginData.access_token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Show first question details in alert for debugging
        if (data.length > 0) {
          const q1 = data[0]
          alert(`Q1 Debug:\nQuestion: ${q1.question}\nType: ${q1.question_type_value}\nHas Choices: ${q1.choices && q1.choices.length > 0}\nChoices Count: ${q1.choices?.length || 0}`)
        }
        
        const activeQuestions = data.filter((q: any) => q.question_status === 'active')
        setQuestions(activeQuestions)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (value: string | string[], questionId: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const renderQuestionInput = (question: any) => {
    if (question.question_type_value === 'Single Choice') {
      return (
        <div className={styles.choiceContainer}>
          {question.choices.map((choice: any) => (
            <label key={choice.choice_id} className={styles.radioLabel} htmlFor={`q${question.questionnaire_id}_c${choice.choice_id}`}>
              <input
                type="radio"
                id={`q${question.questionnaire_id}_c${choice.choice_id}`}
                name={`question_${question.questionnaire_id}`}
                value={choice.choice_id}
                checked={answers[question.questionnaire_id] === choice.choice_id.toString()}
                onChange={(e) => handleAnswerChange(e.target.value, question.questionnaire_id)}
              />
              <span>{choice.value}</span>
              {choice.secondary_language && (
                <span className={styles.secondaryText}>{choice.secondary_language}</span>
              )}
            </label>
          ))}
        </div>
      )
    }
    
    if (question.question_type_value === 'Multiple Choice') {
      const selectedValues = Array.isArray(answers[question.questionnaire_id]) 
        ? answers[question.questionnaire_id] as string[]
        : []
      
      return (
        <div className={styles.choiceContainer}>
          {question.choices.map((choice: any) => (
            <label key={choice.choice_id} className={styles.checkboxLabel} htmlFor={`q${question.questionnaire_id}_c${choice.choice_id}`}>
              <input
                type="checkbox"
                id={`q${question.questionnaire_id}_c${choice.choice_id}`}
                name={`question_${question.questionnaire_id}`}
                value={choice.choice_id}
                checked={selectedValues.includes(choice.choice_id.toString())}
                onChange={(e) => {
                  const value = e.target.value
                  const updated = e.target.checked 
                    ? [...selectedValues, value]
                    : selectedValues.filter(v => v !== value)
                  handleAnswerChange(updated, question.questionnaire_id)
                }}
              />
              <span>{choice.value}</span>
              {choice.secondary_language && (
                <span className={styles.secondaryText}>{choice.secondary_language}</span>
              )}
            </label>
          ))}
        </div>
      )
    }
    
    // Free Text
    return (
      <div>
        <p className={styles.description}>Describe your answer (max 250 characters)</p>
        <textarea
          id={`question_${question.questionnaire_id}`}
          name={`question_${question.questionnaire_id}`}
          className={styles.textArea}
          value={(answers[question.questionnaire_id] as string) || ''}
          onChange={(e) => handleAnswerChange(e.target.value, question.questionnaire_id)}
          placeholder="Type your answer here..."
          rows={4}
          maxLength={250}
        />
        <div className={styles.charCount}>
          {((answers[question.questionnaire_id] as string) || '').length}/250
        </div>
      </div>
    )
  }

  const handleSubmit = () => {
    // Validate all questions are answered
    for (const question of questions) {
      const answer = answers[question.questionnaire_id]
      if (!answer || (typeof answer === 'string' && !answer.trim()) || (Array.isArray(answer) && answer.length === 0)) {
        alert('Please answer all questions before submitting')
        return
      }
      
      if (question.question_type_value === 'Free Text' && typeof answer === 'string') {
        if (answer.trim().length === 0) {
          alert('Please enter a valid text')
          return
        }
        if (answer.length > 250) {
          alert('Text exceeds the maximum allowed length of 250 characters')
          return
        }
      }
    }
    
    submitSurvey()
  }

  const submitSurvey = async () => {
    const loginData = JSON.parse(sessionStorage.getItem('loginData') || '{}')
    const shopperId = sessionStorage.getItem('shopperId')
    
    const surveyData = {
      AddSurveyResults: Object.entries(answers).map(([questionId, answer]) => {
        if (Array.isArray(answer)) {
          // Multiple choice
          return {
            questionnaire_id: parseInt(questionId),
            choice_id: answer.map(a => parseInt(a)),
            input_value: '',
            file_link: ''
          }
        } else {
          const question = questions.find(q => q.questionnaire_id === parseInt(questionId))
          if (question?.question_type_value === 'Single Choice') {
            // Single choice
            return {
              questionnaire_id: parseInt(questionId),
              choice_id: [parseInt(answer)],
              input_value: '',
              file_link: ''
            }
          } else {
            // Free text
            return {
              questionnaire_id: parseInt(questionId),
              choice_id: [],
              input_value: answer,
              file_link: ''
            }
          }
        }
      }),
      survey_id: parseInt(loginData.survey_id),
      studytype_id: parseInt(loginData.subtypes[0].id),
      store_id: parseInt(loginData.store_id),
      created_by_id: parseInt(shopperId || '0')
    }

    console.log('📤 Submitting survey data:', JSON.stringify(surveyData, null, 2))

    try {
      const response = await fetch('/api/survey_results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.access_token}`
        },
        body: JSON.stringify(surveyData)
      })

      console.log('📤 Response status:', response.status)

      if (response.ok) {
        console.log('📤 Survey submitted successfully')
        router.push('/success')
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('📤 Submit failed:', errorData)
        alert(`Failed to submit survey: ${errorData.detail || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('📤 Submit error:', error)
      alert('Failed to submit survey. Please try again.')
    }
  }



  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.noQuestions}>
          <p>No text questions available for this survey.</p>
          <button onClick={() => router.push('/questions')} className={styles.backButton}>
            Back to Options
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.headerText}>Text Questions</h1>
      </div>

      <div className={styles.scrollContainer}>
        {questions.map((question, index) => (
          <div key={question.questionnaire_id} className={styles.questionContainer}>
            <div className={styles.questionWrapper}>
              <div className={styles.questionNumber}>Q{index + 1}.</div>
              <div className={styles.questionTextContainer}>
                <h2 className={styles.questionText}>{question.question}</h2>
                {question.secondary_question && (
                  <p className={styles.secondaryQuestion}>{question.secondary_question}</p>
                )}
              </div>
            </div>
            
            {renderQuestionInput(question)}
          </div>
        ))}
      </div>

      <div className={styles.buttonContainer}>
        <button 
          onClick={handleSubmit} 
          className={styles.submitButton}
        >
          Submit
        </button>
      </div>
    </div>
  )
}