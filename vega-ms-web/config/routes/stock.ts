export default {
	// name: 'stock',
	icon: 'icon-Inventory',
	path: '/stock',
	routes: [
		{
			// name: 'stock_query',
			icon: null,
			path: '/stock/stock_query',
			component: './stock/stockQuery/list',
			access: 'stock_query',
			wrappers: ['@/wrappers/warehouseSelect'],
		},
		{
			exact: true,
			path: '/stock',
			redirect: '/stock/stock_intransit',
		},
		{
			// name: 'stock_intransit',
			icon: null,
			path: '/stock/stock_intransit',
			component: './stock/stock_intransit_available/list/intransit',
			access: 'inventory_intransit',
		},
		{
			// name: 'stock_available',
			icon: null,
			path: '/stock/stock_available',
			component: './stock/stock_intransit_available/list/available',
			access: 'inventory_available',
		},
		{
			// name: 'stock_history',
			icon: null,
			path: '/stock/stock_history',
			component: './stock/stock_history/list',
			access: 'stock_history',
		},
		{
			// name: 'stock_warehouse',
			icon: null,
			path: '/stock/stock_warehouse',
			component: './stock/stock_warehouse/list',
			access: 'inventory_quantity',
		},
		{
			component: '404',
		},
	],
};
