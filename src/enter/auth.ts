import inquirer from 'inquirer'
import { saveApiToken } from '../utils/file'
import path from 'path'
import ask from './ask'
import { main } from '../main'


export async function run() {
    const configPath = path.resolve('api.config.json')
    let config = {} as ApiConfig
    try {
        config = require(configPath)
    } catch (_) {
        config = await ask()
        if (!config.runNow) return
    }
    main(config)
}

export const refreshToken = () => {
    return new Promise<any>(resolve => {
        inquirer.prompt([
            {
                message: '请粘贴yapi token(打开网站network 接口header可看)：',
                name: 'token',
                type: 'input',
                validate(input) {
                    if (!input) return '请复制粘贴你的token到这, example:eyJhbGciOiJIUzI ...... pz7uXMwOO9CVwSR8c'
                    if (input.length < 100) return 'token长度不够，请勿粘贴了其他字段'
                    saveApiToken(input)
                    return true
                },
            },
        ]).then(answer => {
            resolve(answer.token)
        })
    })
}


