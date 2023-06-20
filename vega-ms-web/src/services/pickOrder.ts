// 中心库拣货 Pick Order Controller
import request from '@/utils/request';

const PREFIX = '/api/admin/pickOrder/1.0';

/**  POST/api/admin/pickOrder/1.0/add 生成配货单*/
export function queryCreatPickOrder<T = ResponseResult>(
	data: PickOrderController.QueryCreatPickOrder,
) {
	return request.post<T>(`${PREFIX}/add`, { data });
}

/**  POST/api/admin/pickOrder/1.0/batchGeneratePickOrder 根据仓库批量生成配货单*/
export function queryPickOrderBatch<T = ResponseResult>(
	data: PickOrderController.QueryPickOrderBatch,
) {
	return request.post<T>(`${PREFIX}/batchGeneratePickOrder`, { data });
}
/** POST/api/admin/pickOrder/1.0/cancelPickOrder/{pickOrderId} 取消配货单 */
export function queryCancel<T = ResponseResult>(id: number) {
	return request.post<T>(`${PREFIX}/cancelPickOrder/${id}`);
}

// POST/api/admin/pickOrder/1.0/complete/{pickOrderId} 提前完成配货单

/** GET/api/admin/pickOrder/1.0/detail 查询配货单明细*/
export function queryDetail<T = ResponseResult<PickOrderController.QueryDetailRecord>>(params: {
	id: number;
}) {
	return request.get<T>(`${PREFIX}/detail`, { params });
}

// GET/api/admin/pickOrder/1.0/findOrdinaryItemByPickOrderId findOrdinaryItemByPickOrderId

/**  GET/api/admin/pickOrder/1.0/list 查询配货单列表*/
export function queryRule<T = ResponseResult<PickOrderController.QueryRuleRecord>>(
	params: PickOrderController.QueryRuleParams,
) {
	return request.get<T>(`${PREFIX}/list`, { params });
}

// POST/api/admin/pickOrder/1.0/pick 配货

/** GET/api/admin/pickOrder/1.0/printPickOrder 打印配货单*/
export const printPickOrder = `${PREFIX}/printPickOrder`;
