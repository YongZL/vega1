# ApiSelect

### 描述

> ApiSelect 基于 ant-design Select 组件 进行二次封装，可以分页查询下拉数据以及搜索数据

### ApiSelectProps

| Properties | Description | Type | Default |
| --- | --- | --- | --- |
| pagerFieldConfig | 分页的字段配置，用于获取返回数据获取中的分页数据，默认配置在 src/config.ts 里面 | `PagerFieldConfig` | defaultPagerFieldConfig |
| pageListFieldConfig | 列表的字段配置，用于获取返回数据中的列表数据，默认配置在 src/config.ts 里面 | `PageListFieldConfig` | defaultPageListFieldConfig |
| fieldConfig | 获取列表数据中的数据 | `{ label: string; value: string; keyword?: string; }` | { label: 'label'; value: 'value'; keyword: undefined; } |
| pagination | 是否分页查询 | `boolean` | true |
| params | 携带的额外请求参数 | `Record<string, any>` | - |
| immediate | 是否创建后立即请求 | `boolean` | true |
| onValuesChange | 由于用 form 表单的情况下，onChange 可能在父级不可用，所以用 onValueChange 代替触发回调获取实时 value 和 option | `SelectProps['onChange']` | - |
| searchInterval | 搜索时间间隔，毫秒数 | `number` | 800 |
| loadingTip | 下拉选择框 loading 状态的提示信息 | `string` | Loading... |
| api | api 请求数据时对参数进行处理 | `<R = ResponseResult<ResponseListData>>(params: Record<string, any>) => Promise<R>` | - |

更多 api 请参考 [Select](https://ant.design/components/select-cn/#Select-props)
