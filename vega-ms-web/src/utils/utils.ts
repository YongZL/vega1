import { parse } from 'querystring';
import pathRegexp from 'path-to-regexp';
import { Route } from '@/models/connect';
import { createFromIconfontCN } from '@ant-design/icons';
import { isEmpty } from 'lodash';

/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg =
	/(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const isUrl = (path: string): boolean => reg.test(path);

export const getPageQuery = () => parse(window.location.href.split('?')[1]);

// export const getUrl = () =>
//   SERVER_ENV ? `${window.location.origin}${SERVER_ENV}` :`${window.location.origin}/server`;

// export const getUrl = () =>
//   SERVER_ENV ? `${window.location.origin}${SERVER_ENV}` :  `${window.location.origin}/server`;
//   // 'http://192.168.10.199:8383/server'

export const getUrl = () => `${window.location.origin}${SERVER_ENV || '/server'}`;

/**
 * iconfont自定义图标
 */
export const LocalIcon = createFromIconfontCN({
	scriptUrl: PATH_ENV ? `${PATH_ENV}font/iconfont.js` : '/font/iconfont.js',
});

/**
 * props.route.routes
 * @param router [{}]
 * @param pathname string
 */
export const getAuthorityFromRouter = <T extends Route>(
	router: T[] = [],
	pathname: string,
): T | undefined => {
	const authority = router.find(
		({ routes, path = '/' }) =>
			(path && pathRegexp(path).exec(pathname)) ||
			(routes && getAuthorityFromRouter(routes, pathname)),
	);
	if (authority) return authority;
	return undefined;
};

export const getRouteAuthority = (path: string, routeData: Route[]) => {
	let authorities: string[] | string | undefined;
	routeData.forEach((route) => {
		// match prefix
		if (pathRegexp(`${route.path}/(.*)`).test(`${path}/`)) {
			if (route.authority) {
				authorities = route.authority;
			}
			// exact match
			if (route.path === path) {
				authorities = route.authority || authorities;
			}
			// get children authority recursively
			if (route.routes) {
				authorities = getRouteAuthority(path, route.routes) || authorities;
			}
		}
	});
	return authorities;
};

export const preProcessData = (obj: any) => {
	let newData = {};
	for (let key in obj) {
		if (obj[key] && obj[key].toString().replace(/(^\s*)|(\s*$)/g, '') !== '') {
			newData[key] = obj[key];
		}
	}
	return newData;
};
