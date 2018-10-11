import React from 'react'
import PropTypes from 'prop-types'
import GoListOrdered from 'react-icons/lib/go/list-ordered'
import GoListUnordered from 'react-icons/lib/go/list-unordered'
import GoTextSize from './icons/GoTextSize'
import GoBold from './icons/GoBold'
import GoItalic from './icons/GoItalic'
import GoQuote from 'react-icons/lib/go/quote'
import GoCode from 'react-icons/lib/go/code'
import GoLink from 'react-icons/lib/go/link'
import GoImage from 'react-icons/lib/go/file-media'
import styles from './Controls.css'
import Control from './Control'

const actions = [
  // Inline
  {id: 'header3', label: 'Add header text', groupStart: true, icon: GoTextSize},
  {id: 'bold', label: 'Add bold text', icon: GoBold},
  {id: 'italic', label: 'Add italic text', icon: GoItalic},

  // Block
  {id: 'blockquote', label: 'Insert a quote', groupStart: true, icon: GoQuote},
  {id: 'code', label: 'Insert code', icon: GoCode},
  {id: 'link', label: 'Insert a link', icon: GoLink},
  {id: 'image', label: 'Insert an image', icon: GoImage},

  // Lists
  {id: 'unorderedList', label: 'Add a bulleted list', groupStart: true, icon: GoListUnordered},
  {id: 'orderedList', label: 'Add a numbered list', icon: GoListOrdered}
]

function Controls(props) {
  const className = props.float ? styles.actionButtons : styles.staticActionButtons
  return (
    <div className={className}>
      {actions.map(action => (
        <Control key={action.id} {...action} onClick={props.onClick} />
      ))}
    </div>
  )
}

Controls.propTypes = {
  onClick: PropTypes.func.isRequired,
  float: PropTypes.bool.isRequired
}

export default Controls
