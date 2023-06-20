/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 *
 *
 * 处理不需弹窗提示错误的请求
 */
import { extend } from 'umi-request';
import { history } from 'umi';
import qs from 'qs';

/**
 * 异常处理程序
 */
const errorHandler = (error: { response: Response }): Response => {
	const { response } = error;
	return response;
};

/**
 * 配置request请求时的默认参数
 */
const request = extend({
	errorHandler,
	credentials: 'include', // 默认请求是否带上cookie
	paramsSerializer: (params) => {
		// 处理数组
		return qs.stringify(params, {
			arrayFormat: 'indices',
			allowDots: true,
		});
	},
	prefix: SERVER_ENV || '/server',
});

// const urls = [
//   '/server/api/admin/preference/1.0/addOrUpdate',
//   '/server/api/admin/preference/1.0/getPreferenceByCode',
//   '/server/api/admin/preference/1.0/getAllPreferenceConfig',
// ];

// request拦截器, 改变url 或 options.
request.interceptors.request.use((url, options) => {
	// if (urls.includes(url)) {
	//   url = `http://192.168.10.32:8181${url.replace('/server', '')}`;
	// }
	options.headers = {
		...options.headers,
		HospitalId: sessionStorage.getItem('hospital_id') || '',
		'X-AUTH-TOKEN': sessionStorage.getItem('x_auth_token') || '',
	};
	return {
		// url,
		options: { ...options, interceptors: true },
	};
});

request.interceptors.response.use(async (response) => {
	const xAuthToken = response.headers.get('x-auth-token');
	if (xAuthToken) {
		sessionStorage.setItem('x_auth_token', xAuthToken);
	}
	const data = await response.clone().json();
	if (data.code === 3) {
		const urlParams = new URL(window.location.href);
		if (urlParams.href.indexOf('redirect') < 0) {
			history.push(`/user/login?redirect=${urlParams.pathname}`);
		}
		return response;
	}
	return response;
});

export default request;
