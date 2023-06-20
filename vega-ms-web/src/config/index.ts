// 非Layout页面
export const loginPath = '/user/login';

export const mainOutPages = [loginPath, '/user/hospital', '/user/about'];

// 默认分页接口数据的分页字段配置
export const defaultPagerFieldConfig: PagerFieldConfig = {
	pagerField: 'data', // 分页字段，如果不传则默认用顶级对象
	pageNumField: 'pageNum', // 当前页码字段
	pageSizeField: 'pageSize', // 分页大小字段
	totalPageField: 'totalPage', // 总页数字段
	totalField: 'totalCount', // 总数字段
	startField: 'isFisrt', // 是否是首页的字段
	endField: 'isLast', // 列表字段
	startPage: 0, // 第一页的页码，默认为0
};

// 默认分页接口数据字段配置
export const defaultPageListFieldConfig: PageListFieldConfig = {
	successCode: 0, // 成功状态吗，其他状态码则视为失败
	codeField: 'code', // 状态码字段
	pagerFieldConfig: defaultPagerFieldConfig, // 分页字段，分页的情况下必传
	listField: 'data.rows', // 插叙的列表数据
};

// 默认分页数据配置
export const defaultPager: Pager = {
	pageNum: 0,
	pageSize: 50,
	totalCount: 0,
};

// 详情非必填字段没有内容的提示
export const onContent = '暂无';
