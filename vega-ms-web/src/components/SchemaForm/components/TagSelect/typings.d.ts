import type { ReactNode } from 'react';
import type React from 'react';
import type { CheckableTagProps as OptionProps } from 'antd/es/tag/CheckableTag';

export type CheckableTagProps = Omit<OptionProps, 'checked'> & {
	label: ReactNode;
	text?: ReactNode;
	value: any;
	render?: (itemProps: Omit<CheckableTagProps, 'render'>) => ReactNode;
};
export interface TagSelectProps<T = any> extends React.HTMLAttributes<HTMLDivElement> {
	// formKey?: string; // column.proFieldKey + @@ + SchemaForm生成时间戳， SchemaForm自动生成，单独使用时不要手动设置
	style?: React.CSSProperties;
	className?: string;
	options?: CheckableTagProps[];
	defaultValue?: T[];
	value?: T[];
	// 默认全选
	multiple?: boolean;
	checkAllText?: ReactNode;
	onChange?: (value?: T[]) => void;
	onItemClick?: (
		event: React.MouseEvent<HTMLSpanElement, MouseEvent>,
		itemProps: CheckableTagProps,
		checked: boolean,
	) => void;
	cancelable?: boolean; // 单选是否可以取消选中，false或者不传不可以取消
}
