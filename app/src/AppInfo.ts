import { NativeModules } from 'react-native'

const AppInfo = NativeModules.AppInfo

export const ENVIRONMENT: string = AppInfo.ENVIRONMENT
export const APPLICATION_ID: string = AppInfo.APPLICATION_ID

export const BUILD_TYPE_DEBUG = 'debug'
export const BUILD_TYPE_RELEASE = 'release'
export type BUILD_TYPE_DEBUG = typeof BUILD_TYPE_DEBUG
export type BUILD_TYPE_RELEASE = typeof BUILD_TYPE_RELEASE
export const BUILD_TYPE: BUILD_TYPE_DEBUG | BUILD_TYPE_RELEASE = AppInfo.BUILD_TYPE

export { VERSION_NAME, VERSION_CODE, COMMIT_SHORT_SHA, CI } from '../../app.json'
