import logo from '@/assets/images/logo.png';
import RightContent from '@/components/GlobalHeader/RightContent';
import { MenuModelState } from '@/models/menus';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import type {
	BasicLayoutProps as ProLayoutProps,
	MenuDataItem,
	Settings as LayoutSettings,
} from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import { CoverageDetail, CoverageSummary } from 'istanbul-coverage-display';
import type { ReactNode } from 'react';
import React from 'react';
import { history, RunTimeLayoutConfig } from 'umi';
import defaultSettings from '../config/defaultSettings';
import Footer from './components/Footer';
import { loginPath, mainOutPages } from './config';
import { getUrl } from './utils/utils';
import summaryPages from '@/pages/summary/summaryPages';
import page404 from '@/pages/404';
if (!PATH_ENV) {
	import('istanbul-coverage-display/dist/bundle.css');
}
import { size } from '../config/configLess';
import classNames from 'classnames';
import { getAllStatistic } from './services/statistic';
let routeList: Record<string, any>[] = [];
const mapRoutes = (routes: Record<string, any>[]) => {
	const routeList: { path: string[]; access: string }[] = [];
	const routesMap = (route: Record<string, any>[]) => {
		route.forEach((item) => {
			if (item.access && item.component) {
				routeList.push({ path: item.path.split('/').slice(1), access: item.access });
			}
			if (item.routes) {
				routesMap(item.routes);
			}
		});
	};
	routesMap(routes);
	return routeList;
};
export interface BasicLayoutProps extends ProLayoutProps {
	breadcrumbNameMap: {
		[path: string]: MenuDataItem;
	};
	route: ProLayoutProps['route'] & {
		authority: string[];
	};
	settings: LayoutSettings;
	menus?: MenuModelState;
}

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
	loading: <PageLoading />,
};

export declare interface InitialState {
	settings?: Partial<LayoutSettings>;
	loading?: boolean;
	collapsed?: boolean;
	menus?: MenuDataItem[];
	todoData: Record<string, number>;
	permissions: string[];
	routes: { path: string[]; access: string }[];
}

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<InitialState> {
	let permissions = [];
	try {
		const { pathname } = history.location;
		if (!mainOutPages.includes(pathname)) {
			permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
		}
	} catch (e) {}
	return {
		settings: defaultSettings,
		collapsed: false,
		menus: [],
		todoData: {},
		permissions,
		routes: mapRoutes(routeList),
	};
}
let RequestRoutes: string[] = [];
// 动态追加路由
export function patchRoutes({ routes }: { routes: Record<string, any>[] }) {
	const routesAdd = (routes: Record<string, any>[]) => {
		for (let i = 0; i < routes.length; i++) {
			// 目前只对报表工具页面动态生成路由
			if (routes[i].path === '/summary') {
				RequestRoutes.forEach((item) => {
					routes[i].routes.push({
						exact: true,
						path: '/summary/' + item,
						component: summaryPages,
						access: item,
					});
				});
				routes[i].routes.push({ component: page404 });
				break;
			}
			if (routes[i].routes) {
				routesAdd(routes[i].routes);
			}
		}
	};
	routesAdd(routes);
	routeList = routes;
}
export async function render(oldRender: () => void) {
	try {
		// 报表工具页面路由获取
		const res = await getAllStatistic();
		if (res.code === 0) {
			RequestRoutes = res.data.map((item) => item.code);
		}
	} finally {
		oldRender();
	}
}
const menuStyle = (v1: boolean, v2: boolean | React.ReactNode, v3: boolean) => {
	return {
		paddingLeft: v1 ? 14 : '',
		fontWeight: v2 ? '500' : '',
		color: v3 ? CONFIG_LESS['@c_starus_warning'] : '',
	};
};

