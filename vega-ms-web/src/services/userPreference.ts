// user-preference-controller
import request from '@/utils/requestNoHandler';

const PREFIX = '/api/admin/userPreference/1.0';

// GET/api/admin/userPreference/1.0/getAllPreferenceConfig 获取所有表格配置信息
export function getAllPreferenceConfig<T = ResponseResult<UserPreferenceController.Config[]>>() {
	return request<T>(`${PREFIX}/getAllPreferenceConfig`);
}

// POST/api/admin/userPreference/1.0/addOrUpdate 新增或者修改table信息
export function addOrUpdate<T = ResponseResult>(data: Record<string, any>) {
	return request.post<T>(`${PREFIX}/addOrUpdate`, { data });
}

// GET/api/admin/userPreference/1.0/getPreferenceByCode 查询table信息
export function getPreferenceByCode<T = ResponseResult>(params: Record<string, any>) {
	return request<T>(`${PREFIX}/getPreferenceByCode`, { params });
}
