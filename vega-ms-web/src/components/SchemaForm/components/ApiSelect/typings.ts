import type { SelectProps } from 'antd';

export type ApiSelectProps = SelectProps & {
	formKey?: string; // column.proFieldKey + @@ + SchemaForm生成时间戳， SchemaForm自动生成，单独使用时不要手动设置
	pagerFieldConfig: PagerFieldConfig;
	pageListFieldConfig: PageListFieldConfig;
	fieldConfig?: {
		label: string; // 列表label的字段名
		value: string; // 列表值的字段名
		keyword?: string; // 搜索的字段，如果开启搜索，请设置这个字段
		key?: string | ((record: Record<string, any>) => string); // key生成
	};
	pagination?: boolean; // 是否分页查询
	params?: Record<string, any>; // 携带的额外请求参数
	immediate?: boolean; // 是否创建后立即请求
	onValuesChange?: SelectProps['onChange'];
	searchInterval?: number; // 搜索时间间隔，毫秒数，默认为800毫秒
	loadingTip?: string; // loading状态的提示信息，默认 Loading...
	api?: <R = ResponseList>(
		params: (Pager & Record<string, any>) | Record<string, any>,
	) => Promise<R>;
};
