const { WEB_PLATFORM } = process.env;
let wrappers = WEB_PLATFORM === 'RS' ? { wrappers: ['@/wrappers/warehouseSelect'] } : {};
export default {
	// name: 'summary',
	icon: 'icon-Summary',
	path: '/summary',
	routes: [
		{
			exact: true,
			path: '/summary',
			redirect: '/summary/unconsume_history',
		},
		{
			// name: 'logic_stock_operation',
			path: '/summary/logic_stock_operation',
			access: 'logic_stock_operation_list',
			routes: [
				{
					exact: true,
					// name: 'logic_stock_operation_list',
					path: '/summary/logic_stock_operation',
					access: 'logic_stock_operation_list',
					component: './summary/logic_stock_operation',
				},
				{ component: '404' },
			],
		},
		{
			// name: 'department_consume',
			path: '/summary/department_consume',
			access: 'repository_inbound_summary_list',
			routes: [
				{
					exact: true,
					// name: 'department_consume',
					path: '/summary/department_consume',
					access: 'repository_inbound_summary_list',
					component: './summary/department_consume',
				},
				{ component: '404' },
			],
		},
		{
			// name: 'goods_life',
			path: '/summary/goods_life',
			access: 'goods_life',
			routes: [
				{
					exact: true,
					// name: 'goods_life_list',
					path: '/summary/goods_life',
					access: 'goods_life',
					component: './summary/goods_life',
				},
				{ component: '404' },
			],
		},
		{
			// name: 'consume_history',
			exact: true,
			icon: null,
			path: '/summary/consume_history',
			component: './summary/consume_history/list',
			access: 'consume_history',
		},
		{
			// name: 'unpack_record',
			exact: true,
			icon: null,
			path: '/summary/unpack_record',
			component: './summary/unpack_record',
			access: 'unpack_record',
		},
		{
			exact: true,
			// name: 'goods_inquire',
			path: '/summary/goods_inquire',
			component: './summary/goods_inquire',
			access: 'goods_inquire',
		},
		{
			exact: true,
			// name: 'supplier_inventory_status',
			path: '/summary/distributor_inventory_status',
			component: './summary/supplier_inventory_status',
			access: 'distributor_inventory_status',
		},
		{
			exact: true,
			// name: 'reportSummary',
			path: '/summary/report_summary',
			component: './summary/reportSummary/list',
			access: 'report_summary',
			...wrappers,
		},
		{
			exact: true,
			path: '/summary/report_repository_outbound',
			component: './summary/inventoryDeliverySummary',
			access: 'report_repository_outbound',
		},
		{
			exact: true,
			path: '/summary/income_expenditure_summary',
			component: './summary/incomeExpenditureSummary',
			access: 'income_expenditure_summary',
		},
		// { component: '404' }, 此处404在app.tsx里动态追加在最后了
	],
};
