# TagSelect

### 描述

> TagSelect 基于 ant-design 里的 Tag.CheckableTag 进行封装，支持单选和多选模式，多选模式会自动生成全选 tag，该组件封装主要目的是用于 form 表单状态、类型等功能的选择

基本使用

```tsx | pure
import type { CheckableTagProps } from '@/components/SchemaForm/typings';
import { TagSelect } from '@/components/SchemaForm';

const options: CheckableTagProps[] = [
	{
		label: '名称',
		value: '张三',
	},
];

export default () => <TagSelect options={options} />;
```

在 SchemaForm 中使用

```tsx | pure
import SchemaForm, from '@/components/SchemaForm';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import type { CheckableTagProps } from '@/components/SchemaForm/typings';

const options: CheckableTagProps[] = [
  {
    label: '张三',
    value: '张三',
  },
];

const columns: ProFormColumns = [
  {
    title: '名称',
    dataIndex: 'name',
    valueType: 'tagSelect',
    fieldProps: {
      options,
    },
  },
];

export default () => <SchemaForm columns={columns} />;
```

### TagSelect

| Properties | Description | Type | Default |
| --- | --- | --- | --- |
| options | 扩展自 CheckableTagProps | `CheckableTagProps[]` | - |
| defaultValue | 默认值 | `T[]` | - |
| value | 当前 value，如果存在将默认使用 defaultValue | `T[]` | - |
| multiple | 是否多选，多选模式下自动添加全选 tag | `boolean` | true |
| checkAllText | 全选文字 | `string` | 全部 |
| onChange | 值改变后回调 | `(value?: T[]) => void` | - |
| onItemClick | 单项点击回调 | `(event: React.MouseEvent<HTMLSpanElement, MouseEvent>, itemProps: CheckableTagProps, checked: boolean) => void;` | - |

### CheckableTag

| Properties | Description | Type | Default |
| --- | --- | --- | --- |
| label | 标签文字 | `React.ReactNode` | - |
| value | 当前标签 value | - |
| render | 标签渲染函数，如果与 value 同时存在，优选使用 render 函数 | `(itemProps: Omit<CheckableTagProps, 'render'>) => React.ReactNode` | - |

更多 api 请参考 [Tag](https://ant.design/components/tag-cn/#Tag)与[CheckableTag](https://ant.design/components/tag-cn/#Tag.CheckableTag)
