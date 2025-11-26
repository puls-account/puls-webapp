'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './success.module.css'

export default function SuccessScreen() {
  const router = useRouter()

  const handleBackToLogin = () => {
    sessionStorage.clear()
    router.push('/login')
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <Image
            src="/tick.png"
            alt="Success"
            width={80}
            height={80}
            className={styles.successIcon}
          />
        </div>
        
        <h1 className={styles.title}>Thank You!</h1>
        
        <p className={styles.message}>
          Your survey has been completed successfully. 
          We appreciate your valuable feedback.
        </p>
        
        <button
          onClick={handleBackToLogin}
          className={styles.backButton}
        >
          Back to Login
        </button>
      </div>
    </div>
  )
}