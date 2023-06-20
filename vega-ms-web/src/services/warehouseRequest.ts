// warehouse-request-controller 入库业务
import request from '@/utils/request';

const PREFIX = '/api/admin/warehouseRequest/1.0';

// GET/api/admin/warehouseRequest/1.0/applyList 入库申请—列表查看
export function getApplyList<T = ResponseResult<WarehouseRequestController.WarehouseRequestRecord>>(
	params: WarehouseRequestController.WarehouseRequestParams,
) {
	return request<T>(`${PREFIX}/applyList`, { params });
}
