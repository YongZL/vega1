export default {
	path: '/system',
	icon: 'icon-System',
	// name: 'system',
	routes: [
		{
			exact: true,
			path: '/system',
			redirect: '/system/permissions',
		},
		{
			// name: 'permissions',
			icon: null,
			path: '/system/permissions',
			routes: [
				{
					exact: true,
					path: '/system/permissions',
					redirect: '/system/permissions/role',
				},
				{
					// name: 'role',
					icon: null,
					path: '/system/permissions/role',
					routes: [
						{
							exact: true,
							// name: 'role_list',
							path: '/system/permissions/role',
							access: 'role',
							component: './system/permissions/role/list',
						},
						{
							exact: true,
							// name: 'user_operator',
							path: '/system/permissions/role/user/operator/:id',
							access: 'role_user',
							component: './system/permissions/role/operator/list',
						},
						{
							exact: true,
							// name: 'user_operator_detail',
							path: '/system/permissions/role/detail/:id',
							access: 'role_view',
							component: './system/permissions/role/operator/detail',
						},
						{ component: '404' },
					],
				},
				{
					// name: 'user',
					icon: null,
					path: '/system/permissions/user',
					routes: [
						{
							exact: true,
							// name: 'user',
							path: '/system/permissions/user',
							access: 'user',
							component: './system/permissions/user/list',
						},
						{
							// name: 'user_add',
							path: '/system/permissions/user/add',
							access: 'add_user',
							component: './system/permissions/user/add',
						},
						{
							// name: 'user_edit',
							path: '/system/permissions/user/edit/:id',
							access: 'edit_user',
							component: './system/permissions/user/add',
						},
						{
							// name: 'user_detail',
							path: '/system/permissions/user/detail/:id',
							access: 'user_view',
							component: './system/permissions/user/detail',
						},
						{ component: '404' },
					],
				},
				{
					// name: 'permission_manage',
					icon: null,
					path: '/system/permissions/permission_manage',
					component: './system/permissions/permission_manage',
					access: 'permission_manage',
				},
				{ component: '404' },
			],
		},
		{
			// name: 'activity_log',
			icon: null,
			path: '/system/activity_log',
			access: 'logs',
			component: './system/activity_log/list',
		},
		{ component: '404' },
	],
};
