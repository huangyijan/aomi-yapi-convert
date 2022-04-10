
enum Version {
  JS = 'js',
  TS = 'ts'
}

interface Answers {
  yapiURL: string
  token: string
  isLoadFullApi: boolean
  group: Array<number>
  version: Version,
  isNeedType: boolean,
  outputDir: string
}