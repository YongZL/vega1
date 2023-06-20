export default {
	path: '/repository',
	// name: 'repository',
	icon: 'icon-cangku',
	routes: [
		// {
		//   // name: 'resupply_setting',
		//   icon: null,
		//   path: '/repository/resupply_setting',
		//   component: './repository/resupply_setting',
		//   access: 'resupply_setting_list',
		// },
		// {
		//   // name: 'stock_count',
		//   icon: null,
		//   path: '/repository/stock_count',
		//   access: 'stock_taking_order_list',
		//   routes: [
		//     {
		//       exact: true,
		//       // name: 'stock_count_list',
		//       path: '/repository/stock_count',
		//       component: './repository/stock_count/list',
		//       access: 'stock_taking_order_list',
		//     },
		//     {
		//       exact: true,
		//       // name: 'stock_count_list',
		//       path: '/repository/stock_count/:id/:readOnly',
		//       component: './repository/stock_count/list',
		//       access: 'stock_taking_order_list',
		//     },
		//     {
		//       component: '404',
		//     },
		//   ],
		// },
		{
			// name: 'stock_count_deal',
			icon: null,
			path: '/repository/stock_count_deal',
			routes: [
				{
					exact: true,
					// name: 'stock_count_deal_list',
					path: '/repository/stock_count_deal',
					component: './repository/stockCount/list/handle',
					access: 'stock_count_deal',
					wrappers: ['@/wrappers/todoList/stockCountDealSelect'],
				},
				{
					exact: true,
					// name: 'stock_count_deal_list',
					path: '/repository/stock_count_deal/:id/:readOnly',
					component: './repository/stockCount/list/handle',
					access: 'stock_count_deal',
				},
				{
					component: '404',
				},
			],
		},
		{
			// name: 'stock_count_query',
			icon: null,
			path: '/repository/stock_count_query',
			routes: [
				{
					exact: true,
					// name: 'stock_count_query_list',
					path: '/repository/stock_count_query',
					component: './repository/stockCount/list/index',
					access: 'stock_count_query',
				},
				{
					exact: true,
					// name: 'stock_count_query_list',
					path: '/repository/stock_count_query/:id/:readOnly',
					component: './repository/stockCount/list/index',
					access: 'stock_count_query',
				},
				{
					component: '404',
				},
			],
		},
		// {
		//   // name: 'code_print',
		//   icon: null,
		//   path: '/repository/code_print',
		//   component: './repository/code_print',
		//   access: 'unpack',
		//   routes: [
		//     {
		//       exact: true,
		//       // name: 'code_print',
		//       path: '/repository/code_print',
		//       access: 'unpack',
		//       component: './repository/code_print',
		//     },
		//     {
		//       component: '404',
		//     },
		//   ],
		// },
		{
			// name: 'rfid_bind_list',
			icon: null,
			path: '/repository/rfid_bind_list',
			component: './repository/rfid_bind_list',
			access: 'rfid_bind',
			routes: [
				{
					exact: true,
					// name: 'rfid_bind_list',
					path: '/repository/rfid_bind_list',
					access: 'rfid_bind',
					component: './repository/rfid_bind_list',
				},
				{
					component: '404',
				},
			],
		},
		{
			// name: 'receiving_management',
			icon: null,
			path: '/repository/receiving_management',
			access: 'receiving_order',
			routes: [
				{
					exact: true,
					// name: 'receiving_management_list',
					path: '/repository/receiving_management',
					access: 'receiving_order',
					component: './repository/receivingManage/list/handle',
					wrappers: ['@/wrappers/todoList/receivingSelect'],
				},
				{
					component: '404',
				},
			],
		},
		{
			// name: 'receiving_list',
			icon: null,
			path: '/repository/receiving_list',
			access: 'receiving_list',
			routes: [
				{
					exact: true,
					// name: 'receiving_list_list',
					path: '/repository/receiving_list',
					access: 'receiving_list',
					component: './repository/receivingManage/list',
				},
				{
					component: '404',
				},
			],
		},
		{
			// name: 'process',
			icon: null,
			path: '/repository/process_list',
			access: 'process',
			routes: [
				{
					exact: true,
					// name: 'process_list',
					path: '/repository/process_list',
					access: 'process',
					component: './repository/process_list/list',
					wrappers: ['@/wrappers/todoList/processSelect'],
				},
				{
					exact: true,
					// name: 'process_add',
					path: '/repository/process_list/add',
					access: 'processing',
					component: './repository/process_list/add',
				},
				{
					component: '404',
				},
			],
		},
		{
			// name: 'unpack',
			icon: null,
			path: '/repository/unpack',
			component: './repository/unpack',
			access: 'unpacking',
			routes: [
				{
					exact: true,
					// name: 'unpack_list',
					path: '/repository/unpack',
					component: './repository/unpack',
					access: 'unpacking',
				},
				{
					component: '404',
				},
			],
		},
		// 以下中心库退货路由与科室退货路由合并到退货业务中变成组件的形式了，不需要加入路由中
		// {
		//   // name: 'return_purchase',
		//   icon: null,
		//   path: '/repository/return_purchase',
		//   access: 'return_goods_list',
		//   routes: [
		//     {
		//       exact: true,
		//       // name: 'return_purchase_list',
		//       path: '/repository/return_purchase',
		//       access: 'return_goods_list',
		//       component: './repository/return_purchase/list',
		//     },
		//     {
		//       exact: true,
		//       // name: 'return_purchase_list',
		//       path: '/repository/return_purchase/:id/:readOnly',
		//       access: 'return_goods_list',
		//       component: './repository/return_purchase/list',
		//     },
		//     {
		//       exact: true,
		//       // name: 'return_purchase_add',
		//       path: '/repository/return_purchase/add',
		//       access: 'add_return_goods',
		//       component: './repository/return_purchase/add',
		//     },
		//     {
		//       component: '404',
		//     },
		//   ],
		// },
		{
			// name: 'outbound_handle',
			icon: null,
			access: 'outbound_handle',
			path: '/repository/outbound_handle',
			routes: [
				{
					exact: true,
					// name: 'outbound_handle',
					path: '/repository/outbound_handle',
					component: './repository/outbound/outboundHandle',
					access: 'outbound_handle',
					wrappers: ['@/wrappers/todoList/outboundSelect'],
				},
				{
					component: '404',
				},
			],
		},
		{
			// name: 'outbound_query',
			icon: null,
			access: 'outbound_query',
			path: '/repository/outbound_query',
			routes: [
				{
					exact: true,
					// name: 'outbound_query',
					path: '/repository/outbound_query',
					component: './repository/outbound/outboundQuery',
					access: 'outbound_query',
				},
				{
					component: '404',
				},
			],
		},
		{ component: '404' },
	],
};
