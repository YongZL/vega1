// pick-pending-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/pickPending/1.0';

/**  GET/api/admin/pickPending/1.0/storageAreaList 查询配货提示库房列表 */
export function getStorageAreaList<
	T = ResponseResult<PickPendingController.StorageAreaListRecord[]>,
>(params: { type: 'goods' | 'package_ordinary' }) {
	return request.get<T>(`${PREFIX}/storageAreaList`, { params });
}

/**  POST/api/admin/pickPending/1.0/cancel 取消待配货数据 */
export function queryCancel<T = ResponseResult>(data: { id: number }) {
	return request.post<T>(`${PREFIX}/cancel`, { data });
}

/**  GET/api/admin/pickPending/1.0/export 待配货导出 */
export const pickExport = `${PREFIX}/export`;

/**  GET/api/admin/pickPending/1.0/list 查询待配货列表 */
export function queryRule<T = ResponseResult>(params: PickPendingController.QueryRuleParams) {
	return request.get<T>(`${PREFIX}/list`, { params });
}
