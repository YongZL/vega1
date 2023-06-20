// 采购业务 purchase-order-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/purchaseOrder/1.0';

// GET/api/admin/purchaseOrder/1.0/getSurgicalOrderInfos', // 根据订单获取手术信息
export function getSurgicalInfo<T = ResponseResult<PurchaseOrderController.SurgicalOrderData>>(
	params: PurchaseOrderController.SurgicalOrderParams,
) {
	return request.get<T>(`${PREFIX}/getSurgicalOrderInfos`, { params });
}
