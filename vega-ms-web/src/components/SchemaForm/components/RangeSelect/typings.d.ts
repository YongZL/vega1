import type { CSSProperties } from 'react';
import type { SelectProps, CascaderProps } from 'antd';

export interface RangeSelectProps<T = Record<string, any>> {
	formKey?: string; // column.proFieldKey + @@ + SchemaForm生成时间戳， SchemaForm自动生成，单独使用时不要手动设置
	selectProps?: SelectProps;
	cascaderProps?: CascaderProps<T>;
	className?: string;
	style?: CSSProperties;
	onChange?: (value: { select?: number | null; cascader?: (string | number)[] }) => void;
	request?: (val: any) => Promise<T[]>;
}
