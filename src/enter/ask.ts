import inquirer from 'inquirer'
import { hasProperty } from '../utils'
import { saveApiToken, saveFile, saveUserId } from './file'
import { request } from './request'

const projectRegex = /^(https?:)\/\/(.*)\/project\/(\d+)\/.*/
let menus: any[] = []

const ask = function () {
    return new Promise<ApiConfig>(resolve => {
        inquirer.prompt([
            {
                message: '请输入yapi地址(含projectId)：',
                name: 'yapiURL',
                type: 'input',
                validate(input) {
                    if (!input) return '请复制粘贴你的yapi文档到这'
                    if (!/https?/.test(input)) return '地址需要以http或https开头'
                    const isLegalUrl = projectRegex.test(input)
                    if (!isLegalUrl) return '地址栏请包含projectId,example: http://{hostname}/project/{projectId}/***'
                    return true
                },
            },
            {
                message: '请粘贴yapi token(打开网站network 接口header可看_yapi_token值)：',
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
            {
                message: '是否需要加载全部接口？',
                name: 'isLoadFullApi',
                type: 'confirm',
                default: true
            },
            {
                message: '选择需要加载的api模块: ',
                name: 'group',
                type: 'checkbox',
                when: (answers) => answers.isLoadFullApi === false,
                async choices(answers: Answers) {
                    const { yapiURL } = answers
                    global.apiConfig = answers as ApiConfig
                    const [, protocol, host, projectId] = yapiURL?.match(projectRegex) as RegExpMatchArray
                    const MenuUrl = `${protocol}//${host}/api/interface/list_menu?project_id=${projectId}`
                    try {
                        const fileString = await request(MenuUrl)
                        const MenuRes = JSON.parse(fileString)
                        if (!hasProperty(MenuRes, 'errcode')) throw 'cannot find errcode, maybe service error'
                        if (!MenuRes.errcode) {
                            menus = MenuRes.data
                            return menus.map((menu: any) => ({
                                name: menu.name,
                                value: menu._id
                            }))
                        } else {
                            throw `${MenuRes.errmsg}`
                        }

                    } catch (error) {
                        throw '无法解析文档地址，请检查token是否过期或者yapi地址不正确'
                    }
                },
            },
            {
                message: '请选择生成文件类型',
                name: 'version',
                type: 'list',
                choices: [
                    { name: 'javascript', value: 'js' },
                    { name: 'typescript', value: 'ts' },
                ]
            },
            {
                message: '是否需要智能提示？(recommend!)',
                name: 'isNeedType',
                type: 'confirm',
                default: true
            },
            {
                message: '是否需要Axios的额外参数提示?(recommend!)',
                name: 'isNeedAxiosType',
                type: 'confirm',
                default: true
            },
            {
                message: '请选择在哪个文件夹下输出生成的api文件?',
                name: 'outputDir',
                type: 'input',
                default: 'src/api'
            },
            {
                message: '是否需要生成一份配置文件?(recommend!)',
                name: 'saveConfig',
                type: 'confirm',
                default: true
            },
            {
                message: '是否需要马上生成api文件?(ps: 非全量更新可以先自定义配置api文件的具体路径)',
                name: 'runNow',
                type: 'confirm',
                default: true,
            },
        ]).then((answers: Answers) => {

            const { yapiURL, group, outputDir, isLoadFullApi, runNow } = answers
            const [, protocol, host, projectId] = yapiURL?.match(projectRegex) as RegExpMatchArray

            const projects: any = {
                projectId: projectId,
                outputDir,
                isLoadFullApi
            }
            if (group) {
                const groupDetails = group.map(catId => {
                    const { name } = menus.find(item => item._id === catId)
                    return { catId, name }
                })
                projects.group = groupDetails
            }

            const config = Object.assign({}, answers, {
                customerSnippet: ['/* eslint-disable */', '// @ts-nocheck'],
                protocol, host, projects: [projects]
            })

            if (config.saveConfig) {
                delete config.yapiURL
                delete config.saveConfig
                delete config.group
                delete config.isLoadFullApi
                delete config.outputDir
                delete config.runNow
                delete config.token
                delete config.userId
                saveFile(
                    'api.config.json',
                    JSON.stringify(config, null, 2) + '\n'
                )
            }
            resolve({ ...config, runNow })
        })
    })
}

export default ask