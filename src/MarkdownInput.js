import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Markdown from 'react-markdown'
import TextareaEditor from 'textarea-editor'
import DiffMatchPatch from 'diff-match-patch'
import AutosizeTextarea from 'react-autosize-textarea'
import TextInput from 'part:@sanity/components/textinputs/default'
import FormField from 'part:@sanity/components/formfields/default'
import ConfirmDialog from 'part:@sanity/components/dialogs/confirm'
import {PatchEvent, patches} from 'part:@sanity/form-builder'
import textStyles from 'part:@sanity/components/textareas/default-style'
import ModeControls from './ModeControls'
import Controls from './Controls'
import styles from './MarkdownInput.css'

let instanceId = 1
const {set, unset} = patches
const noop = () => {}
const dmp = new DiffMatchPatch()
const isMac = navigator.userAgent.includes('Mac OS')
const upperFirst = str => `${str.slice(0, 1).toUpperCase()}${str.slice(1)}`
const DefaultTextArea = props => <textarea {...props} />
const defaultOptions = {
  minRows: 10,
  usePreview: true,
  autoGrow: true
}

const getElementHeight = el => {
  if (!el) {
    return undefined
  }

  const style = getComputedStyle(el)
  return el.clientHeight - (parseFloat(style.paddingTop) + parseFloat(style.paddingBottom))
}

