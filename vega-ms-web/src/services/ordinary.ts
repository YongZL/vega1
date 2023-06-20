// 普耗包 ordinary-controller
import request from '@/utils/request';
const PREFIX = '/api/admin/ordinary/1.0';

// GET /api/admin/ordinary/1.0 条件分页查询普耗包
export function getOrdinary<T = ResponseList<OrdinaryController.OrdinaryList[]>>(
	params: OrdinaryController.GetOrdinary,
) {
	return request.get<T>(`${PREFIX}/list`, { params });
}

//GET  /api/admin/ordinary/1.0/list 后端没写
export function ordinaryList<T = ResponseList<OrdinaryController.OrdinaryQuer[]>>(
	params: OrdinaryController.QuerOrdinary,
) {
	return request.get<T>(`${PREFIX}/list`, { params });
}
// GET '/api/admin/ordinary/1.0/findPackageWarehouseLimits', //编辑回显
export function limitsOrdinary<T = ResponseResult<OrdinaryController.Ordinary_List[]>>(
	params: OrdinaryController.OrdinaryLimitsParams,
) {
	return request.get<T>(`${PREFIX}/findPackageWarehouseLimits`, { params });
}

// POST/api/admin/ordinary/1.0/addOrdinary addOrdinary
export function addOrdinary<T = ResponseResult>(data: OrdinaryController.AddOrdinaryParams) {
	return request.post<T>(`${PREFIX}/addOrdinary`, { data });
}
// POST/api/admin/ordinary/1.0/checkSame checkSame
export function checkSame<T = ResponseResult>(data: OrdinaryController.AddOrdinaryParams) {
	return request.post<T>(`${PREFIX}/checkSame`, { data });
}
// GET/api/admin/ordinary/1.0/details/{ordinaryId} details
export function getDetail<T = ResponseResult<OrdinaryController.GetDetailQuer>>(id?: number) {
	return request.get<T>(`${PREFIX}/details/${id}`);
}

// GET/api/admin/ordinary/1.0/export 导出医耗套包商品
export function Ordinaryexport<T = ResponseResult>() {
	return request.get<T>(`${PREFIX}/export`);
}
// POST/api/admin/ordinary/1.0/toEnabled toEnabled
export function EnableDisable<T = ResponseResult>(data: {
	ordinaryId?: string | object; //普耗包ID
	status?: string; //状态,true启用，false未启用
}) {
	return request.post<T>(`${PREFIX}/toEnabled`, { data });
}

// POST/api/admin/ordinary/1.0/upOrdinary upOrdinary
export function upOrdinary<T = ResponseResult>(data: OrdinaryController.AddOrdinaryParams) {
	return request.post<T>(`${PREFIX}/upOrdinary`, { data });
}
