'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './login.module.css'

export default function LoginScreen() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      alert('Username and password are required')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to login')
      }

      const loginData = {
        access_token: data.access_token,
        survey_id: data.survey_id,
        store_id: data.store_id,
        org_name: data.org_name,
        subtypes: data.subtypes,
        logo: data.logo,
        survey_type_value: data.survey_type_value
      }

      sessionStorage.setItem('loginData', JSON.stringify(loginData))
      router.push('/home')
    } catch (error: any) {
      alert(error.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.backgroundPattern}></div>
      
      <div className={styles.loginCard}>
        <div className={styles.logoSection}>
          <div className={styles.logoContainer}>
            <Image
              src="/puls_logo.png"
              alt="PULS Logo"
              width={80}
              height={80}
              className={styles.logo}
              priority
            />
          </div>
          <h1 className={styles.title}>PULS</h1>
          <p className={styles.subtitle}>Survey Platform</p>
        </div>
        
        <div className={styles.formSection}>
          <h2 className={styles.welcomeText}>Welcome</h2>
          
          
          <div className={styles.inputContainer}>
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  className={styles.input}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder=" "
                />
                <label className={styles.floatingLabel}>User ID</label>
              </div>
            </div>
            
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                />
                <label className={styles.floatingLabel}>Password</label>
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
          </div>
          
          <button
            className={styles.loginButton}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading && <div className={styles.spinner}></div>}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  )
}