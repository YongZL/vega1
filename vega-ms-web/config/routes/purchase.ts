export default {
	path: '/purchase',
	// name: 'purchase',
	icon: 'icon-caigou',
	routes: [
		{
			exact: true,
			path: '/purchase',
			redirect: '/purchase/handle',
		},
		// {
		//   // name: 'procurement_process',
		//   icon: null,
		//   path: '/purchase/procurement_process',
		//   access: 'procurement_process_list',
		//   routes: [
		//     {
		//       exact: true,
		//       // name: 'procurement_process_list',
		//       path: '/purchase/procurement_process',
		//       component: './purchase/procurement_process',
		//       access: 'procurement_process_list',
		//     },
		//     {
		//       exact: true,
		//       // name: 'purchase_plan_list',
		//       path: '/purchase/purchase_plan',
		//       component: './purchase/purchase_plan',
		//       access: 'purchase_plan_list',
		//     },
		//     {
		//       exact: true,
		//       // name: 'procurement_process_add',
		//       path: '/purchase/procurement_process/add',
		//       component: './purchase/purchase_plan/add',
		//       access: 'procurement_process_list',
		//     },
		//     {
		//       component: '404',
		//     },
		//   ],
		// },
		// {
		//   // name: 'purchasing_query',
		//   icon: null,
		//   path: '/purchase/purchasing_query',
		//   access: 'purchasing_query_list',
		//   routes: [
		//     {
		//       exact: true,
		//       // name: 'purchasing_query_list',
		//       path: '/purchase/purchasing_query',
		//       component: './purchase/purchasing_query',
		//       access: 'purchasing_query_list',
		//     },
		//     {
		//       exact: true,
		//       // name: 'purchase_plan_list',
		//       path: '/purchase/purchase_plan/:id/:readOnly',
		//       component: './purchase/purchase_plan',
		//       access: 'purchase_plan_list',
		//     },
		//     {
		//       component: '404',
		//     },
		//   ],
		// },
		// 新采购处理
		{
			// name: 'procurement_process',
			icon: null,
			path: '/purchase/handle',
			// access: 'procurement_process',
			routes: [
				{
					exact: true,
					// name: '/purchase/handle_add',
					path: '/purchase/handle/add',
					component: './purchase/planList/add',
					access: 'handled_add_purchase_plan',
				},
				{
					exact: true,
					// name: 'procurement_handle_list',
					path: '/purchase/handle',
					component: './purchase/handle',
					access: 'purchase_handle',
					wrappers: ['@/wrappers/todoList/purchaseSelect'],
				},
				{
					exact: true,
					// name: 'procurement_handle_list',
					path: '/purchase/handle/:id/:readOnly',
					component: './purchase/handle',
					access: 'purchase_handle',
				},
				// {
				//   exact: true,
				//   // name: 'procurement_handle_list',
				//   path: '/purchase/purchase_plan/:id/:readOnly',
				//   component: './purchase/purchase_plan',
				//   access: 'procurement_handle_list',
				// },
				{
					exact: true,
					path: '/purchase/handle/edit',
					component: './purchase/planList/add',
					access: 'handled_edit_purchase_plan',
				},
				{
					component: '404',
				},
			],
		},
		// 新采购查询
		{
			// name: 'purchasing_query',
			icon: null,
			path: '/purchase/query',
			access: 'procurement_query',
			routes: [
				{
					exact: true,
					// name: 'purchasing_query_list',
					path: '/purchase/query',
					component: './purchase',
					access: 'procurement_query',
				},
				{
					exact: true,
					// name: 'purchasing_query_list',
					path: '/purchase/query/:id/:readOnly',
					component: './purchase',
					access: 'procurement_query',
				},
				{
					component: '404',
				},
			],
		},

		// {
		//   // name: 'purchase_plan',
		//   icon: null,
		//   path: '/purchase/purchase_plan',
		//   access: 'purchase_plan_list',
		//   routes: [
		//     {
		//       exact: true,
		//       // name: 'purchase_plan_list',
		//       path: '/purchase/purchase_plan',
		//       component: './purchase/purchase_plan',
		//       access: 'purchase_plan_list',
		//     },
		//     {
		//       exact: true,
		//       // name: 'purchase_plan_add',
		//       path: '/purchase/purchase_plan/add',
		//       component: './purchase/purchase_plan/add',
		//       access: 'purchase_plan_list',
		//     },
		//     {
		//       exact: true,
		//       // name: 'purchase_plan_list',
		//       path: '/purchase/purchase_plan/:id/:readOnly',
		//       component: './purchase/purchase_plan',
		//       access: 'purchase_plan_list',
		//     },
		//     {
		//       component: '404',
		//     },
		//   ],
		// },
		// {
		//   // name: 'purchase_order',
		//   icon: null,
		//   path: '/purchase/purchase_order',
		//   access: 'purchase_order_list',
		//   routes: [
		//     {
		//       exact: true,
		//       // name: 'purchase_order_list',
		//       path: '/purchase/purchase_order',
		//       component: './purchase/purchase_order',
		//       access: 'purchase_order_list',
		//     },
		//     {
		//       exact: true,
		//       // name: 'purchase_order_list',
		//       path: '/purchase/purchase_order/:id/:readOnly',
		//       component: './purchase/purchase_order',
		//       access: 'purchase_order_list',
		//     },
		//     {
		//       component: '404',
		//     },
		//   ],
		// },
		// {
		//   // name: 'delivery',
		//   icon: null,
		//   path: '/purchase/delivery',
		//   access: 'shipping_order_list',
		//   routes: [
		//     {
		//       exact: true,
		//       // name: 'delivery_list',
		//       path: '/purchase/delivery',
		//       component: './purchase/delivery',
		//       access: 'shipping_order_list',
		//     },
		//     {
		//       exact: true,
		//       // name: 'delivery_list',
		//       path: '/purchase/delivery/:id/:readOnly',
		//       component: './purchase/delivery',
		//       access: 'shipping_order_list',
		//     },
		//     {
		//       component: '404',
		//     },
		//   ],
		// },
		{ component: '404' },
	],
};
