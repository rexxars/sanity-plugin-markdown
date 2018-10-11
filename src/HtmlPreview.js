import React from 'react'
import PropTypes from 'prop-types'
import Markdown from 'react-markdown/with-html'
import defaultOptions from './previewOptions'

function HtmlPreview(props) {
  const {options, value} = props
  return <Markdown {...options} escapeHtml={false} skipHtml={false} source={value} />
}

HtmlPreview.propTypes = {
  value: PropTypes.string,
  options: PropTypes.shape({
    className: PropTypes.shape
  })
}

HtmlPreview.defaultProps = {
  value: '',
  options: {...defaultOptions}
}

HtmlPreview.defaultOptions = defaultOptions

export default HtmlPreview
