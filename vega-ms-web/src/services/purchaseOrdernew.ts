// 采购业务 purchase-ordernew-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/purchaseOrdernew/1.0';

// GET/api/admin/purchaseOrdernew/1.0/getList 采购订单列表
export function getOrderList<T = ResponseList<PurchaseOrderNewController.ListRecord[]>>(
	params: PurchaseOrderNewController.ListPager,
) {
	return request.get<T>(`${PREFIX}/getList`, { params });
}

// GET/api/admin/purchaseOrdernew/1.0/details 订单详情接口
export function queryPurchaseOrderDetail<
	T = ResponseResult<PurchaseOrderNewController.DetailItem[]>,
>(params: PurchaseOrderNewController.DetailParams) {
	return request.get<T>(`${PREFIX}/details`, { params });
}

// POST/api/admin/purchaseOrdernew/1.0/distributorAcceptOrder 配送商业接收订单
export function distributorAcceptOrder<T = ResponseResult>(
	data: PurchaseOrderNewController.AcceptOrderParams,
) {
	return request.post<T>(`${PREFIX}/distributorAcceptOrder`, { data });
}

// GET/api/admin/purchaseOrdernew/1.0/getById 根据id获取订单信息
export function queryDetailById<T = ResponseResult<PurchaseOrderNewController.ListRecord>>(
	params: PurchaseOrderNewController.DetailParams,
) {
	return request.get<T>(`${PREFIX}/getById`, { params });
}

// GET/api/admin/purchaseOrdernew/1.0/getByIdAndMessageType 根据id获取订单消息

// POST/api/admin/purchaseOrdernew/1.0/finishOrder 结束订单
export function finishOrder<T = ResponseResult>(
	data: PurchaseOrderNewController.FinishOrderParams,
) {
	return request.post<T>(`${PREFIX}/finishOrder`, { data });
}

// GET/api/admin/purchaseOrdernew/1.0/export 采购订单导出
export const orderExportUrl = `${PREFIX}/export`;

// GET/api/admin/purchaseOrdernew/1.0/purchaseGoodsList 采购状态查询

// GET/api/admin/purchaseOrdernew/1.0/purchaseGoodsExport 采购状态导出
