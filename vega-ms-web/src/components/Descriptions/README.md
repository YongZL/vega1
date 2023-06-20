# Descriptions

### 描述

> Descriptions 是基于 ant-design 的 Descriptions 进行二次封装，以配置的形式传参

基本使用

```tsx | pure
import type { DescriptionsItemProps } from '@/components/Descriptions/typings';

import Descriptions from '@/components/Descriptions';

interface DataItem {
	col1: string;
	col2: string;
	col3: string;
	col4: string;
}

export default () => {
	const options: DescriptionsItemProps<DataItem>[] = [
		{
			label: '列1',
			dataIndex: 'col1',
		},
		{
			label: '列2',
			dataIndex: 'col2',
		},
		{
			label: '列3',
			dataIndex: 'col3',
		},
		{
			label: '列4',
			dataIndex: 'col4',
		},
	];

	const data: DataItem = {
		col1: '123',
		col2: '234',
		col3: '345',
		col4: '456',
	};

	return (
		<Descriptions<DataItem>
			options={options}
			data={data}
		/>
	);
};
```

### DescriptionsProps

| Properties      | Description                  | Type                         | Default |
| --------------- | ---------------------------- | ---------------------------- | ------- |
| options         | DescriptionsItemProps 配置   | `DescriptionsItemProps<T>[]` | []      |
| data            | 要显示的数据                 | `Record<string, any>`        | {}      |
| optionEmptyText | 空值时的显示默认值，默认关闭 | `string` `false`             | -       |

### DescriptionsItemProps

| Properties | Description | Type |
| --- | --- | --- |
| dataIndex | Descriptions['data']的属性值 | `string` |
| show | 是否展示当前描述，默认为 true | `boolean` |
| render | 渲染数据的函数，如果 render 返回 `false` 则不显示 | `render?: (text: any, data: T) => ReactNode;` |

更多 api 请参考 [Descriptions](https://ant.design/components/descriptions-cn/#Descriptions)与[DescriptionsItem](https://ant.design/components/descriptions-cn/#DescriptionItem)
