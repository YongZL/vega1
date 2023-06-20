# SchemaForm

### 描述

> SchemaForm 基于 ant-design/pro-components ProForm 里的 BetaSchemaForm 进行二次封装，添加了部分自定义 valueType

基本使用

```tsx | pure
import SchemaForm from '@/components/SchemaForm';
import type { ProFormColumns } from '@/components/SchemaForm/typings';

const columns: ProFormColumns = [
	{
		title: '名称',
		dataIndex: 'name',
	},
];

export default () => <SchemaForm columns={columns} />;
```

rules 配置

```tsx | pure
import SchemaForm from '@/components/SchemaForm';
import type { ProFormColumns } from '@/components/SchemaForm/typings';

const rules = {
	name: [
		{
			required: true,
			message: '请输入名称',
		},
	],
};

const columns: ProFormColumns = [
	{
		title: '名称',
		dataIndex: 'name',
		formItemProps: {
			// 如果同时使用Form.item的rules和SchemaForm的rules，将会优先使用Form.item的
			rules: [
				{
					required: true,
					message: '请输入名称',
				},
			],
		},
	},
];

export default () => (
	<SchemaForm
		rules={rules}
		columns={columns}
	/>
);
```

### SchemaForm

| Properties | Description | Type | Default |
| --- | --- | --- | --- |
| rules | form 表单 rules 集中配置，具体请参考[rule](https://ant.design/components/form-cn/#Rule) | `Record<string, Rule[]>` | - |
| justifyLabel | label 是否调整为 justify-content: space-between;排列，默认开启，如果需要关闭，请设置为 false | `boolean` | true |
| bordered | 封装的 ProTable 里 QueryFilter 是否开启边框，默认为 false，其他 layoutType 将忽略 | `boolean` | true |

更多 api 请参考 pro-form 里的[Schema Form](https://procomponents.ant.design/components/schema-form)
