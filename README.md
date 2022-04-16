aomi-yapi-convert(针对公司内部使用的yapi文档转js或者ts文件的自动化npm插件)

## 安装

Using npm: 

```bash
$ npm install aomi-yapi-convert

```

Using yarn: 

```bash
$yarn add aomi-yapi-convert
```

### 怎么使用

如果不想在package.json里面添加额外的script,可以在终端运行下方命令，会自动触发交互命令行，生成配置文件

```bash
$ npx aomi-yapi-convert
```

不过还是推荐在项目package.json添加script:

```
 "scripts": {
    "build:api": "aomi-yapi-convert",
  },
```

这样就可以愉快的使用自己想用的命令，而不用添加npx。直接通过 ```npm run build:api ``` 或者 ```yarn build:api``` 来更新api文件了。

以添加script为示例，我们看下实际生成的效果

![exampleTerminal](/example/yapi-terminal.png)

然后你就会发现在根目录会生成一个api.config.json的配置文件。目前暂时的配置约定是这样的

```
const targetJson = {
  protocol: '', // 这些让程序自动生成就好了，看一眼就明白
  host: '',
  token: '',
  version: '',
  axiosFrom: '',
  projects: [
    {
      projectId: 445,
      outputDir: '', // 统一的文件生成路径
      isLoadFullApi: false, // 这里配置是否全量加载api文件
      group: [
        {
          catId: 8366, // 后台的菜单id
          outputDir: '', // 可以自定义生成文件路径，不设置继承project的路径
          fileName: '' // 如果不喜欢程序生成的文件名可以自定义文件名
        }
      ]
    }
  ]
}
```

