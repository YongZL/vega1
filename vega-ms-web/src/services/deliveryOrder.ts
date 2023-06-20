// 推送单 delivery-order-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/deliveryOrder/1.0';

/** POST/api/admin/deliveryOrder/1.0/batchCheck 批量复核推送单*/
export function queryBatchCheck<T = ResponseResult>(
	data: DeliveryOrderController.QueryBatchCheckData,
) {
	return request.post<T>(`${PREFIX}/batchCheck`, { data });
}

/** POST/api/admin/deliveryOrder/1.0/check 推送单复核 */
export function queryCheck<T = ResponseResult>(data: DeliveryOrderController.QueryCheckData) {
	return request.post<T>(`${PREFIX}/check`, { data });
}

/** GET/api/admin/deliveryOrder/1.0/detail 查询推送单明细 */
export function queryDetail<T = ResponseResult<DeliveryOrderController.QueryDetailRecord>>(params: {
	deliveryId: number;
}) {
	return request.get<T>(`${PREFIX}/detail`, { params });
}

/** GET/api/admin/deliveryOrder/1.0/export 推送单导出 */
export const exportDeliveryOrder = `${PREFIX}/export`;

/**  GET/api/admin/deliveryOrder/1.0/list 查询推送单列表 */
export function queryRule<T = ResponseResult<DeliveryOrderController.QueryRuleRecord[]>>(
	params: DeliveryOrderController.QueryRuleParams,
) {
	return request.get<T>(`${PREFIX}/list`, { params });
}

/** GET/api/admin/deliveryOrder/1.0/printDeliveryOrder 打印推送单 */
export const printDeliveryOrder = `${PREFIX}/printDeliveryOrder`;

/** POST/api/admin/deliveryOrder/1.0/setPusher 选择推送人 */
export function querySetPusher<T = ResponseResult>(
	data: DeliveryOrderController.QuerySetPusherData,
) {
	return request.post<T>(`${PREFIX}/setPusher`, { data });
}

// POST/api/admin/deliveryOrder/1.0/uncheck 推送单撤销复核
export function queryUnCheck<T = ResponseResult>(data: DeliveryOrderController.QueryUnCheckData) {
	return request.post<T>(`${PREFIX}/uncheck`, { data });
}
// POST/api/admin/deliveryOrder/1.0/editDeliveryOrderPrintStatus/{deliveryId}  修改推送单打印状态
export function editDeliveryOrderPrintStatus<T = ResponseResult>(deliveryId: number) {
	return request.post<T>(`${PREFIX}/editDeliveryOrderPrintStatus/${deliveryId}`);
}
