// 盘库 InventoryController
import request from '@/utils/request';

const PREFIX = '/api/admin/inventory/1.0';

// GET/api/admin/inventory/1.0/createInventory 创建盘库信息和查询盘库详情
export function createInventory<T = ResponseList<InventoryController.FindInventoryRecord[]>>(
	params?: InventoryController.FindInventoryParams,
) {
	return request.get<T>(`${PREFIX}/createInventory`, { params });
}

// GET/api/admin/inventory/1.0/differenceRate 获取盘点差异记录
export function getDifferenceRateList<T = ResponseList<InventoryController.DifferenceRateRecord[]>>(
	params?: InventoryController.DifferenceRateParams,
) {
	return request.get<T>(`${PREFIX}/differenceRate`, { params });
}

// GET/api/admin/inventory/1.0/differenceRateDetail 获取盘点差异记录详情
export function getDifferenceRateDetail<
	T = ResponseResult<InventoryController.DifferenceRatdeDetailRecord[]>,
>(params?: InventoryController.DifferenceRatdeDetailParams) {
	return request.get<T>(`${PREFIX}/differenceRateDetail`, { params });
}

// GET/api/admin/inventory/1.0/findInventory 获取盘点记录
export function getList<T = ResponseList<InventoryController.FindInventoryRecord[]>>(
	params?: InventoryController.FindInventoryParams,
) {
	return request.get<T>(`${PREFIX}/findInventory`, { params });
}

// GET/api/admin/inventory/1.0/findInventoryDetail 获取盘点库存详情数据
export function getDetail<T = ResponseList<InventoryController.FindInventoryRecord[]>>(
	params?: InventoryController.FindInventoryDetialParams,
) {
	return request.get<T>(`${PREFIX}/findInventoryDetail`, { params });
}

// GET/api/admin/inventory/1.0/findThreeDept 获取三级库全部科室id和名称
export function getDepartmentList<T = ResponseResult<InventoryController.FindThreeDeptRecord[]>>() {
	return request.get<T>(`${PREFIX}/findThreeDept`, {});
}

// GET/api/admin/inventory/1.0/hasUnSubmit 查询是否有未提交盘库记录
export function hasUnSubmit<T = ResponseResult>(params?: { departmentId?: number }) {
	return request.get<T>(`${PREFIX}/hasUnSubmit`, { params });
}

// GET/api/admin/inventory/1.0/lastInventoryTime 获取指定科室上次盘点时间
export function getLastInventoryTime<T = ResponseResult>(params?: { departmentId?: number }) {
	return request.get<T>(`${PREFIX}/lastInventoryTime`, { params });
}

// POST/api/admin/inventory/1.0/saveInventory 保存盘库
export function saveInventoryList<T = ResponseResult>(
	params?: InventoryController.SubmitInventory,
) {
	return request.post<T>(`${PREFIX}/saveInventory`, { data: params });
}

// POST/api/admin/inventory/1.0/submitInventory 提交盘库
export function submitInventoryList<T = ResponseResult>(
	params?: InventoryController.SubmitInventory,
) {
	return request.post<T>(`${PREFIX}/submitInventory`, { data: params });
}
