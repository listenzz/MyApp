import 'react-native'

const mockCustomNativeModules = {
  AppInfo: {
    ENVIRONMENT: 'test',
    VERSION_NAME: '1.0.0',
    VERSION_CODE: 1,
    BUILD_TYPE: 'debug',
  },
}

jest.doMock('NativeModules', () => mockCustomNativeModules)
