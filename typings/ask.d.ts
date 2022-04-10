
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
  outputDir?: string
}

interface ProjectConfig {
  projectId: number | string,
  outputDir: string,
  isLoadFullApi: boolean
  group: Array<{
    catId: number | string
    name: string
  }>
}
interface ApiConfig {
  yapiURL: string
  token: string
  version: Version
  isNeedType: boolean
  axiosFrom: string
  protocol: string
  host: string
  projects: Array<ProjectConfig>
}