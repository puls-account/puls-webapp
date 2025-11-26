'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './home.module.css'

export default function HomeScreen() {
  const router = useRouter()
  const [loginData, setLoginData] = useState<any>(null)
  const [time, setTime] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [imageData, setImageData] = useState<string | null>(null)

  useEffect(() => {
    const data = sessionStorage.getItem('loginData')
    if (!data) {
      router.push('/login')
      return
    }
    
    const parsedData = JSON.parse(data)
    setLoginData(parsedData)

    // Set greeting based on time
    const currentHour = new Date().getHours()
    if (currentHour >= 5 && currentHour < 12) {
      setTime('Morning')
    } else if (currentHour >= 12 && currentHour < 18) {
      setTime('Afternoon')
    } else {
      setTime('Evening')
    }

    // Fetch organization logo if available
    if (parsedData.logo) {
      // In a real app, you'd fetch from S3 here
      setImageData(parsedData.logo)
    }
  }, [router])

  const handleProceed = () => {
    if (termsAccepted) {
      router.push('/profile')
    } else {
      alert('Please accept the terms to proceed')
    }
  }

  if (!loginData) {
    return <div>Loading...</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <div className={styles.backgroundImage}>
          <div className={styles.headerTextContainer}>
            <Image
              src="/puls_logo.png"
              alt="PULS Logo"
              width={80}
              height={80}
              className={styles.logo}
            />
            <div>
              <p className={styles.welcomeText}>Welcome to</p>
              <p className={styles.customerName}>{loginData.org_name}</p>
            </div>
          </div>
          <div className={styles.timeGreetingContainer}>
            <p className={styles.timeGreeting}>Good {time}!</p>
          </div>
        </div>
      </div>

      <div className={styles.termsContainer}>
        <label className={styles.checkboxContainer}>
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
          <span className={styles.checkmark}></span>
          <span className={styles.termsText}>
            Please accept{' '}
            <span
              onClick={() => setModalVisible(true)}
              className={styles.termsLink}
            >
              Terms and Conditions
            </span>{' '}
            to proceed
          </span>
        </label>
      </div>

      <div className={styles.typeContainer}>
        {loginData.subtypes && loginData.subtypes.length > 0 && (
          <button
            onClick={handleProceed}
            className={styles.gradientButton}
          >
            {loginData.subtypes[0].name}
          </button>
        )}
      </div>

      {modalVisible && (
        <div className={styles.modalContainer}>
          <div className={styles.modalContent}>
            <button
              onClick={() => setModalVisible(false)}
              className={styles.closeButton}
            >
              ×
            </button>
            <h2 className={styles.modalHeading}>Terms and Conditions</h2>
            <div className={styles.scrollContainer}>
              <div className={styles.termsContent}>
                <h3>Privacy Policy</h3>
                <h4>1. Overview</h4>
                <p>We respect your privacy and are committed to protecting it through our compliance with this Privacy Policy. DATALITIX TRAINING PVT LTD., Policy governs how we may collect, retain, process, share, and transfer your personal data and responses when you visit our site Datalitix.com or use our PULS App.</p>
                
                <h4>2. Information We Collect</h4>
                <p>We may collect information about you when you visit Datalitix website or use Datalitix PULS application, including personal data necessary to select right kind of studies/questions for surveys.</p>
                
                <h4>3. How We Use Your Information</h4>
                <p>Personal Data is used only for providing you with the process transactions, resolving disputes, preventing illegal activities, and improving our services.</p>
                
                <p>By agreeing to participate in this learning app, it is understood that you are aware of all the terms and conditions stated above and you volunteer to take the survey.</p>
              </div>
            </div>
            <button
              className={styles.acceptButton}
              onClick={() => {
                setTermsAccepted(true)
                setModalVisible(false)
              }}
            >
              Accept
            </button>
          </div>
        </div>
      )}
    </div>
  )
}