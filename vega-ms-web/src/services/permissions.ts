import request from '@/utils/request';

const PREFIX = '/api/admin/permissions/1.0';

// GET /api/admin/permissions/1.0/getMenus/{hospitalId} 根据医院查询菜单
export async function getMenusByHospitalId<T = ResponseResult<PermissionsController.MenuItem[]>>(
	hospitalId: string | number,
) {
	return request<T>(`${PREFIX}/getMenus/${hospitalId}`);
}

// GET/api/admin/permissions/1.0/findByHospital/{hospitalId} 根据医院查询用户的权限
export async function getPermissionsById<T = ResponseResult<PermissionsController.Permission[]>>(
	id: string | number,
) {
	return request<T>(`${PREFIX}/findByHospital/${id}`);
}

// GET /api/admin/permissions/1.0 获取权限列表
export async function getPermissionsList<
	T = ResponseResult<PermissionsController.PermissionsRecord[]>,
>() {
	return request<T>(`${PREFIX}`);
}

// POST/api/admin/permissions/1.0 新增权限数据
export async function postAdd<T = ResponseResult>(params: PermissionsController.QueryPutUpdate) {
	return request<T>(`${PREFIX}`, {
		method: 'POST',
		data: {
			...params,
		},
	});
}
// GET/api/admin/permissions/1.0/getPermissionTree 查询菜单权限树
export async function queryPermissionTree<
	T = ResponseResult<PermissionsController.QueryPermissionTree[]>,
>() {
	return request.get<T>(`${PREFIX}`);
}
// GET/api/admin/permissions/1.0/reloadPermissionInterface 重新加载接口权限

// GET/api/admin/permissions/1.0/{id} 根据id获取权限详情
export async function getPermissionsListid<
	T = ResponseResult<PermissionsController.QuerygetPermissionsListid>,
>(id: string | number) {
	return request.get<T>(`${PREFIX}/${id}`);
}
// POST/api/admin/permissions/1.0/{id} 更新权限信息
export async function putUpdate<T = ResponseResult>(
	id: string | number,
	params: PermissionsController.QueryPutUpdate,
) {
	return request<T>(`${PREFIX}/${id}`, {
		method: 'POST',
		data: {
			...params,
		},
	});
}
