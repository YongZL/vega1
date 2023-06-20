import type { MutableRefObject, ReactNode } from 'react';
import type { ProFormInstance } from '@ant-design/pro-form';
import type {
	ProTableProps as TableProps,
	ProColumnType as AntProColumnType,
} from '@ant-design/pro-table';
import type { FormSchemaProps } from '@/components/SchemaForm/typings';
import type { FormSchema } from '@ant-design/pro-form/lib/components/SchemaForm';

export type ProFormValueType = 'tagSelect' | 'tagDate' | 'tagDateTime' | 'aSwitch';
export type ProTableAction = {
	reload: () => void;
	getDataSource: () => Record<string, any>[];
	getParams: () => Record<string, any>;
	onReset: () => void;
	setDataSource: (rows: any[]) => void; //修改表格的数据及请求回来的列表数据
	submit: () => void;
};

type ProColumnType<T, ValueType = 'text'> = Omit<AntProColumnType<T, ValueType>, 'width'> & {
	width?: 'XXXS' | 'XXS' | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL' | string | number;
};

type ProColumnGroupType<RecordType, ValueType> = {
	children: ProColumns<RecordType>[];
} & ProColumnType<RecordType, ValueType>;
export type ProColumns<T, ValueType = 'text'> =
	| ProColumnGroupType<T, ValueType>
	| ProColumnType<T, ValueType>;

export type ProTableProps<T, U = Record<string, any>, VT = 'text'> = Omit<
	TableProps<T, U, VT>,
	'columns' | 'tableAlertOptionRender'
> & {
	// 是否去掉内部QueryFilter与Protable外层CardBody的padding，默认为true
	noPadding?: boolean;
	// 是否使用自定义样式，默认为true，如果设置为false，将使用原始QueryFilterForm 与 ProTable样式
	customStyle?: boolean;
	// 是否开启斑马纹，默认为true
	striped?: boolean;
	api?: <R = ResponseResult<ResponseListData>>(
		params: Pager & Record<string, any>,
		options?: Record<string, any>,
	) => Promise<R>;
	beforeSearch?: (
		params: Record<string, any>,
	) => Promise<Record<string, any>> | Record<string, any>;
	searchConfig?: FormSchemaProps<U>;
	dateFormat?: Record<
		string,
		{
			startKey: string;
			endKey: string;
			// 日期格式化函数
			formatFn?: (key: string, date: number | string) => number | string;
			format?: string;
			// 格式化类型，如果type是number类型则会转化为毫秒，如果是format会根据format字段的值来格式化
			type?: 'number' | 'format';
		}
	>;
	tableRef?: MutableRefObject<ProTableAction | undefined> | ((actionRef: ProTableAction) => void);
	columnsWidth?: string | number; // 每列默认统一宽度，如果不设置，则默认为80
	columns?: ProColumns<T, VT>[];
	paramsToString?: any[];
	requestCompleted?: (rows: T[], params: Record<string, any>, data: Record<string, any>) => void; // 请求完成
	beforeFetch?: (params: Record<string, any>) => boolean | undefined; // 请求之前拦截，如果是false或undefined将不会请求
	loadConfig?: {
		request?: boolean; // 是否首次加载立即请求，如果设置false则首次不请求，默认为true
		sort?: boolean; // 是否排序后立即请求，如果设置false则排序后不立即请求而是点击搜索才会请求，默认为true
		filter?: boolean; // 是否过滤后立即请求，如果设置false则过滤后不立即请求而是点击搜索才会请求，默认为true
		reset?: boolean; // 是否重置后立即请求，如果设置false则重置后不立即请求而是点击搜索才会请求，默认为true
		loadText?: string; //修改列表不请求时显示的文案
	};
	onReset?: () => void; // 在重置并设置请求参数之后的回调函数
	onFinish?: () => void; // 在点击并设置请求参数之后的回调函数
	setRows?: (res: Record<string, any>) => Record<string, any>; //设置请求回来的res取值方式
	beforeOnReset?: (form: ProFormInstance<any> | ProFormInstance<U> | null | undefined) => void; // 在重置并设置请求参数之前的回调函数
	hasRequired?: boolean; // 搜索区域的必填label文字是否与非必填项的文字对齐
	searchKey?: string; //页面跳转时搜索状态本地缓存的key，传了为保留记录，没传默认不保留搜索记录
	tableAlertOptionRender?: TableProps<T, U, VT>['tableAlertOptionRender'] | ReactNode;
	extraHeight?: number; // 滚动高度修正高度
	renderSummary?: (dataSource: T[], pager: Record<string, any>) => Record<string, any>; // 统计渲染回调
	indexKey?: string;
	loading?: boolean;
	span?: number; //控制搜索区域的占比，注意每一个都会改变
	isTbaleBespread?: boolean; // 列表部分数据不够的情况下是否铺满剩下高度,如果设置true则不铺满
	defaultCollapsed?: boolean; // 表单默认收起还是展开、true为表单默认收起，默认值为false
};
