// 分页接口的分页配置，如果修改了分页配置，请修改相应的ResponseResult、Pager、ResponseList和CommonListParams
declare type PagerFieldConfig = {
	pagerField?: string; // 分页字段，如果不传则默认用顶级对象
	pageNumField: string; // 当前页码字段
	pageSizeField: string; // 分页大小字段
	totalPageField?: string; // 总页数字段
	totalField: string; // 总数字段
	endField: string; // 是否是最后一页字段
	startField?: string; // 是否是首页字段
	startPage?: 0 | 1; // 第一页的页码
};

// 分页接口配置
declare type PageListFieldConfig = {
	successCode: string | number; // 成功状态吗，其他状态码则视为失败
	codeField: string; // 状态码字段
	pagerFieldConfig?: PagerConfig; // 分页字段，分页的情况下必传
	listField: string; // 列表字段
};

declare interface ResponseResult<T = null> {
	code: PageListConfig['successCode'];
	exMsg?: string;
	msg: string;
	data: T;
}

declare type Pager = {
	pageNum: number;
	pageSize: number;
	totalPage?: number;
	totalCount?: number;
	isLast?: boolean;
	isFirst?: boolean;
	summary?: number;
	sumQuantity?: number;
	sumPrice?: number;
};

// 如果分页数据在顶层对象，请和ResponseResult合并，其中rows现在为列表字段，如果修改了PageListConfig的列表字段，请在这里修改掉
declare type ResponseList<T = Record<string, any>> = ResponseResult<
	Pager & {
		rows: T[];
	}
>;

// 分页数据在顶层对象的情况的分页接口返回数据
// declare type ResponseList<T = Record<string, any>> = ResponseResult & Pager & {
//   rows: T[];
// };

// 列表页排序参数
type SortBean = {
	desc?: boolean; // 是否降序
	nullsLast?: boolean; // null值是否放最后
	sortName: string; // 排序字段
};

// 列表页公共参数
declare type CommonPageParams = {
	pageNum?: number;
	pageSize?: number;
	sortList?: SortBean[];
	sortableColumnName?: string[];
};
