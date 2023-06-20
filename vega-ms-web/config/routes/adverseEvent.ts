export default {
	// name: 'adverseEvent',
	icon: null,
	path: '/adverseEvent/report',
	routes: [
		{
			exact: true,
			// name: 'adverseEvent',
			path: '/adverseEvent/report',
			component: './adverseEvent/index',
			access: 'adverse_event_report',
		},
		{
			// name: 'adverseEvent_add',
			path: '/adverseEvent/report/add',
			component: './adverseEvent/add',
			access: 'adverse_event_report_add',
		},
		{
			// name: 'adverseEvent_detail',
			path: '/adverseEvent/report/detail',
			component: './adverseEvent/add',
			access: 'adverse_event_report_detail',
		},
		{
			component: '404',
		},
	],
};
