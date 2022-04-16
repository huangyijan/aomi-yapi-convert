import path from 'path'
import ask from './ask'
import {Type, getDocByType} from '../main'

async function run() {
  const configPath = path.resolve('api.config.json')
  let config = {} as ApiConfig
  try {
    config = require(configPath)
  } catch (_) {
    config = await ask()
    if(!config.runNow) return 
  }
  const { token, protocol, host, isNeedType, projects } = config
  projects.forEach(item => {
    const { projectId } = item
    const baseUrl = `${protocol}//${host}`
    const jsonUrl = `${baseUrl}/api/plugin/export?type=json&pid=${projectId}&status=all&isWiki=false`
    const menuUrl = `${baseUrl}/api/interface/list_menu?project_id=${projectId}`
    if (isNeedType) {
      getDocByType(Type.Normal, token, jsonUrl, item)
    } else {
      getDocByType(Type.Simple, token, menuUrl, item)
    }
  })
}

run()