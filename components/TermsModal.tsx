'use client'

import { useState } from 'react'
import Image from 'next/image'
import styles from './TermsModal.module.css'

interface TermsModalProps {
  onClose: () => void
  onAccept: () => void
}

export default function TermsModal({ onClose, onAccept }: TermsModalProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          <Image
            src="/close-btn.png"
            alt="Close"
            width={24}
            height={24}
          />
        </button>
        
        <h2 className={styles.title}>Terms and Conditions</h2>
        
        <div className={styles.content}>
          <div className={styles.scrollContainer}>
            <div className={styles.termsContent}>
              <h3>Privacy Policy</h3>
              
              <h4>1. Overview</h4>
              <p>
                We respect your privacy and are committed to protecting it through our compliance with this Privacy Policy. 
                DATALITIX TRAINING PVT LTD., Policy governs how we may collect, retain, process, share, and transfer your 
                personal data and responses when you visit our site Datalitix.com or use our PULS App.
              </p>
              
              <h4>2. Highlights</h4>
              <ul>
                <li>You are not required by law to provide us with any personal data. Sharing personal data with us is entirely voluntary.</li>
                <li>Our Services are intended for users over the age of 16 or equivalent minimum age for providing consent to processing of personal data in the relevant jurisdiction.</li>
                <li>You may be entitled under applicable law to request, review, amend, erase or restrict the processing of your personal data.</li>
                <li>We do not sell, trade, or rent users' personal data to third parties.</li>
              </ul>
              
              <h4>3. Information We Collect</h4>
              <p>
                We may collect information about you when you visit Datalitix website or use Datalitix PULS application, including personal data necessary to select right kind of studies/questions for surveys.
              </p>
              
              <h4>4. How We Use Your Information</h4>
              <p>Personal Data is used only for the following limited purposes:</p>
              <ul>
                <li>Provide you with the process transactions and reward you in cases where applicable</li>
                <li>Resolve any disputes, communicate with you regarding customer service and support issues</li>
                <li>Prevent potentially prohibited or illegal activities, fraud, misappropriation, infringements</li>
                <li>Protect the security or integrity of our databases and the services</li>
              </ul>
              
              <p>
                By agreeing to participate in this learning app, it is understood that you are aware of all the terms and conditions stated above and you volunteer to take the survey.
              </p>
            </div>
          </div>
        </div>
        
        <button className={styles.acceptButton} onClick={onAccept}>
          Accept
        </button>
      </div>
    </div>
  )
}