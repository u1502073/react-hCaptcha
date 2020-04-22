/*
react HCaptcha base on React hCaptcha Component Library https://github.com/hCaptcha/react-hcaptcha
*/
import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'

// Create random ID
const randomID = () =>
  `${(
    Number(String(Math.random()).slice(2)) +
    Date.now() +
    // eslint-disable-next-line no-undef
    Math.round(performance.now())
  ).toString(36)}`

// Create script to init hCaptcha
const CaptchaScript = (cb, hl) => {
  const script = document.createElement('script')

  window.hcaptchaOnLoad = cb
  script.src =
    'https://hcaptcha.com/1/api.js?render=explicit&onload=hcaptchaOnLoad'
  script.async = true

  if (hl) {
    script.src += `&hl=${hl}`
  }

  return script
}

const Hcaptcha = ({
  dataSiteKey,
  disabled,
  languageOverride,
  onVerify,
  size,
  tabindex,
  theme,
  endpoint
}) => {
  const [isApiReady, setIsApiReady] = useState(typeof hcaptcha !== 'undefined')
  const [isRemoved, setIsRemoved] = useState(false)
  const [elementId] = useState(`hcaptcha-${randomID()}`)
  const [captchaId, setCaptchaId] = useState('')
  // init
  useEffect(() => {
    if (!dataSiteKey) return
    if (disabled && isApiReady) {
      return
    }
    if (!isApiReady) {
      // Check if hCaptcha has already been loaded, if not create script tag and wait to render captcha elementID - hCaptcha
      const script = CaptchaScript(this.handleOnLoad, languageOverride)
      document.getElementById(elementId).appendChild(script)
    } else {
      renderCaptcha(handleSubmit)
    }
    return () => {
      // const { isApiReady, isRemoved, captchaId, dataSitekey } = this.props;
      if (!dataSiteKey) return
      if (!isApiReady || isRemoved) return

      // Reset any stored variables / timers when unmounting
      // eslint-disable-next-line no-undef
      hcaptcha.reset(captchaId)
      // eslint-disable-next-line no-undef
      hcaptcha.remove(captchaId)
    }
  }, [])

  useEffect(() => {
    if (!dataSiteKey) return
    if (disabled) {
      removeCaptcha()
      return
    } else if (isRemoved) {
      renderCaptcha(handleSubmit)
    }
    removeCaptcha()
    renderCaptcha(handleSubmit)
    // eslint-disable-next-line no-use-before-define
  }, [
    handleSubmit,
    removeCaptcha,
    renderCaptcha,
    dataSiteKey,
    disabled,
    isRemoved,
    size,
    theme,
    tabindex,
    languageOverride,
    endpoint
  ])

  const resetCaptcha = () => {
    if (!isApiReady || isRemoved) return

    setIsRemoved(true)
    if (captchaId) {
      // eslint-disable-next-line no-undef
      hcaptcha.remove(captchaId)
    }
  }

  const removeCaptcha = useCallback(() => {
    if (!isApiReady || isRemoved) return

    setIsRemoved(true)
    if (captchaId) {
      // eslint-disable-next-line no-undef
      hcaptcha.remove(captchaId)
    }
  }, [captchaId, isApiReady, isRemoved])

  const handleSubmit = useCallback(
    (event) => {
      if (typeof hcaptcha === 'undefined' || isRemoved) return

      // eslint-disable-next-line no-undef
      const token = hcaptcha.getResponse(captchaId) // Get response token from hCaptcha widget - hCaptcha
      onVerify(token) // Dispatch event to verify user response
    },
    [isRemoved, captchaId, onVerify]
  )

  const handleOnLoad = () => {
    setIsApiReady(true)
    renderCaptcha()
  }

  const handleExpire = useCallback(() => {
    if (!isApiReady || isRemoved) return
    // eslint-disable-next-line no-undef
    hcaptcha.reset(captchaId) // If hCaptcha runs into error, reset captcha - hCaptcha

    // if (onExpire) onExpire();
  }, [captchaId, isApiReady, isRemoved])

  const handleError = () => (event) => {
    const { onError } = this.props
    const { isApiReady, isRemoved, captchaId } = this.state

    if (!isApiReady || isRemoved) return

    // eslint-disable-next-line no-undef
    hcaptcha.reset(captchaId) // If hCaptcha runs into error, reset captcha - hCaptcha
    if (onError) onError(event)
  }

  const excute = () => {
    if (!isApiReady || isRemoved) return

    // eslint-disable-next-line no-undef
    hcaptcha.execute(captchaId)
  }

  const renderCaptcha = useCallback(
    (handleSubmit) => {
      if (!isApiReady) return

      // Render hCaptcha widget and provide neccessary callbacks - hCaptcha
      // eslint-disable-next-line no-undef
      const captchaId = hcaptcha.render(document.getElementById(elementId), {
        // ...restProps,
        sitekey: dataSiteKey,
        'error-callback': handleError,
        'expired-callback': handleExpire,
        callback: handleSubmit
      })
      setIsRemoved(false)
      setCaptchaId(captchaId)
    },
    [isApiReady, handleExpire, dataSiteKey, elementId]
  )

  return <button id={elementId} type='submit' />
}

Hcaptcha.propTypes = {
  elementId: PropTypes.string,
  languageOverride: PropTypes.string,
  dataSiteKey: PropTypes.string,
  onVerify: PropTypes.func
}

export default Hcaptcha
