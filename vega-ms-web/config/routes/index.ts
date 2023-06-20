import system from './system';
import baseData from './baseData';
import purchase from './purchase';
import repository from './repository';
import department from './department';
import stock from './stock';
import finance from './finance';
import summary from './summary';
// import reportForm from './reportForm';
import threeStock from './threeStock';
import adverseEvent from './adverseEvent';
import allocation from './allocation';
import consume from './consume';

// const authPath = '@/wrappers/auth';
// function addAuthWrappers(routes: Record<string, any>[]) {
//   return routes.map(item => {
//     const { component, wrappers, routes } = item;
//     if (component) {
//       if (wrappers?.length > 0) {
//         item.wrappers = [authPath, ...item.wrappers];
//       } else {
//         item.wrappers = [authPath];
//       }
//     }

//     if (routes?.length > 0) {
//       item.routes = addAuthWrappers(routes);
//     }
//     return { ...item };
//   });
// }

// layout 页面的路由
const layoutRoutes = [
	{
		exact: true,
		path: '/home',
		redirect: '/home/todo_list',
	},
	{
		path: '/account',
		routes: [
			{
				exact: true,
				// name: 'changePassword',
				path: '/account/changePassword',
				component: './account/changePassword',
			},
		],
	},
	{
		path: '/home',
		// name: 'home',
		icon: 'icon-Dashboard',
		routes: [
			{
				exact: true,
				// name: 'todo_list',
				path: '/home/todo_list',
				component: './home/todoList',
			},
			{ component: '404' },
		],
	},
	system,
	baseData,
	purchase,
	repository,
	department,
	stock,
	finance,
	summary,
	// reportForm,
	consume,
	{
		path: '/message_list',
		// name: 'message_list',
		component: './messageList',
		access: 'message_list',
	},
	{
		path: '/my_center/updatePwd',
		component: './exception/500',
	},
	{
		path: '/global_search',
		component: './global_search',
		access: 'global_search',
	},
	{
		path: '/search_doctor/:id',
		component: './global_search/doctor',
		access: 'search_doctor',
	},
	{
		path: '/search_patient/:id',
		component: './global_search/patient',
		access: 'search_patient',
	},
	threeStock,
	adverseEvent,
	allocation,
	{
		component: '404',
	},
];

// const routes = addAuthWrappers(layoutRoutes);
const routes = layoutRoutes;

export { routes };

export default [
	{
		path: '/',
		redirect: '/user',
	},
	{
		path: '/user',
		component: '../layouts/UserLayout',
		layout: false,
		routes: [
			{
				path: '/user',
				redirect: '/user/login',
			},
			{
				name: 'login',
				path: '/user/login',
				component: './user/login',
			},
			{
				name: 'hospital',
				path: '/user/hospital',
				component: './user/hospital',
			},
			{
				name: 'about',
				path: '/user/about',
				component: './user/about',
			},
			{
				component: '404',
			},
		],
	},
	{
		path: '/',
		component: '../layouts/index',
		routes,
	},
	{
		component: '404',
	},
];
