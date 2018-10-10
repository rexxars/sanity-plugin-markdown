import React from 'react'
import PropTypes from 'prop-types'
import styles from './Controls.css'

const iconSize = 20

class Control extends React.PureComponent {
  handleClick = evt => {
    const {onClick, id} = this.props
    onClick(evt, id)
  }

  render() {
    const {label, icon, groupStart} = this.props
    const className = groupStart ? styles.buttonGroupStart : styles.button
    const Icon = icon
    return (
      <button
        type="button"
        role="button"
        color="#586069"
        className={className}
        aria-label={label}
        title={label}
        onClick={this.handleClick}
      >
        <Icon size={iconSize} />
      </button>
    )
  }
}

Control.propTypes = {
  id: PropTypes.string.isRequired,
  groupStart: PropTypes.bool,
  icon: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
}

Control.defaultProps = {
  groupStart: false
}

export default Control
