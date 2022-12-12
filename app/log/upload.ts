import RNFS from 'react-native-fs'
import Log, { logDir } from './Log'

// 更换成你自己的文件服务器地址
const uploadUrl = 'https://gohttpserver.yourcompany.com/logs'

export async function upload() {
  Log.i('开始上传日志')

  const logExisting = await RNFS.exists(logDir() + '/12-12-2022.log')

  Log.i('日志文件存在', logExisting)

  let file = {
    uri: 'file://' + logDir() + '/12-12-2022.log',
    type: 'text/plain',
    name: '12-12-2022.log', //require
  }

  let formData = new FormData()
  formData.append('file', file)
  formData.append('filename', '12-12-2022.log')

  // RNFS.uploadFile 在这里行不通，故而使用 fetch
  const res = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  })

  if (res.status !== 200) {
    throw new Error('日志上传失败')
  }

  Log.i('日志上传成功')
  const json = await res.json()
  Log.i(json)
}
