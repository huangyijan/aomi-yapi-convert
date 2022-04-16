import path from 'path'
import ask from './ask'
import {main} from '../main'

async function run() {
    const configPath = path.resolve('api.config.json')
    let config = {} as ApiConfig
    try {
        config = require(configPath)
    } catch (_) {
        config = await ask()
        if(!config.runNow) return 
    }
    main(config)
}

run()