// config-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/config/1.0';

// GET /api/admin/config/1.0/list 配置列表,可根据查询条件
export function getList<T = ResponseResult<ConfigController.Config[]>>(
	params: ConfigController.ConfigListParams = {},
) {
	return request<T>(`${PREFIX}/list`, { params });
}

// POST/api/admin/config/1.0/create 新增配置

// POST/api/admin/config/1.0/delete 根据配置id删除配置

// GET/api/admin/config/1.0/findOneConfig 根据指定条件获取对应配置
export function findConfig<T = ResponseResult<Record<string, any>>>(
	params = {
		module: 'system',
		name: 'delimiter',
		feature: 'udi',
	},
) {
	return request<T>(`${PREFIX}/findOneConfig`, { params });
}

// POST/api/admin/config/1.0/modify 根据配置id修改配置

// GET /api/admin/config/1.0/userTypeList 用户类型
export function getUserTypeList<T = ResponseResult<ConfigController.UserType[]>>() {
	return request<T>(`${PREFIX}/userTypeList`);
}