const envName = () => {
	let content = '研发出品';
	switch (WEB_PLATFORM) {
		case 'RS':
			content = '试剂';
			break;
		case 'MS':
			content = '研发出品';
			break;
		case 'DS':
			content = '药品';
			break;
	}
	return <span className={WEB_PLATFORM !== 'MS' ? 'env-name' : 'produce-name'}>{content}</span>;
};

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
	// const hospitalName = sessionStorage.getItem('hospital_name') || '';
	const hospitalLogo = sessionStorage.getItem('hospital_logo');
	const systemConfig = JSON.parse(sessionStorage.getItem('newDictionary') || '{}')['system_config'];
	const iconLogo = systemConfig && systemConfig.length && `${getUrl()}${systemConfig[0].value}`;

	// const index = hospitalName.lastIndexOf('(');
	// const nameOne = hospitalName.substring(0, index);
	// const nameTwo = hospitalName.substring(index, hospitalName.length);

	const dealMenu = (key: string) => {
		const count = initialState?.todoData[key];
		return {
			isAddColor: (count as number) > 0,
			isCount: typeof count === 'number',
			countContent: `(${count})`,
		};
	};
	//切换二级菜单删除本地保存的查询条件
	const removeSearchParams = () => {
		setTimeout(() => sessionStorage.removeItem('searchParams'), 0);
	};
	return {
		rightContentRender: () => <RightContent />,
		disableContentMargin: false,
		// waterMarkProps: {
		//   content: initialState?.currentUser?.name,
		// },
		footerRender: () => <Footer />,
		onPageChange: (props) => {
			const pathname = (props || {}).pathname || '';
			const token = sessionStorage.getItem('x_auth_token');
			// 如果没有登录，重定向到 login
			if ((!mainOutPages.includes(pathname) || pathname === '/user/hospital') && !token) {
				history.push(loginPath);
			}
		},
		// 自定义 403 页面
		// unAccessible: <div>unAccessible</div>,
		// 增加一个 loading 的状态
		childrenRender: (children) => {
			const isUserPage = history.location.pathname.startsWith('/user');
			const showCoverage = !isUserPage && !PATH_ENV && IS_DEV_ENV;
			return (
				<>
					{isUserPage ? children : <div className='ant-layout-custom-content-cls'>{children}</div>}
					{showCoverage && <CoverageDetail />}
					{showCoverage && <CoverageSummary />}
				</>
			);
		},

		collapsedButtonRender: false,
		headerHeight: 64,
		siderWidth: size && size > 14 ? 220 + 6 * (size - 14) : 220,
		headerContentRender: () => (
			<span
				className='ant-pro-global-header-trigger'
				onClick={() =>
					setInitialState(
						(is) =>
							({
								...is,
								collapsed: !initialState?.collapsed,
							} as InitialState),
					)
				}>
				{initialState?.collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
			</span>
		),
		logo,
		menuHeaderRender: (logoDom: ReactNode, titleDom: ReactNode) => (
			<>
				<a
					className='logo-icons'
					onClick={(e) => {
						e.stopPropagation();
						history.push({ pathname: '/home' });
					}}>
					{hospitalLogo ? (
						<img
							src={hospitalLogo}
							alt='logo'
							className={initialState?.collapsed ? 'changeImg' : ''}
						/>
					) : (
						logoDom
					)}
					{/* {!initialState?.collapsed && hospitalName ? (
            <>
              <h5>{nameOne}</h5>
              <h3 className="nameTwo">{nameTwo}</h3>
            </>
          ) : (
            titleDom
          )} */}
				</a>
				{/* 谱慧医疗研发出品 */}
				{!initialState?.collapsed && (
					<div
						className='logo-brand'
						onClick={(e) => e.stopPropagation()}>
						<img
							src={iconLogo}
							alt=''
						/>
						{envName()}
					</div>
				)}
			</>
		),
		subMenuItemRender: (itemProps: Record<string, any>, dom: ReactNode) => {
			const { isAddColor, isCount, countContent } = dealMenu(itemProps.key);

			const { parentKeys = [] } = itemProps;
			return (
				<span
					style={menuStyle(parentKeys.length > 1, parentKeys.length === 1, isAddColor)}
					className='menuItem'>
					<>
						{dom} {isCount && countContent}
					</>
				</span>
			);
		},
		menuItemRender: (menuItemProps: Record<string, any>, defaultDom: ReactNode) => {
			const { isUrl, children, path, icon, key } = menuItemProps;
			const { isAddColor, isCount, countContent } = dealMenu(key);
			if (isUrl || children || !path) {
				return defaultDom;
			}
			return (
				<a
					onClick={() => {
						removeSearchParams();
						history.push({ pathname: path, state: { isMenu: true } }); //isMenu是为了解决从全局搜索或二级页面跳转至页面也会弹todolist弹窗的问题，就可以区分是点击菜单跳转的页面，还是另外操作跳转的。
					}}
					style={menuStyle(!icon, icon, isAddColor)}
					className='menuItem'>
					<>
						{defaultDom} {isCount && countContent}
					</>
				</a>
			);
		},
		breadcrumbRender: (routers = []) => {
			return [...routers];
		},
		menuDataRender: () => initialState?.menus as MenuDataItem[],
		className: classNames(
			'ant-layout-symbol-cls',
			initialState?.collapsed ? 'ant-layout__collapsed' : '',
		),
		...initialState?.settings,
		collapsed: initialState?.collapsed,
		menuProps: {
			inlineIndent: 24, //控制一级菜单padding-left
		},
	};
};
