// processing-order-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/processingOrder/1.0';

// GET/api/admin/processingOrder/1.0/batchMakingOrdinary 批量制作医耗套包

/** POST/api/admin/processingOrder/1.0/generatePickingPendingOrder 生成配货单 */
export function submitPickUp<
	T = ResponseResult<ProcessingOrderController.SubmitPickUpRecord[]>,
>(data: { processingOrderId: (number | string)[]; type?: 'batch' }) {
	return request.post<T>(`${PREFIX}/generatePickingPendingOrder`, { data });
}

/** GET/api/admin/processingOrder/1.0/getOne 查询详情 */
export function getDetail<T = ResponseResult<ProcessingOrderController.GetDetailRecord>>(params: {
	processingOrderId: number | string;
}) {
	return request.get<T>(`${PREFIX}/getOne`, { params });
}

// GET/api/admin/processingOrder/1.0/getPackageSurgicalGoods 查询要加工的手术套包中的商品

/**  GET/api/admin/processingOrder/1.0/getWithPage 分页查询 */
export function getList<T = ResponseList<ProcessingOrderController.GetListRecord>>(
	params: ProcessingOrderController.GetListParams,
) {
	return request.get<T>(`${PREFIX}/getWithPage`, { params });
}

// GET/api/admin/processingOrder/1.0/loadPackageBulkDetails 加载定数包加工信息

// GET/api/admin/processingOrder/1.0/loadPackageBulkDetailsInOne 加载定数包加工信息(在一个列表中)

/** GET/api/admin/processingOrder/1.0/loadPackageOrdinaryDetailsInOne 加载医耗套包加工信息(在一个列表中) */
export function getOrderlDetail<
	T = ResponseResult<ProcessingOrderController.GetOrderlDetailRecord>,
>(params: { processingOrderId: number | string }) {
	return request.get<T>(`${PREFIX}/loadPackageOrdinaryDetailsInOne`, { params });
}

// GET/api/admin/processingOrder/1.0/loadSurgicalPkgBulkDetails 加载手术套包加工信息

// GET/api/admin/processingOrder/1.0/loadSurgicalPkgBulkDetailsInOne 加载手术套包加工信息(在一个列表中)

/**  GET/api/admin/processingOrder/1.0/loadUnpacked 查询未组包的配货单明细 */
export function unpackedList<
	T = ResponseResult<ProcessingOrderController.UnpackedListRecord[]>,
>(params: { processOrderId: number }) {
	return request.get<T>(`${PREFIX}/loadUnpacked`, { params });
}

/** POST/api/admin/processingOrder/1.0/makingPackageOrdinary 制作医耗套包 */
export function makingOrdinary<T = ResponseResult>(data: {
	ordinaryId: number;
	processingOrderId?: number;
}) {
	return request.post<T>(`${PREFIX}/makingPackageOrdinary`, { data });
}

/** POST/api/admin/processingOrder/1.0/makingProcessingOrder 制作加工单 */
export function add<T = ResponseResult>(data: ProcessingOrderController.AddData[]) {
	return request.post<T>(`${PREFIX}/makingProcessingOrder`, { data });
}

// POST/api/admin/processingOrder/1.0/makingSurgicalPkgBulk 制作手术套包

/** POST/api/admin/processingOrder/1.0/removeProcessingOrder/{processingOrderId} 删除加工单 */
export function deleteOrder<T = ResponseResult>(id: number) {
	return request.post<T>(`${PREFIX}/removeProcessingOrder/${id}`);
}
