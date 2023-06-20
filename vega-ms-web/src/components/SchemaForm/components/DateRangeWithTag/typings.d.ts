import type { RangePickerProps } from 'antd/es/date-picker';
export interface OptionProps {
	label: string;
	count?: number;
	type?: 'year' | 'month' | 'day';
}
export type DateRangeWithTagProps = RangePickerProps & {
	formKey?: string; // column.proFieldKey + @@ + SchemaForm生成时间戳， SchemaForm自动生成，单独使用时不要手动设置
	options?: OptionProps[];
	labelWidth?: number;
	defaultTagValue?: string;
};
