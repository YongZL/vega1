export default {
	path: '/threeStock',
	// name: 'threeStock',
	icon: null,
	routes: [
		{
			exact: true,
			path: '/threeStock',
			redirect: '/threeStock/inventory',
		},
		{
			// name: 'charge_schedule',
			path: '/threeStock/charge_schedule',
			access: 'three_stock_charge_schedule',
			routes: [
				{
					exact: true,
					// name: 'charge_schedule_list',
					path: '/threeStock/charge_schedule',
					component: './threeStock/charge_schedule',
					access: 'three_stock_charge_schedule',
				},
				{
					exact: true,
					// name: 'charge_schedule_detail',
					path: '/threeStock/charge_schedule/detail/:id',
					component: './threeStock/charge_schedule/detail',
					access: 'three_stock_charge_schedule',
				},
				{
					component: '404',
				},
			],
		},
		{
			// name: 'stock_inquiry',
			path: '/threeStock/stock_inquiry',
			access: 'three_stock_inquiry',
			routes: [
				{
					exact: true,
					// name: 'stock_inquiry_list',
					path: '/threeStock/stock_inquiry',
					component: './threeStock/stock_inquiry',
					access: 'three_stock_inquiry',
				},
				{
					component: '404',
				},
			],
		},

		{
			// name: 'threeStock_inventory',
			path: '/threeStock/inventory',
			access: '/threeStock/inventory',
			routes: [
				{
					exact: true,
					// name: 'threeStock_inventory_list',
					path: '/threeStock/inventory',
					component: './threeStock/Inventory',
					access: 'three_stock_inventory',
				},
				{
					exact: true,
					// name: 'threeStock_inventory_add',
					path: '/threeStock/inventory/inventory_add',
					component: './threeStock/Inventory/component',
					access: 'three_stock_add',
				},
				{
					exact: true,
					// name: 'threeStock_inventory_detail',
					path: '/threeStock/inventory/detail',
					component: './threeStock/Inventory/component',
					access: 'three_stock_detail',
				},
				{
					exact: true,
					// name: 'threeStock_inventory_check',
					path: '/threeStock/inventory/check',
					component: './threeStock/Inventory/check',
					access: 'three_stock_check',
				},
				{
					component: '404',
				},
			],
		},
		{
			// name: 'threeStock_diversityRatio',
			path: '/threeStock/diversityRatio',
			access: 'three_stock',
			routes: [
				{
					exact: true,
					// name: 'purchase_diversityRatio_list',
					path: '/threeStock/diversityRatio',
					component: './threeStock/diversityRatio',
					access: 'three_stocek_diversityRatio',
				},
				{
					exact: true,
					// name: 'purchase_diversityRatio_detail',
					path: '/threeStock/diversityRatio/detail',
					component: './threeStock/diversityRatio/detail',
					access: 'three_stock_diversityRatio_detail',
				},
				{
					component: '404',
				},
			],
		},
		{ component: '404' },
	],
};
