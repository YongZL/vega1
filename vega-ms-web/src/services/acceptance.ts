// 科室验收 acceptance-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/acceptance/1.0';

// GET /api/admin/acceptance/1.0/querylist 入库处理/入库查询
export function queryRule<T = ResponseList<AcceptanceController.ListRecord>>(
	params: AcceptanceController.ListParams,
) {
	return request.get<T>(`${PREFIX}/querylist`, { params });
}

// POST/api/admin/acceptance/1.0/check 验收
export function queryCheck<T = ResponseResult>(params?: AcceptanceController.Check) {
	return request.post<T>(`${PREFIX}/check`, { data: params });
}

// POST/api/admin/acceptance/1.0/checkOneItem 单个验收
export function queryCheckOneItem<T = ResponseResult<AcceptanceController.AcceptanceDetail[]>>(
	params: AcceptanceController.CheckOneItem,
) {
	return request.post<T>(`${PREFIX}/checkOneItem`, { data: params });
}

// GET/api/admin/acceptance/1.0/detail 验收单明细
export function queryDetail<T = ResponseResult<AcceptanceController.AcceptanceDetail>>(params: {
	acceptanceOrderId?: number;
}) {
	//验收单id
	return request.get<T>(`${PREFIX}/detail`, { params });
}

// GET/api/admin/acceptance/1.0/findAcceptor findAcceptor
export function queracceptancemh<T = ResponseResult<AcceptanceController.Acceptor[]>>(params: {
	userName?: string;
}) {
	//验收人真实名称
	return request.get<T>(`${PREFIX}/findAcceptor`, { params });
}

// GET/api/admin/acceptance/1.0/list 科室验收单

// GET/api/admin/acceptance/1.0/printDetail 打印验收单

// POST/api/admin/acceptance/1.0/submitOrder 验收完成
export function querySubmitOrder<T = ResponseResult>(params: { id?: number }) {
	return request.post<T>(`${PREFIX}/submitOrder`, { data: params });
}

// POST/api/admin/acceptance/1.0/uncheck 取消验收
export function queryUncheck<T = ResponseResult>(params: AcceptanceController.UnCheck) {
	return request.post<T>(`${PREFIX}/uncheck`, { data: params });
}
