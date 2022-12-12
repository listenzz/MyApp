import RNFS from 'react-native-fs'
import Log, { logDir } from './Log'

export async function prune() {
  Log.i('开始清理日志')

  const dir = await RNFS.readDir(logDir())
  const logs = dir.filter(file => file.isFile() && file.name.endsWith('.log'))
  const logsToDelete = logs.slice(0, logs.length - 5)
  for (const file of logsToDelete) {
    Log.i('删除日志文件', file.name)
    await RNFS.unlink(file.path)
  }
}
