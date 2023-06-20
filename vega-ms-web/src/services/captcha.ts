// captcha-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/captcha/1.0';

// GET /api/admin/captcha/1.0/check 校验验证码
export function checkCaptchaCode<T = ResponseResult>(params: { captchaCode: string }) {
	return request<T>(`${PREFIX}/check`, { params });
}

// GET /api/admin/captcha/1.0/get 获取图形验证码
export function getCaptchaCode<T = ResponseResult<string>>() {
	return request<T>(`${PREFIX}/get`);
}
