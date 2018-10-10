import React from 'react'
import PropTypes from 'prop-types'
import Button from 'part:@sanity/components/buttons/default'
import styles from './MarkdownInput.css'

function ModeControls(props) {
  const {currentMode, previewRef, onSetPreviewMode, onSetWriteMode, onBlur, onFocus} = props
  const inWriteMode = currentMode === 'write'
  return (
    <React.Fragment>
      <Button
        className={inWriteMode ? styles.activeTab : styles.tab}
        kind="simple"
        type="button"
        ripple={false}
        color={inWriteMode ? 'primary' : undefined}
        onClick={onSetWriteMode}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        Write
      </Button>
      <Button
        ref={previewRef}
        className={inWriteMode ? styles.tab : styles.activeTab}
        kind="simple"
        type="button"
        ripple={false}
        color={inWriteMode ? undefined : 'primary'}
        onClick={onSetPreviewMode}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        Preview
      </Button>
    </React.Fragment>
  )
}

ModeControls.propTypes = {
  previewRef: PropTypes.func.isRequired,
  currentMode: PropTypes.string.isRequired,
  onSetWriteMode: PropTypes.func.isRequired,
  onSetPreviewMode: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired
}

export default ModeControls
