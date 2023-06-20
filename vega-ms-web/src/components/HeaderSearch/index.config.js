const linkList = [
	//入库申请
	{
		type: 'GOODS_REQUEST',
		url: '/department/warehousing_apply',
		keyCode: 'GR',
	},
	//手术请领
	{
		type: 'SURGICAL_GOODS_REQUEST',
		url: '/department/operation_request',
		keyCode: 'SGR',
	},
	//采购计划
	{
		type: 'PURCHASE_PLAN',
		url: '/purchase/handle',
		keyCode: 'PP',
	},
	//订单
	{
		type: 'PURCHASE_ORDER',
		url: '/purchase/handle',
		keyCode: 'PO',
	},
	//配送单
	{
		type: 'DELIVERY',
		url: '/purchase/handle',
		keyCode: 'DN',
	},
	// 中心库验收
	{
		type: 'RECEIVING',
		url: '/repository/receiving_management',
		searchUrl: '/repository/receiving_list',
		keyCode: 'WA',
	},
	//配货
	{
		type: 'PICKING_LIST',
		url: '/repository/outbound_handle',
		searchUrl: '/repository/outbound_query',
		state: { key: '2' },
		keyCode: 'PL',
	},
	//推送单
	{
		type: 'PUSH_LIST',
		url: '/repository/outbound_handle',
		searchUrl: '/repository/outbound_query',
		state: { key: '3' },
		keyCode: 'UL',
	},
	//标准验收
	{
		type: 'ACCEPTANCE',
		url: '/department/Inbound_processing',
		searchUrl: '/department/warehouse_queries',
		keyCode: 'UL',
	},
	//结算单
	{
		type: 'MONTHLY_STATEMENT',
		url: '/finance/settlement',
		keyCode: 'MS',
	},
	// 生命周期
	{
		type: 'GOODS_BARCODE',
		url: '/global_search',
		keyCode: 'ID',
	},
	//基础物资
	{
		type: 'FUZZY_SEARCH',
		url: '/base_data/new_goods',
		keyCode: '',
	},
	{
		type: 'GS1_CODE',
		url: '/global_search',
		keyCode: '',
	},
	// 中心库退货单
	{
		type: 'RETURN_GOODS_ORDER',
		url: '/department/return_processing',
		searchUrl: '/department/return_query',
		state: { key: '1' },
		keyCode: 'RG',
	},
	// 科室库退货单
	{
		type: 'DEPARTMENT_RETURN_GOODS_ORDER',
		url: '/department/return_processing',
		searchUrl: '/department/return_query',
		state: { key: '2' },
		keyCode: 'RG',
	},
	// 定制耗材消耗
	{
		type: 'SURGICAL_RECEIVING',
		url: '/department/surgical_receiving',
		keyCode: 'WA',
	},
	// 盘库
	{
		type: 'STOCK_TAKING_ORDER',
		url: '/repository/stock_count',
		keyCode: 'ST',
	},
	//加工
	{
		type: 'PROCESSING_ORDER',
		url: '/repository/process_list',
		keyCode: 'PPO',
	},
	//调拨
	{
		type: 'REALLOCATE',
		url: '/department/Inbound_processing',
		searchUrl: '/department/warehouse_queries',
		applyUrl: '/department/warehousing_apply',
		keyCode: 'RO',
	},
	{
		type: 'PACKAGE_BULK',
		url: '/searchBulk',
		keyCode: '',
	},
	{
		type: 'PACKAGE_ORDINARY',
		url: '/searchOrdinary',
		keyCode: '',
	},
];
export default linkList;
