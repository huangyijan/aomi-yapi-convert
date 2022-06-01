import { getHeader } from '../utils'


export const request = (url: string, method = 'get') => {
    return new Promise<string>((resolve, reject) => {
        const http = new XMLHttpRequest()
      
        function setHeader(headers: any) {
            for (const key in headers) {
                const value = headers[key]
                http.setRequestHeader(key, value)
            }
        }
        http.open(method, url, true)
        setHeader(getHeader())

        http.onreadystatechange = function () {
            if (http.readyState == 4 && http.status == 200) {
                resolve(http.responseText)
            } else {
                reject(http.responseText)
            }
        }

        http.send()
    })
}

export const handleApiRequestError = (error: string) => {
    if (error.includes('40011')) {
        console.log('\n\x1b[33m', 'token 已经过期， 请从yapi文档获取最新token')
    } else {
        console.log(error)
    }
}