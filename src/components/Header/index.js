import React from 'react'
import PropTypes from 'prop-types'
import c from 'classnames'
import {compConfig} from '../../config'
import {
  decorateStyle,
  debounce,
  getStyleInt,
  animateToTop
} from '../../utils'
const {classPrefix} = compConfig

const colors = [
  'silver',
  'gray',
  'yellow',
  'blue',
  'red',
  'green',
]

import style from './style.scss'

// @decorateStyle(style)
export default class RhaegoHeader extends React.Component {

  static propTypes = {
    siteName: PropTypes.string.isRequired,
    links: PropTypes.array.isRequired,
    // asyncStatus: PropTypes.string.isRequired,
    // asyncResultMessage: PropTypes.string.isRequired,
  }

  static defaultProps = {
    siteName: 'Rhaego Example Header',
    // siteName: '[ˈvæŋkwɪʃ]',
    links: [],
  }

  BANNER_HEIGHT = 192
  TITLE_HIDDEN_THRESHOLD = 30
  RIPPLE_RADIUS = 50

  state = {
    bannerHeight: this.BANNER_HEIGHT,
    bannerTitleHidden: false,
    currNavLeft: 0,
    currNavWidth: -1,
    activeNavIndex: 0,
    navBorderLeft: -1,
    navBorderRight: -1,
    rippleLeft: 0,
    rippleTop: 0
  }

  componentDidMount() {
    this.addListeners()
    this.setDefaultNavSize()
  }

  formatToMaterialSpans = string => {
    const separated = string.split(/\s+/)
    return (
      <span className={''}>
        {separated.map(item => (<span className={`${classPrefix}-single-word`}>{item}</span>))}
      </span>
    )
  }

  navListDOM
  setNavListRef = ref => {
    this.navListDOM = ref
  }

  setDefaultNavSize = () => {
    const defaultActiveDOM = this.navListDOM.children[this.state.activeNavIndex]
    const currNavLeft = getStyleInt(defaultActiveDOM, 'left')
    const currNavWidth = getStyleInt(defaultActiveDOM, 'width')
    this.setState({
      currNavLeft,
      currNavWidth,
    })
  }

  
  docScrollTop = 0

  addListeners = () => {
    // 全局 mouseup
    document.body.addEventListener('mouseup', this.onNavMouseUp)

    // 全局滚动
    window.addEventListener('scroll', () => {
      const {scrollTop} = document.documentElement
      this.setState({
        bannerHeight: (this.BANNER_HEIGHT - scrollTop) < 0
          ? 0
          : (this.BANNER_HEIGHT - scrollTop),
        bannerTitleHidden: scrollTop > this.TITLE_HIDDEN_THRESHOLD
      })
      this.docScrollTop = scrollTop
    })

    // 下划线和波纹的动画结束
    const {
      navBorderRef,
      rippleRef
    } = this
    navBorderRef.addEventListener('animationend', () => {
      navBorderRef.classList.remove('flow-to-right', 'flow-to-left')
      navBorderRef.classList.add('hidden')
    })
    rippleRef.addEventListener('animationend', () => {
      rippleRef.classList.remove('explode')
    })
  }

  rippleRef = null
  setRippleRef = ref => {
    this.rippleRef = ref
  }

  onNavMouseDown = evt => {
    const nativeEvt = evt.nativeEvent
    const rippleLeft = nativeEvt.pageX - this.RIPPLE_RADIUS
    const rippleTop = nativeEvt.pageY - this.RIPPLE_RADIUS - this.docScrollTop
    this.setState({
      rippleLeft,
      rippleTop,
    })
    this.rippleRef.classList.add('appear')
  }

  onNavMouseUp = evt => {
    this.rippleRef.classList.remove('appear')
    this.rippleRef.classList.add('explode')
  }

  navBorderRef = null
  setNavBorderRef = ref => {
    this.navBorderRef = ref
  }

  getClickNavHandler = (item, index) => (evt) => {
    const {
      currNavLeft: prevNavLeft,
      currNavWidth: prevNavWidth,
      activeNavIndex: prevActiveNavIndex
    } = this.state

    if (prevActiveNavIndex === index) {
      return
    }

    const target = evt.nativeEvent.target
    const currNavLeft = target.offsetLeft
    const currNavWidth = getStyleInt(target, 'width')

    let targetAtCurrRight = currNavLeft > prevNavLeft
    let navBorderLeft
    let navBorderRight
    if (targetAtCurrRight) {
      // 新目标在旧的右侧
      navBorderLeft = prevNavLeft
      navBorderRight = currNavLeft + currNavWidth
    } else {
      // 左侧
      navBorderLeft = currNavLeft
      navBorderRight = prevNavLeft + prevNavWidth
    }

    this.setState({
      activeNavIndex: index,
      currNavLeft,
      currNavWidth,
      navBorderLeft,
      navBorderRight
    })

    const ref = this.navBorderRef
    ref.classList.remove('hidden')
    ref.classList.add(targetAtCurrRight ? 'flow-to-right' : 'flow-to-left')

    animateToTop()
  }

  render() {
    const {
      bannerTitleHidden,
      activeNavIndex,
    } = this.state
    const navBorderStyle = {
      left: this.state.navBorderLeft,
      right: this.state.navBorderRight,
      width: this.state.navBorderRight - this.state.navBorderLeft,
    }
    const rippleStyle = {
      left: this.state.rippleLeft,
      right: this.state.rippleRight,
      // width: this.state.navBorderRight - this.state.navBorderLeft,
    }
    const bannerStyle = {
      height: this.state.bannerHeight
    }
    const themeColorName = colors[this.state.activeNavIndex % colors.length]
    return (
      <header className={`${classPrefix}-header`} style={style} data-theme={themeColorName}>
        <div className={'header-content rhaego-responsive'}>
          <nav className={'nav-bar'}>
            <a className={c('site-title', !bannerTitleHidden && 'transparent')} href="/">
              {this.formatToMaterialSpans(this.props.siteName)}
            </a>
            <ul className="nav-buttons" ref={this.setNavListRef} >
              {
                this.props.links.map((item, index) => (
                  <li
                    className={c('nav-button', index === activeNavIndex && 'active')}
                    onClick={this.getClickNavHandler(item, index)}
                    onMouseDown={this.onNavMouseDown}
                    // onMouseUp={this.onNavMouseUp}
                  >
                    {item.name}
                  </li>
                ))
              }
              <li className="nav-border" style={navBorderStyle} ref={this.setNavBorderRef} />
            </ul>
          </nav>
          <div className={c('banner')} style={bannerStyle}>
            <h1 className={c('title', bannerTitleHidden && 'transparent')}>
              {this.formatToMaterialSpans(this.props.siteName)}
            </h1>
          </div>
        </div>
        <span
          className={'ripple'}
          style={rippleStyle}
          ref={this.setRippleRef}
        />
      </header>
    )
  }
}