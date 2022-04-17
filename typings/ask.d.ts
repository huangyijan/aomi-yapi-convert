
enum Version {
  JS = 'js',
  TS = 'ts'
}

interface Answers {
  yapiURL: string
  token: string
  isLoadFullApi?: boolean
  group?: Array<number>
  version: Version,
  isNeedType: boolean,
  saveConfig?: boolean,
  outputDir?: string,
  runNow?: boolean
}

interface CatConfig {
  catId: number | string
  fileName: string
  outputDir: string
  name: string
}

interface ProjectConfig {
  projectId: number | string,
  outputDir: string,
  isLoadFullApi: boolean
  prefix?: string
  group?: Array<CatConfig>
}
interface ApiConfig {
  yapiURL: string
  token: string
  version: Version
  isNeedType: boolean
  axiosFrom: string
  protocol: string
  host: string
  runNow?: boolean
  projects: Array<ProjectConfig>
}
