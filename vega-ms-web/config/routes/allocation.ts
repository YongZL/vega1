export default {
	// name: 'allocation',
	icon: null,
	path: '/allocation',
	access: 'allocation_service',
	routes: [
		{
			exact: true,
			// name: 'allocation_handle',
			path: '/allocation/handle',
			component: './allocation/list/handle',
			access: 'allocation_handle',
			wrappers: ['@/wrappers/todoList/allocationSelect'],
		},
		{
			exact: true,
			// name: 'aallocation_handle_apply',
			path: '/allocation/handle/add',
			component: './allocation/add',
			access: 'allocation_handle_apply',
		},
		{
			exact: true,
			// name: 'allocation_list',
			path: '/allocation/query',
			component: './allocation/list',
			access: 'allocation_query',
		},
		{
			component: '404',
		},
	],
};
