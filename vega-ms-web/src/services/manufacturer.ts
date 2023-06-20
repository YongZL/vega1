// manufacturer-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/manufacturer/1.0';

/** GET /api/admin/manufacturer/1.0 获取生产厂家 */
export function getAllManufacturers<
	T = ResponseResult<ManufacturerAuthorizationsController.GetManufacturer[]>,
>() {
	return request.get<T>(`${PREFIX}`, {});
}

/** POST/api/admin/manufacturer/1.0 新增厂商 */
export function add<T = ResponseResult>(data: ManufacturerController.AddData) {
	return request.post<T>(`${PREFIX}`, { data });
}

/** GET/api/admin/manufacturer/1.0/listBySupplier 根据供应商id获取厂商列表 */
export function getSupplierList<T = ResponseResult>(params: { supplierId: number }) {
	return request.get<T>(`${PREFIX}/listBySupplier`, { params });
}

/** POST/api/admin/manufacturer/1.0/operate 启用/禁用 */
export function operate<T = ResponseResult>(data: { id: number; type: 1 | 2 }) {
	return request.post<T>(`${PREFIX}/operate`, { data });
}

/** GET/api/admin/manufacturer/1.0/pageList 分页获取厂商列表 */
export function getPageList<T = ResponseList<ManufacturerController.ManufacturerRecord>>(
	params: ManufacturerController.GetPageListParams,
) {
	return request.get<T>(`${PREFIX}/pageList`, { params });
}

/** GET/api/admin/manufacturer/1.0/{id} 根据id获取厂商详情 */
export function getDetail<T = ResponseResult<ManufacturerController.DetailRecord>>(id: number) {
	return request.get<T>(`${PREFIX}/${id}`);
}

/** POST/api/admin/manufacturer/1.0/{id} 更新厂商信息 */
export function edit<T = ResponseResult>(id: number, data: ManufacturerController.AddData) {
	return request.post<T>(`${PREFIX}/${id}`, { data });
}
