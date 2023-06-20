import menuCN1 from '@/locales/zh-CN';
import type { ConnectState } from '@/models/connect';
import menuCN2 from '@/pages/exception/500/locales/zh-CN';
import { getMenusByHospitalId } from '@/services/permissions';
import { countTodoList } from '@/services/todo';
import type { MenuDataItem } from '@ant-design/pro-layout';
import { getMenuData, getPageTitle } from '@ant-design/pro-layout';
import type { IRoute } from '@umijs/core';
import zhCN0 from 'antd/es/locale/zh_CN';
import { isEqual, throttle } from 'lodash';
import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import {
	addLocale,
	connect,
	Dispatch,
	history,
	InitialState,
	useAccess,
	useIntl,
	useModel,
} from 'umi';
import getTodoCount from './statistics';
type MenuItem = PermissionsController.MenuItem;

const genMenuData = (menuData: MenuItem[] = []): MenuDataItem[] => {
	return menuData.map((item: MenuItem) => {
		const { icon, code, parentId, route, children } = item;
		return {
			key: code || `/${route}`,
			path: route || `/${code}`,
			icon: icon && !parentId ? icon.replace('icon', 'icon-') : null,
			name: route ? route.split('/').pop() : code.replace('/', ''),
			parentKeys: parentId ? ['/', `/${route?.split('/')[1]}`] : ['/'],
			children: children ? genMenuData(children) : [],
		};
	});
};

const loopMenus = (arr: IRoute[] = []) => {
	const data: IRoute[] = [];
	arr.forEach((item) => {
		if (item.routes) {
			data.concat(loopMenus(item.routes));
		}
		data.push(item);
	});
	return data;
};

