import React, {Component} from 'react'
import PropTypes from 'prop-types'
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
import Preview from './Preview'
import styles from './MarkdownInput.css'

let instanceId = 1
const {set, unset} = patches
const noop = () => {}
const dmp = new DiffMatchPatch()
const isMac = navigator.userAgent.includes('Mac OS')
const upperFirst = str => `${str.slice(0, 1).toUpperCase()}${str.slice(1)}`
const DefaultTextArea = props => <textarea {...props} />
const defaultOptions = {
  editorClassName: textStyles.textarea,
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
      options: PropTypes.shape({
        editorClassName: PropTypes.string,
        minRows: PropTypes.number,
        usePreview: PropTypes.bool,
        autoGrow: PropTypes.bool
      })
    }).isRequired,
    markers: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string.isRequired,
        level: PropTypes.string.isRequired,
        item: PropTypes.shape({
          message: PropTypes.string.isRequired
        })
      })
    )
  }

  static defaultProps = {
    value: '',
    readOnly: false,
    onFocus: noop,
    onBlur: noop,
    markers: []
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

  setValidityFromMarkers(markers) {
    if (!this._input) {
      return
    }

    const validation = markers.filter(marker => marker.type === 'validation')
    const errors = validation.filter(marker => marker.level === 'error')
    const validity = errors && errors.length > 0 ? errors[0].item.message : ''
    this._input.setCustomValidity(validity)
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown, true)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown, true)
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    let record = false
    const snapshot = {}

    if (prevProps.value !== this.props.value && !this._didInput) {
      // Someone else is updating the value, record our position and
      // restore it from snapshot after update
      record = true
      this.recordEditPosition()
      snapshot.restoreEditPosition = true
    }

    if (prevState.mode === 'write' && this.state.mode !== 'write') {
      // We'll manually restore edit position when back from preview
      this.recordEditPosition()
    }

    return record ? snapshot : null
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this._didInput = false

    if (prevProps.markers !== this.props.markers) {
      this.setValidityFromMarkers(this.props.markers)
    }

    if (
      (this.state.mode === 'write' && prevState.mode !== 'write') ||
      (snapshot && snapshot.restoreEditPosition)
    ) {
      this.restoreEditPosition()
    }

    if (!prevState.showUrlDialogFor && this.state.showUrlDialogFor && this._urlInput) {
      this._urlInput.focus()
    }
  }

  // eslint-disable-next-line complexity
  handleKeyDown = evt => {
    if (!this.state.hasFocus) {
      return
    }

    const hasModifier = isMac ? evt.metaKey : evt.ctrlKey

    // Toggle preview/write mode (ctrl + shift + p)
    if (evt.key === 'p' && hasModifier && evt.shiftKey) {
      evt.preventDefault()
      this.handleToggleMode()
    }

    // Toggle bold (ctrl + b)
    if (evt.key === 'b' && hasModifier) {
      evt.preventDefault()
      this._editor.toggle('bold')
    }

    // Toggle italic (ctrl + i)
    if (evt.key === 'i' && hasModifier) {
      evt.preventDefault()
      this._editor.toggle('italic')
    }

    // Toggle link (ctrl + k)
    if (evt.key === 'k' && hasModifier) {
      evt.preventDefault()
      this.setState({showUrlDialogFor: 'link'})
    }

    // Toggle ordered list (ctrl + shift + 7)
    if (evt.key === '7' && hasModifier && evt.shiftKey) {
      evt.preventDefault()
      this._editor.toggle('orderedList')
    }

    // Toggle unordered list (ctrl + shift + 8)
    if (evt.key === '8' && hasModifier && evt.shiftKey) {
      evt.preventDefault()
      this._editor.toggle('unorderedList')
    }

    // Toggle heading (ctrl + alt + [1-5])
    if (/^Digit[1-5]$/.test(evt.code) && hasModifier && evt.altKey) {
      evt.preventDefault()
      this._editor.toggle(`header${evt.code.slice(-1)}`)
    }
  }

  getSelectedText = () => {
    if (!this._editor || !this._input) {
      return ''
    }

    const value = this._input.value
    const [fromIndex, toIndex] = this._editor.range()
    return value.slice(fromIndex, toIndex)
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
    const options = this.props.type.options || {}
    const usePreview = typeof options.usePreview === 'undefined' ? true : options.usePreview
    if (!usePreview) {
      return
    }

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

    if (!this.previewButtonRef) {
      return
    }

    const ref = this.previewButtonRef.current || this.previewButtonRef
    if (ref.focus) {
      ref.focus()
    }
  }

  handleChange = event => {
    this._didInput = true
    const value = event.currentTarget.value
    this.props.onChange(PatchEvent.from(value ? set(value) : unset()))
  }

  handleAction = (event, action) => {
    const isParameterized = action === 'link' || action === 'image'

    if (!isParameterized) {
      this._editor.toggle(action)
      return
    }

    if (this._editor.hasFormat(action)) {
      this._editor.unformat(action)
    } else {
      this.setState({showUrlDialogFor: action})
    }
  }

  handleCloseUrlDialog = callback => {
    const cb = typeof callback === 'function' ? callback : noop
    this.setState({showUrlDialogFor: null, urlValue: ''}, () => {
      this.focus()
      cb()
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
      this._editor.toggle(showUrlDialogFor, urlValue || undefined)
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

          <Controls onClick={this.handleAction} float={usePreview} />
        </div>

        <div className={textStyles.root}>
          {inWriteMode ? (
            <TextArea
              id={this.id}
              readOnly={readOnly}
              className={options.editorClassName}
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
              <Preview options={options} value={value} />
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
