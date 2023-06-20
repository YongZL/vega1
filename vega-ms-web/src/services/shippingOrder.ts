// shipping-order-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/shippingOrder/1.0';

// POST/api/admin/shippingOrder/1.0/addShippingItems 添加配送商品

// GET/api/admin/shippingOrder/1.0/getShippingOrderDetail 查询配送单详情
export function queryDeliveryDetail<T = ResponseResult<ShippingOrderController.DetailData[]>>(
	params: ShippingOrderController.DetailParams,
) {
	return request.get<T>(`${PREFIX}/getShippingOrderDetail`, { params });
}

// GET/api/admin/shippingOrder/1.0/getShippingOrderGroup 查询配送单组
export function queryShippingGroup<T = ResponseResult<ShippingOrderController.GroupData>>(
	params: ShippingOrderController.GroupParams,
) {
	return request.get<T>(`${PREFIX}/getShippingOrderGroup`, { params });
}

// GET/api/admin/shippingOrder/1.0/getWithPage 条件分页查询配送单
export function queryDeliveryList<T = ResponseList<ShippingOrderController.WithPageListRecord[]>>(
	params: ShippingOrderController.WithPageListPager,
) {
	return request.get<T>(`${PREFIX}/getWithPage`, { params });
}

// GET/api/admin/shippingOrder/1.0/loadShippingData 加载制作配送单数据
export function queryShippingData<T = ResponseList<ShippingOrderController.ShippingData>>(
	params: ShippingOrderController.ShippingDataParams,
) {
	return request.get<T>(`${PREFIX}/loadShippingData`, { params });
}

// GET/api/admin/shippingOrder/1.0/loadShippingItems 查询配送单详情

// POST/api/admin/shippingOrder/1.0/makeShippingOrder 制作配送单
export function makeShippingOrder<T = ResponseResult<ShippingOrderController.MakeShippingData>>(
	data: ShippingOrderController.MakeShippingParams,
) {
	return request.post<T>(`${PREFIX}/makeShippingOrder`, { data });
}

// GET/api/admin/shippingOrder/1.0/printShippingOrder 打印配送单
export const printShippingOrderUrl = `${PREFIX}/printShippingOrder`;
export function printShippingOrder<T = ResponseResult<ShippingOrderController.PrintData>>(
	params: ShippingOrderController.PrintParams,
) {
	return request.get<T>(`${printShippingOrderUrl}`, { params });
}

// POST/api/admin/shippingOrder/1.0/regenerateCode/{id} 重新生成赋码
export function regenerateCode<T = ResponseResult>(id: number) {
	return request.post<T>(`${PREFIX}/regenerateCode/${id}`);
}

// POST/api/admin/shippingOrder/1.0/removeShippingItem 根据配送单id删除配送商品

// POST/api/admin/shippingOrder/1.0/removeShippingOrderItemByDataVersion 根据数据版本删除配送单商品

// GET/api/admin/shippingOrder/1.0/shippingCompleted 确认配送完成
export function shippingCompleted<T = ResponseResult>(code: string) {
	return request.get<T>(`${PREFIX}/shippingCompleted`, { params: { code } });
}

// POST/api/admin/shippingOrder/1.0/updateShippingOrder 编辑配送单
export function updateShippingOrder<T = ResponseResult>(
	data: ShippingOrderController.MakeShippingParams,
) {
	return request.post<T>(`${PREFIX}/updateShippingOrder`, { data });
}
// /api/admin/shippingOrder/1.0/downloadImportTemplate  下载模板
export function dowdownTemplate<T = ResponseResult>(purchaseOrderId: number) {
	return request<T>(`${PREFIX}/downloadImportTemplate`, { params: { purchaseOrderId } });
}

// /api/admin/shippingOrder/1.0/importExcel //上传excel
export const importExcelfile = `${PREFIX}/importExcel`;
