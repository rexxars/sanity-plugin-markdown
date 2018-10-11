import React from 'react'
import squigglyLine from './assets/progressive-disclosure-line@2x.png'
import styles from './Preview.css'

const renderers = {
  html: ({isBlock, skipHtml, escapeHtml, children, value}) => {
    if (!isBlock) {
      return children || value
    }

    if (escapeHtml) {
      return <div className={styles.escapedHtml}>{value}</div>
    }

    if (skipHtml) {
      return (
        <div className={styles.removedHtml} style={{backgroundImage: `url(${squigglyLine}`}}>
          <div className={styles.removedHtmlInner}>Skipped HTML</div>
        </div>
      )
    }

    return children || value
  }
}

const defaultOptions = {
  className: styles.root,
  skipHtml: true,
  renderers
}

export default defaultOptions
