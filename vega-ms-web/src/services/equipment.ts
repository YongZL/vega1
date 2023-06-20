// equipment-controller
import request from '@/utils/request';

const RS_PREFIX = '/api/rs/equipment/1.0';

// GET/api/rs/equipment/1.0/pageList 获取设备列表
export async function getList<T = ResponseList<EquipmentController.EquipmentRecord>>(
	params: EquipmentController.PageListParams,
) {
	return request<T>(`${RS_PREFIX}/pageList`, { params });
}

// /api/rs/equipment/1.0/printEquipment 打印设备
export function printEquipment<T = ResponseResult<Record<string, any>[]>>(params: {
	equipmentId: number;
}) {
	return request<T>(`${RS_PREFIX}/printEquipment`, { params });
}

// POST/api/rs/equipment/1.0/add 新增设备
export async function equipmentAdd<T = ResponseResult>(data: EquipmentController.EditParams) {
	return request.post<T>(`${RS_PREFIX}/add`, { data });
}

// POST/api/rs/equipment/1.0/edit 修改设备
export async function equipmentEdit<T = ResponseResult>(data: EquipmentController.EditParams) {
	return request.post<T>(`${RS_PREFIX}/edit`, { data });
}

// POST/api/rs/equipment/1.0/updateEnabled 修改启用/禁用状态
export async function updateEnabled<T = ResponseResult>(data: {
	status: number;
	equipmentId: number;
}) {
	return request.post<T>(`${RS_PREFIX}/updateEnabled`, { data });
}
