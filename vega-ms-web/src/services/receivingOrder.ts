// receiving-order-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/receivingOrder/1.0';

// GET/api/admin/receivingOrder/1.0/getReceivingWithPage 列表查询
export function getPageList<T = ResponseList<ReceivingOrderController.ListRecord[]>>(
	params: ReceivingOrderController.TableListPager,
) {
	return request.get<T>(`${PREFIX}/getReceivingWithPage`, { params });
}

// GET/api/admin/receivingOrder/1.0/countReceivingDetail 统计验收单信息
export function getOrderCount<T = ResponseResult<ReceivingOrderController.CountReceivingDetail>>(
	receivingOrderId: number,
) {
	return request.get<T>(`${PREFIX}/countReceivingDetail`, { params: { receivingOrderId } });
}

// POST/api/admin/receivingOrder/1.0/doBatchPass 批量操作
export function doBatchPass<T = ResponseResult>(data: ReceivingOrderController.BatchPassParams) {
	return request.post<T>(`${PREFIX}/doBatchPass`, { data });
}

// GET/api/admin/receivingOrder/1.0/getReceivedDetails 获取已验收信息

// GET/api/admin/receivingOrder/1.0/getReceivingDetails 获取待验收信息

// GET/api/admin/receivingOrder/1.0/getReceivingOrder 获取验收单

// GET/api/admin/receivingOrder/1.0/getReceivingPdaDetail 扫描GS1或物资条码查询未验收实例

// GET/api/admin/receivingOrder/1.0/getReceivingSummaryInfo 耗材验收汇总查询

// GET/api/admin/receivingOrder/1.0/getReceivingSummaryInfo/export 耗材验收汇总查询导出

// GET/api/admin/receivingOrder/1.0/loadBarcodeControlledInfo 加载赋码打印数据
export function queryLoadCodeInfo<T = ResponseResult<ReceivingOrderController.DetailData>>(
	params: ReceivingOrderController.LoadCodeParams,
) {
	return request.get<T>(`${PREFIX}/loadBarcodeControlledInfo`, { params });
}

// GET/api/admin/receivingOrder/1.0/loadReceiving 获取验收信息
export function queryDetail<T = ResponseResult<ReceivingOrderController.DetailData>>(params: {
	receivingOrderId?: number;
}) {
	return request.get<T>(`${PREFIX}/loadReceiving`, { params });
}

// POST/api/admin/receivingOrder/1.0/makeConclusion 验收单审结
export function queryMakeConclusion<T = ResponseResult>(receivingOrderId?: number) {
	return request.post<T>(`${PREFIX}/makeConclusion`, { data: { receivingOrderId } });
}

// POST/api/admin/receivingOrder/1.0/pass 通过
export function queryPass<T = ResponseResult>(data: ReceivingOrderController.PassOrRejectParams) {
	return request.post<T>(`${PREFIX}/pass`, { data });
}

// /api/admin/receivingOrder/1.0/scanCodePass UDI扫码验收
export function scanCodePass<T = ResponseResult<ReceivingOrderController.ScanCodePassRecord>>(
	data: ReceivingOrderController.ScanCodePassData,
) {
	return request.post<T>(`${PREFIX}/scanCodePass`, { data });
}

// GET/api/admin/receivingOrder/1.0/printReceivingOrder 打印验收单
export const printReceivingOrder = `${PREFIX}/printReceivingOrder`;

// POST/api/admin/receivingOrder/1.0/reject 拒收
export function queryReject<T = ResponseResult>(data: ReceivingOrderController.PassOrRejectParams) {
	return request.post<T>(`${PREFIX}/reject`, { data });
}

// POST/api/admin/receivingOrder/1.0/revert 撤销
export function queryRevert<T = ResponseResult>(data: ReceivingOrderController.PassOrRejectParams) {
	return request.post<T>(`${PREFIX}/revert`, { data });
}

// POST/api/admin/receivingOrder/1.0/setWarehouse 选择仓库

/* GET/api/admin/receivingOrder/1.0/loadBarcodeControlledList 获取验收通过物资 */
export function loadBarcodeControlledList<
	T = ResponseResult<ReceivingOrderController.DetailGoodsList[]>,
>(params: { receivingOrderId?: number }) {
	return request.get<T>(`${PREFIX}/loadBarcodeControlledList`, { params });
}

// POST /api/admin/receivingOrder/1.0/updateInvoiceCode 修改验收单发票编号
export function updateInvoiceCode<T = ResponseResult>(
	params: ReceivingOrderController.UpdateInvoiceCode,
) {
	return request.post<T>(`${PREFIX}/updateInvoiceCode`, { params });
}

// POST /api/admin/receivingOrder/1.0/updateAmbivalentPlatformOrder 修改两定平台订单
export function updateAmbivalentPlatformOrder<T = ResponseResult>(
	params: ReceivingOrderController.UpdateAmbivalentPlatformOrder,
) {
	return request.post<T>(`${PREFIX}/updateAmbivalentPlatformOrder`, { params });
}
