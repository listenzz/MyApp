import { logger, consoleTransport, fileAsyncTransport } from 'react-native-logs'
import RNFS from 'react-native-fs'
import { Platform } from 'react-native'

export function logDir() {
  return Platform.OS === 'android' ? RNFS.CachesDirectoryPath : RNFS.DocumentDirectoryPath
}

const config = {
  transport: [consoleTransport, fileAsyncTransport],
  severity: 'debug',
  transportOptions: {
    colors: {
      info: 'blueBright',
      warn: 'yellowBright',
      error: 'redBright',
    },
    FS: RNFS,
    filePath: logDir(),
    fileName: `{date-today}.log`,
  },
}

const LOG = logger.createLogger(config)

class Logger {
  private log: any

  constructor(tag?: string) {
    if (tag) {
      this.log = LOG.extend(tag)
    } else {
      this.log = LOG
    }
  }

  d(...args: any[]) {
    this.log.debug(...args)
  }

  i(...args: any[]) {
    this.log.info(...args)
  }

  w(...args: any[]) {
    this.log.warn(...args)
  }

  e(...args: any[]) {
    this.log.error(...args)
  }

  extend(tag: string) {
    return new Logger(tag)
  }
}

export default new Logger()
