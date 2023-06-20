// login-web-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/login/web/1.0';

// POST /api/admin/login/web/1.0/login 登录
export function login<T = ResponseResult<LoginWebController.User>>(
	data: LoginWebController.LoginParams,
) {
	return request.post<T>(`${PREFIX}/login`, {
		data,
		requestType: 'form',
	});
}

// POST /api/admin/login/web/1.0/logout 登出
export function logout<T = ResponseResult>() {
	return request.post<T>(`${PREFIX}/logout`);
}

// POST /api/admin/login/web/1.0/verify_login 判断是否已登录
export function verifyLogin<T = ResponseResult<LoginWebController.User>>(data?: {
	hospitalId: string | number;
}) {
	return request.post<T>(`${PREFIX}/verify_login`, {
		requestType: 'form',
		data,
	});
}
