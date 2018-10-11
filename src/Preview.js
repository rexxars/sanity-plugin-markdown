import React from 'react'
import PropTypes from 'prop-types'
import Markdown from 'react-markdown'
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

function Preview(props) {
  const {options, value} = props
  const escapeHtml = !options.skipHtml && options.escapeHtml
  return (
    <Markdown
      className={styles.root}
      {...options}
      escapeHtml={escapeHtml}
      renderers={renderers}
      source={value}
    />
  )
}

Preview.propTypes = {
  value: PropTypes.string,
  options: PropTypes.shape({
    foo: PropTypes.string
  })
}

Preview.defaultProps = {
  value: '',
  options: {skipHtml: true}
}

export default Preview
