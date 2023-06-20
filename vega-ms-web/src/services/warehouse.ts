// 仓库 warehouse-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/warehouses/1.0';

//GET '/api/admin/warehouses/1.0/pageList', // 获取仓库列表
export function getWarehouseList<T = ResponseResult<WarehouseController.WarehouseRecord>>(
	params: WarehouseController.WarehouseListParams,
) {
	return request<T>(`${PREFIX}/pageList`, { params });
}
//get '/api/admin/warehouses/1.0/getListByDepartment', // 根据科室查仓库列表
export function warehouseList<T = ResponseResult<WarehouseController.WarehouseRecord[]>>(
	params?: WarehouseController.WarehouseParams,
) {
	return request.get<T>(`${PREFIX}/getListByDepartment`, { params });
}

//GET '/api/admin/warehouses/1.0/{id}', // 获取仓库详情
export function getWarehouseDetail<T = ResponseResult<WarehouseController.WarehouseDetailItem>>(
	id: number,
) {
	return request<T>(`${PREFIX}/${id}`);
}

// POST/api/admin/warehouses/1.0 新增仓库
export function addWarehouse<T = ResponseResult>(data: WarehouseController.AddWarehouseParams) {
	return request.post<T>(`${PREFIX}`, { data });
}

// POST/api/admin/warehouses/1.0 编辑仓库
export function editWarehouse<T = ResponseResult>(data: WarehouseController.EditWarehouseParams) {
	return request.post<T>(`${PREFIX}/${data?.id}`, { data });
}

// GET/api/admin/warehouses/1.0/getByUser 根据当前用户查询用户部门下所有的仓库
export function getByUserWh<T = ResponseResult<WarehouseController.ByUserData[]>>(params: {
	excludeCentralWarehouse?: boolean;
	requestAddCentralWarehouse?: boolean;
}) {
	return request.get<T>(`${PREFIX}/getByUser`, { params });
}

/** GET/api/admin/warehouses/1.0/getByUser 根据当前用户查询用户部门下所有的仓库 */
export const getByUser = `${PREFIX}/getByUser`;

// GET/api/admin/warehouses/1.0/getCentralWarehouse 查询中心仓库
export function getCentralWarehouse<
	T = ResponseResult<WarehouseController.WarehouseRecord[]>,
	>() {
	return request<T>(`${PREFIX}/getCentralWarehouse`,);
}


/**  GET/api/admin/warehouses/1.0/getListByDepartmentIds 查询部门的仓库信息*/
export function getWarehouseListByIds<
	T = ResponseResult<WarehouseController.WarehouseRecord[]>,
	>(params: { departmentIds?: string }) {
	return request<T>(`${PREFIX}/getListByDepartmentIds`, { params });
}

// GET/api/admin/warehouses/1.0/getSummaryInfo 仓库货位汇总查询

// GET/api/admin/warehouses/1.0/getSummaryInfo/export 仓库货位汇总导出

// GET/api/admin/warehouses/1.0/groupList 推送组列表
export function getGroupList<T = ResponseResult<WarehouseController.GroupListItem[]>>() {
	return request<T>(`${PREFIX}/groupList`);
}

// POST/api/admin/warehouses/1.0/{id} Update warehouse info

// GETapi/admin/warehouses/1.0/getWarehouseFiled 获取仓库资料字段信息 */
export async function getWarehouseFiled<
	T = ResponseResult<WarehouseController.WarehouseFiled[]>,
	>() {
	return request<T>(`${PREFIX}/getWarehouseFiled`);
}
