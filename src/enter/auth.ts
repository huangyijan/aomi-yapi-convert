import inquirer from 'inquirer'
import { saveApiToken, saveUserId } from './file'
import path from 'path'
import ask from './ask'
import main from './main'

/** 插件入口 */
export async function run() {
    const configPath = path.resolve('api.config.json')
    let config = {} as ApiConfig
    try {
        config = require(configPath)
    } catch (_) {
        config = await ask()
        if (!config.runNow) return
    }
    
    const loading = new TerminalLoading()
    loading.start()
    await Promise.all(await main(config))
    console.log('🎉🎉🎉', '文件加载完毕！')
    loading.close()
    
}
/** 搞一个加载动画 */
class TerminalLoading {
    private terminalStr = ['\\', '|', '/', '-']
    private index = 0
    private clock: null | NodeJS.Timer = null 

    public start() { 
        this.clock = setInterval(() => {
            process.stdout.write(this.terminalStr[this.index++]+ '\r')
            this.index = this.index & 3
        }, 50)
    }

    public close() { 
        if (this.clock) clearInterval(this.clock) 
    }
}


/** 登录过期 */
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
            {
                message: '请输入yapi userId (打开网站network 接口header可看_yapi_uid值)：',
                name: 'userId',
                type: 'input',
                validate(input) {
                    if (!input) return '请输入yapi user ID, example: 446'
                    saveUserId(input)
                    return true
                },
            },
        ]).then(answer => {
            resolve(answer)
        })
    })
}


