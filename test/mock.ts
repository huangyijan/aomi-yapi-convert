import main from '../src/main'
/** test config */
export const config = {
    'yapiURL': 'http://yapi.miguatech.com/project/445/interface/api',
    'version': 'ts',
    'isNeedType': true,
    'axiosFrom': 'import { fetch } from \'@/service/fetch/index\'',
    'protocol': 'http:',
    'host': 'yapi.miguatech.com',
    'isNeedAxiosType': true,
    'projects': [
        {
            'projectId': '445',
            'outputDir': 'src/api/',
            'isLoadFullApi': false,
            'prefix': '/aomi-market-admin-server',
            'group': [
                {
                    'catId': 13540,
                    'name': '预售活动'
                },
                {
                    'catId': 14303,
                    'name': '拼团活动',
                    'fileName': 'index',
                    'outputDir': 'src/api/group/'
                },
                {
                    'catId': 15157,
                    'name': '搜索词'
                }
            ]
        },
        {
            'projectId': '64',
            'outputDir': 'src/api/tackout',
            'isLoadFullApi': true
        }
    ]
}

if (typeof process !== 'undefined') {
    const { NODE_ENV } = process.env
    if (NODE_ENV === 'development') main(config as ApiConfig)
}