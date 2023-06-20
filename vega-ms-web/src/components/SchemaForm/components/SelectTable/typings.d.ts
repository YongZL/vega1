import type { TableProps, SelectProps } from 'antd';

export type SelectTableProps<T extends Record<string, any>> = Omit<SelectProps, 'onChange'> & {
	onChange?: (value: any, option: T) => void;
	tableProps?: TableProps<T>;
	api?: <T = Record<string, any>>(params: T) => Promise<ResponseResult<Record<string, any>[]>>;
	labelKey?: string; // 设置select输入框显示的值，默认label
	valueKey?: string; // 设置select输入框的值，默认value
	searchKey?: string; // 搜索的传参取的key值，默认keyword
	filterData?: <U = Record<string, any>>(data: ResponseResult<U>) => T[];
	params?: Record<string, any>;
	multiple?: boolean;
	selectRowKeys?: number[];
	isSearch?: boolean;
};
