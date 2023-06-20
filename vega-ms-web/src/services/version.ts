// version-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/version/1.0';

// GET /api/admin/version/1.0/version 获取当前git版本等信息
export function getVersion<T = ResponseResult<VersionController.VersionInfo>>() {
	return request<T>(`${PREFIX}/version`);
}

// GET /front-config/version.json 获取项目版本
export function projectVersion<T = ResponseResult>() {
	return request<T>('/front-config/version.json');
}