// eslint-disable-next-line react/no-multi-comp
export default class MarkdownInput extends Component {
  static propTypes = {
    value: PropTypes.string,
    level: PropTypes.number.isRequired,
    readOnly: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    type: PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
      placeholder: PropTypes.string,
      rows: PropTypes.number
    }).isRequired
  }

  static defaultProps = {
    value: '',
    readOnly: false,
    onFocus: noop,
    onBlur: noop
  }

  id = `md-input-${Date.now()}-${instanceId++}`
  state = {mode: 'write', hasFocus: false}
  previewButtonRef = React.createRef()

  focus() {
    if (this._input) {
      this._input.focus()
    }
  }

  setInput = input => {
    this._input = input
    this._editor = new TextareaEditor(input)
  }

  setUrlInput = input => {
    this._urlInput = input
    if (input) {
      input.focus()
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown, true)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown, true)
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    if (prevState.mode === 'write' && this.state.mode !== 'write') {
      return {editPosition: this.recordEditPosition()}
    }

    return null
  }

  componentDidUpdate(prevProps, prevState) {
    if (this._input) {
      const {markers} = this.props
      const validation = markers.filter(marker => marker.type === 'validation')
      const errors = validation.filter(marker => marker.level === 'error')
      const validity = errors && errors.length > 0 ? errors[0].item.message : ''
      this._input.setCustomValidity(validity)
    }

    if (this.state.mode === 'write' && prevState.mode !== 'write') {
      this.restoreEditPosition()
    }

    if (!prevState.showUrlDialogFor && this.state.showUrlDialogFor && this._urlInput) {
      this._urlInput.focus()
    }
  }

  handleKeyDown = evt => {
    if (!this.state.hasFocus) {
      return
    }

    const hasModifier = isMac ? evt.metaKey : evt.ctrlKey
    if (evt.key === 'p' && hasModifier && evt.shiftKey) {
      evt.preventDefault()
      this.handleToggleMode()
    }
  }

  recordEditPosition = () => {
    if (!this._editor || !this._input) {
      return null
    }

    const threshold = 4
    const value = this._input.value
    const [fromIndex, toIndex] = this._editor.range()
    const start = Math.max(0, fromIndex - threshold)
    const end = Math.min(value.length, toIndex + threshold)
    const text = value.slice(start, end)
    const cursorDiff = fromIndex - start
    this.editPosition = {
      text,
      cursorDiff,
      searchFrom: start,
      length: toIndex - fromIndex,
      index: fromIndex
    }
    return this.editPosition
  }

  restoreEditPosition = () => {
    if (!this.editPosition) {
      return
    }

    const value = this.props.value
    const {text, cursorDiff, searchFrom, length, index} = this.editPosition

    // Search for the string at the location we found it at
    const foundIndex = dmp.match_main(value, text, searchFrom)
    const wasFound = foundIndex !== -1

    if (wasFound) {
      // We found the string near the location given, try to restore cursor
      const fromIndex = foundIndex + cursorDiff
      const toIndex = fromIndex + length
      this._editor.range([fromIndex, toIndex])
    } else {
      // Fall back to original selection regardless of content if we can't find a match
      this._editor.range([index, index + length])
    }

    this.editPosition = null
  }

  getEditorHeight = () => getElementHeight(this._editor && this._editor.el)

  handleBlurred = () => this.setState({hasFocus: false})
  handleFocused = () => this.setState({hasFocus: true})

  handleSetWriteMode = () => {
    this.setState({mode: 'write', editorHeight: this.getEditorHeight()}, () => this.focus())
  }

  handleSetPreviewMode = () => {
    this.setState({
      mode: 'preview',
      editorHeight: this.getEditorHeight()
    })
  }

  handleToggleMode = () => {
    this.handleCloseUrlDialog()
    this.setState(({mode}) => ({
      mode: mode === 'write' ? 'preview' : 'write',
      editorHeight: this.getEditorHeight()
    }))
  }

  handleInputFocused = evt => {
    this.setState({hasFocus: true})
    this.props.onFocus(evt)
  }

  handleInputBlurred = evt => {
    this.setState({hasFocus: false})
    this.props.onBlur(evt)
  }

  handleFocusRedirect = () => {
    this.handleFocused()
    if (this.previewButtonRef) {
      this.previewButtonRef.focus()
    }
  }

  handleChange = event => {
    const value = event.currentTarget.value
    this.props.onChange(PatchEvent.from(value ? set(value) : unset()))
  }

  handleAction = (event, action) => {
    if (action === 'link' || action === 'image') {
      this.setState({showUrlDialogFor: action})
    } else {
      this._editor.toggle(action)
    }
  }

  handleCloseUrlDialog = (callback = noop) => {
    this.setState({showUrlDialogFor: null, urlValue: ''}, () => {
      this.focus()
      callback()
    })
  }

  handleUrlInputChange = evt => {
    this.setState({urlValue: evt.target.value})
  }

  handleUrlInputKeyUp = evt => {
    if (evt.key === 'Enter') {
      this.handleUrlInputComplete()
    }
  }

  handleUrlInputComplete = () => {
    const {showUrlDialogFor, urlValue} = this.state
    this.handleCloseUrlDialog(() => {
      this._editor.toggle(showUrlDialogFor, urlValue)
    })
  }

  render() {
    const {mode, showUrlDialogFor, urlValue, editorHeight} = this.state
    const {value, markers, type, readOnly, level} = this.props
    const options = {...defaultOptions, ...(type.options || {})}
    const {usePreview, autoGrow, minRows} = options
    const inWriteMode = mode === 'write'
    const TextArea = autoGrow ? AutosizeTextarea : DefaultTextArea

    return (
      <FormField
        markers={markers}
        level={level}
        label={type.title}
        labelFor={this.id}
        description={type.description}
      >
        <div className={styles.tabs}>
          {usePreview && (
            <ModeControls
              previewRef={this.previewButtonRef}
              currentMode={mode}
              onSetWriteMode={this.handleSetWriteMode}
              onSetPreviewMode={this.handleSetPreviewMode}
              onBlur={this.handleBlurred}
              onFocus={this.handleFocused}
            />
          )}

          <Controls onClick={this.handleAction} />
        </div>

        <div className={textStyles.root}>
          {inWriteMode ? (
            <TextArea
              id={this.id}
              readOnly={readOnly}
              className={textStyles.textarea}
              rows={minRows}
              value={value}
              onInput={this.handleChange}
              onFocus={this.handleInputFocused}
              onBlur={this.handleInputBlurred}
              autoComplete="off"
              innerRef={this.setInput}
              placeholder={type.placeholder}
            />
          ) : (
            <div className={styles.preview} style={{minHeight: `${editorHeight}px`}}>
              <input
                className={styles.previewFocusTarget}
                id={this.id}
                onFocus={this.handleFocusRedirect}
              />
              <Markdown {...options} source={value} />
            </div>
          )}
        </div>

        {showUrlDialogFor && (
          <ConfirmDialog
            onCancel={this.handleCloseUrlDialog}
            onClose={this.handleCloseUrlDialog}
            onConfirm={this.handleUrlInputComplete}
            confirmButtonText="Add"
          >
            <TextInput
              type="url"
              value={urlValue}
              placeholder={`${upperFirst(showUrlDialogFor)} URL`}
              onChange={this.handleUrlInputChange}
              onKeyUp={this.handleUrlInputKeyUp}
              ref={this.setUrlInput}
            />
          </ConfirmDialog>
        )}
      </FormField>
    )
  }
}
