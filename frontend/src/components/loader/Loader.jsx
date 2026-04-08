import React from 'react'
import styles from './styles/Loader.module.css'

export default function Loader({ fullScreen = true, className = "" }) {
  // If fullScreen is true, it centers the loader in the entire viewport viewport.
  // If false, it adjusts to just center comfortably inside its parent container.
  const wrapperClass = `${styles.wrapper} ${fullScreen ? styles.fullScreen : styles.parentFill} ${className}`;

  return (
    <div className={wrapperClass}>
      <div className={styles.loader}></div>
    </div>
  )
}
