//角色：Role Controller
import request from '@/utils/request';

const PREFIX = '/api/admin/role/1.0';

//GET /api/admin/role/1.0/pageList 角色列表
export function getRoleList<T = ResponseList<RoleController.RoleRecord>>(
	params: RoleController.RoleListParams,
) {
	return request<T>(`${PREFIX}/pageList`, { params });
}

//启用/禁用 POST /api/admin/role/1.0/operate
export function operate(data: RoleController.EnableParams) {
	return request.post(`${PREFIX}/operate`, { data });
}

//新增角色 POST /api/admin/role/1.0
export function addRole(data: RoleController.AddRoleParams) {
	return request.post(`${PREFIX}`, { data });
}

//编辑角色 POST /api/admin/role/1.0/{id}
export function editRole(id: number | string, data: RoleController.AddRoleParams) {
	return request.post(`${PREFIX}/${id}`, { data });
}

//查询详情 GET /api/admin/role/1.0/{id}
export function getDetail<T = ResponseResult<RoleController.RoleRecord>>(id: number) {
	return request<T>(`${PREFIX}/${id}`);
}
