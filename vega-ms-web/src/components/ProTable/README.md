# ProTable

### 描述

> ProTable 基于 ant-design/pro-components 的 ProTable 进行二次封装，同时添加了一些额外的功能与配置，已关闭了自带的 QueryFilter 以及 request，QueryFilter 通过封装的 SchemaForm 代替，request 功能将用 api 来代替，scroll 已做了自定义处理，如果在 Modal 或者 Drawer 上使用，需要手动设置

基本使用

```tsx | pure
import type { ProColumns } from '@/components/ProTable/typings';

import ProTable from '@/components/ProTable';
interface DataItem {
	id: number;
	col1: string;
	col2: string;
	col3: string;
	col4: string;
}

const columns: ProColumns<DataItem>[] = [
	{
		title: '列1',
		dataIndex: 'col1',
		width: 100,
	},
	{
		title: '列2',
		dataIndex: 'col2',
		width: 100,
	},
	{
		title: '列3',
		dataIndex: 'col3',
		width: 100,
	},
	{
		title: '列4',
		dataIndex: 'col4',
		width: 100,
	},
];

export default () => (
	<ProTable<DataItem>
		columns={columns}
		api={api}
	/>
);
```

### ProTable

| Properties | Description | Type | Default |
| --- | --- | --- | --- | --- | --- | --- |
| noPadding | 是否去掉内部 QueryFilter 与 ProTable 外层 CardBody 的 padding | `boolean` | true |
| striped | 是否开启斑马纹 | `boolean` | true |
| customStyle | 是否使用自定义样式 | `boolean` | true |
| searchConfig | 自定义 QueryFilter 配置 | `FormSchemaProps<U>` | - |
| dateFormat | QueryFilter 如果有 DateRange、DateTimeRange 与设置用来自动处理日期参数 | `Record<string, { startKey: string; endKey: string; formatFn?: (key: string, date: number | string) => number | string; format?: string; type?: 'number' | 'format'; }>` | - |
| api | 列表请求接口 | `<R = ResponseResult<ResponseListData>>(params: Pager & Record<string, any>, options?: Record<string, any>) => Promise<R>` | - |
| beforeSearch | api 请求数据时对参数进行处理 | `(params: Record<string, any>, sort: any, filter: any) => Promise<Record<string, any>>` | - |
| tableRef | ProTableAction，用于自定义触发 | `MutableRefObject<ProTableAction>` | - |
| columnsWidth | 表格默认列宽，如果小于 60 怎么设置为 60，如果不设置怎么默认为 80 | `string`、`number`和`WidthEnum` | - |

### ProTableAction

| Properties | Description | Type |
| --- | --- | --- |
| reload | 重新加载 | `void()` |
| getDataSource | 获取当前列表数据 | `() => Record<string, any>[]` |
| getParams | 获取当前请求参数，可用于导出功能，如果 ProTable 中有 beforeSearch 与 dateFormat，将会返回过滤后的参数 | `() => Record<string, any>` |
| setDataSource | 修改表格的数据及请求回来的列表数据 | `void()` |

### WidthEnum

> 表格默认宽度，如果不设置，则使用 columnsWidth 的值，可选值为'xxxs'、'xxs'、'xs'、's'、'm'、'l'、'xl'、'xxl'、'xxxl'

| value  | width |
| ------ | ----- |
| `xxxs` | 60    |
| `xxs`  | 80    |
| `xs`   | 100   |
| `s`    | 120   |
| `m`    | 140   |
| `l`    | 160   |
| `xl`   | 180   |
| `xxl`  | 200   |
| `xxxl` | 220   |

更多 api 请参考 [ProTable](https://procomponents.ant.design/components/table)与[QueryFilter](https://procomponents.ant.design/components/query-filter)
