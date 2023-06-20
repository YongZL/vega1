export default {
	// name: 'report_form',
	icon: 'icon-Reportform',
	path: '/report_form',
	routes: [
		{
			exact: true,
			path: '/report_form',
			redirect: '/report_form/material_use',
		},
		{
			// name: 'material_use',
			icon: null,
			path: '/report_form/material_use',
			component: './report_form/material_use',
			access: 'material_use',
		},
		{
			// name: 'purchase_statistics',
			icon: null,
			path: '/report_form/purchase_statistics',
			component: './report_form/purchase_statistics',
			access: 'purchase_statistics_view',
		},
		{
			// name: 'acceptance_statistics',
			icon: null,
			path: '/report_form/acceptance_statistics',
			component: './report_form/acceptance_statistics',
			access: 'acceptance_statistics_view',
		},
		{
			// name: 'return_statistics',
			icon: null,
			path: '/report_form/return_statistics',
			component: './report_form/return_statistics',
			access: 'return_statistics_view',
		},
	],
};
