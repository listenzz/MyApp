/* eslint-disable no-console */
import * as Sentry from '@sentry/react-native'

export function d(...args: any[]) {
  log(Sentry.Severity.Debug, args)
}

export function i(...args: any[]) {
  log(Sentry.Severity.Info, args)
}

export function w(...args: any[]) {
  log(Sentry.Severity.Warning, args)
}

export function e(...args: any[]) {
  log(Sentry.Severity.Error, args)
}

function log(level: Sentry.Severity, args: any[]) {
  const msg = args
    .map(arg => (arg === undefined ? 'undefined' : arg))
    .map(arg => (arg === null ? 'null' : arg))
    .map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg))
    .join(' ')

  const length = msg.length
  if (length > 4000) {
    let remaining = length
    let index = 0
    while (remaining > 0) {
      addBreadcrumb(level, msg.substring(index, Math.min(index + 4000, length)))
      remaining -= 4000
      index += 4000
    }
  } else {
    addBreadcrumb(level, msg)
  }
}

function addBreadcrumb(level: Sentry.Severity, msg: string) {
  if (level === Sentry.Severity.Info) {
    console.info(msg)
  } else if (level === Sentry.Severity.Warning) {
    console.warn(msg)
  } else if (level === Sentry.Severity.Error) {
    console.error(msg)
  } else {
    console.debug(msg)
  }
}