const Layout: FC<{
	dispatch: Dispatch;
	permissions: string[];
	todoList: ConnectState['todoList'];
	settings: ConnectState['settings'];
	route: IRoute;
}> = ({ children, dispatch, todoList, settings, ...props }) => {
	const { initialState, setInitialState } = useModel('@@initialState');
	const { getFieldsMapping } = useModel('fieldsMapping');
	const [postCount, setPostCount] = useState<number>(0);
	const [errorCount, setErrorCount] = useState(0);
	const access = useAccess();
	const isLoaded = useRef<boolean>(false);
	const { formatMessage } = useIntl();
	//找出匹配的路由
	const comparison = (pathname: string[], route: string[]) => {
		let num = 0;
		route.forEach((item) => {
			if (item.includes(':')) {
				num++;
			}
		});
		//过滤掉路由后面的拼接参数
		return (
			pathname.slice(0, pathname.length - num).join('/') ===
			route.slice(0, route.length - num).join('/')
		);
	};

	useEffect(() => {
		// 获取基于系统/医院环境支持部分字段显示名d字全局管理字典
		getFieldsMapping();
	}, []);

	useEffect(() => {
		const routes = initialState?.routes;
		const menus = JSON.parse(sessionStorage.getItem('menus')!); //用于动态设置菜单名称和浏览器标签名称
		const accessName = JSON.parse(sessionStorage.getItem('accessName')!); //后端返回权限代码对应的名称、用于设置面包屑的名称
		const pathname = history.location.pathname.split('/').slice(1);
		let access = ''; //可以拿到所有页面的权限编码
		let menuKey = ''; //只能拿到功能型页面的权限编码
		let BreadcrumbList: string[] = [];
		//筛选出当前页面的权限代码
		routes?.forEach((item: { path: string[]; access: string }) => {
			if (comparison(pathname, item.path)) {
				access = item.access;
			}
		});
		//因为只需设置非菜单栏点击页面（也就是功能型页面）的浏览器标签标题，所以此步骤是为筛选出功能型页面的权限编码
		for (let key in menus) {
			if (key === access) {
				menuKey = key;
			}
		}
		//便利生成当前页面下的面包屑
		for (let key in accessName) {
			if (key.split('.').pop() === access) {
				const menuList: string[] = [];
				key.split('.').forEach((item, index) => {
					menuList.push(item);
					BreadcrumbList.push(accessName[menuList.join('.')]);
				});
			}
		}
		dispatch({
			type: 'global/setBreadcrumbList',
			payload: BreadcrumbList,
		});
		//设置非菜单栏点击页面（也就是功能型页面）的浏览器标签标题
		if (menuKey) {
			setTimeout(() => {
				document.title = menus[menuKey] + ` - ${initialState?.settings?.title}`;
			}, 0);
		}
	}, [history.location.pathname]);
	const getCountTodoList = useCallback(async () => {
		try {
			const res = await countTodoList();
			if (res.code === 0) {
				const todoData = getTodoCount(res.data);
				if (!isEqual(todoList, res.data)) {
					dispatch({
						type: 'todoList/setTodoList',
						payload: res.data,
					});
					setInitialState(
						(is) =>
							({
								...is,
								todoData,
							} as InitialState),
					);
				}
				if (errorCount) {
					setErrorCount(0);
				}
				setPostCount((val) => {
					return val > 100 ? 1 : val + 1;
				});
			}
		} catch (e) {
			if (errorCount < 15) {
				setErrorCount((val) => val + 1);
				setPostCount((val) => {
					return val > 100 ? 1 : val + 1;
				});
			}
		}
	}, [todoList, errorCount]);

	useEffect(() => {
		if (access.todo_list && !isLoaded.current) {
			isLoaded.current = true;
			getCountTodoList();
		}
	}, [access.todo_list]);

	useEffect(() => {
		if (API_NO_LOOP) {
			return;
		}
		if (postCount) {
			setTimeout(getCountTodoList, 3000);
		}
	}, [postCount]);

	useEffect(() => {
		// 设置节流
		const onResize = throttle(() => dispatch({ type: 'global/setScrollHeight' }), 100);
		const hospitalId = sessionStorage.getItem('hospital_id');
		const menuCN3 = JSON.parse(sessionStorage.getItem('menus')!);
		//动态添加国际化
		addLocale(
			'zh-CN',
			{
				...menuCN1,
				...menuCN2,
				...menuCN3,
			},
			{
				momentLocale: 'zh-cn',
				antd: zhCN0,
			},
		);
		const getMenus = async () => {
			try {
				const res = await getMenusByHospitalId(hospitalId as string);
				// const menuCN3 = {};
				if (res.code === 0) {
					const menus = genMenuData(res.data || []);
					setInitialState((is) => ({ ...is, menus } as InitialState));
				}
			} finally {
			}
		};
		getMenus();
		dispatch({ type: 'user/verifyLogin' });
		dispatch({ type: 'global/updateConfig' });
		dispatch({
			type: 'global/updataConfiguration',
			payload: {
				pageNum: 0,
				pageSize: 1000,
				hospitalId,
			},
		});

		// dispatch({
		//   type: 'permissions/fetchPermission',
		//   payload: hospitalId,
		// });

		window.addEventListener('resize', onResize);

		if (process.env.NODE_ENV === 'development') {
			window.onerror = function (errorMessage) {
				console.log('错误', errorMessage);
			};
		}

		return () => {
			setInitialState((is) => ({ ...is, menus: [] } as InitialState));

			window.removeEventListener('resize', onResize);
		};
	}, []);

	const { breadcrumb } = getMenuData(loopMenus(props.route.routes));

	const title = getPageTitle({
		pathname: location.pathname,
		formatMessage,
		breadcrumb,
		...settings,
		...props,
	});

	return (
		<>
			{/* @ts-ignore */}
			<HelmetProvider>
				{/* @ts-ignore */}
				<Helmet>
					<title>{title}</title>
					<meta
						name='description'
						content={title}
					/>
				</Helmet>
				{children}
			</HelmetProvider>
		</>
	);
};

export default connect(({ permissions, todoList, settings }: ConnectState) => ({
	permissions: permissions.permissions,
	todoList,
	settings,
}))(Layout);
