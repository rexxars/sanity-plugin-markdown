import React from 'react'
import PropTypes from 'prop-types'
import Markdown from 'react-markdown'
import defaultOptions from './previewOptions'

function Preview(props) {
  const {options, value} = props
  const escapeHtml = !options.skipHtml && options.escapeHtml
  return <Markdown {...options} escapeHtml={escapeHtml} source={value} />
}

Preview.propTypes = {
  value: PropTypes.string,
  options: PropTypes.shape({
    skipHtml: PropTypes.bool,
    escapeHtml: PropTypes.bool
  })
}

Preview.defaultProps = {
  value: '',
  options: {...defaultOptions}
}

Preview.defaultOptions = defaultOptions

export default Preview
