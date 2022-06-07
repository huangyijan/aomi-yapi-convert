import { generatorFileCode, getApiFileName, getSavePath } from '..'

/** 生成没有注释的API文件，注释有文档链接，可以直接跳转 */
export const generatorFileList = (data: Array<JsDocMenuItem>, project: ProjectConfig) => {
    const nameChunk = new Map() // 用来处理文件命名的容器
    const { group, isLoadFullApi } = project
    const hasSaveNames: string[] = [] // 处理已经命名的容器
    data.forEach((item: JsDocMenuItem) => {
        if(!item.list.length) return 
        const fileConfig = group?.find(menu => menu.catId == item.list[0].catid)
        if (!isLoadFullApi && !fileConfig) return

        const saveFileBuffer = generatorFileCode(item, project)
        if(!saveFileBuffer) return
        
        const FileName = getApiFileName(item, hasSaveNames)
        const savePath = getSavePath(FileName, project, fileConfig, nameChunk)
        console.log(savePath, saveFileBuffer)
    })
}

export { generatorFileCode, getApiFileName, getSavePath }