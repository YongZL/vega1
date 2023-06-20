// 采购业务 purchasenew-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/purchasenew/1.0';

// GET/api/admin/purchasenew/1.0/getWithPage 条件分页查询采购计划
export function queryPurchasePlanList<T = ResponseList<PurchaseNewController.WithPageListRecord[]>>(
	params: PurchaseNewController.WithPageListPager,
) {
	return request.get<T>(`${PREFIX}/getWithPage`, { params });
}

// POST/api/admin/purchasenew/1.0/addPurchasePlan 添加采购计划
export function addPurchasePlan<T = ResponseResult>(data: PurchaseNewController.AddPlanParams) {
	return request.post<T>(`${PREFIX}/addPurchasePlan`, { data });
}

// GET/api/admin/purchasenew/1.0/getOne 采购计划详情
export function queryPurchasePlanDetail<T = ResponseResult<PurchaseNewController.DetailData>>(
	params: PurchaseNewController.DetailParams,
) {
	return request.get<T>(`${PREFIX}/getOne`, { params });
}

// POST/api/admin/purchasenew/1.0/doCommit 提交接口
export function postDoCommit<T = ResponseResult>(data: PurchaseNewController.CommitParams) {
	return request.post<T>(`${PREFIX}/doCommit`, { data });
}

// POST/api/admin/purchasenew/1.0/doAudit 审核接口
export function auditPurchasePlan<T = ResponseResult>(data: PurchaseNewController.AuditParams) {
	return request.post<T>(`${PREFIX}/doAudit`, { data });
}

// POST/api/admin/purchasenew/1.0/cancelAudit/{purchasePlanId} 撤销审核接口
export function cancelAudit<T = ResponseResult>(id: number) {
	return request.post<T>(`${PREFIX}/cancelAudit/${id}`);
}

// POST/api/admin/purchasenew/1.0/doRemove 作废接口
export function deletePurchasePlan<T = ResponseResult>(params: { id: number }) {
	return request.post<T>(`${PREFIX}/doRemove`, { params });
}

// POST/api/admin/purchasenew/1.0/convertOrder 采购计划转订单
export function createPurchaseOrder<T = ResponseResult<number[]>>(
	data: PurchaseNewController.ConvertOrderParams,
) {
	return request.post<T>(`${PREFIX}/convertOrder`, { data });
}

// GET/api/admin/purchasenew/1.0/getOneByMessageType 根据消息type查看

// GET/api/admin/purchasenew/1.0/export 采购计划导出
export const exportPurchasePlanUrl = `${PREFIX}/export`;

// GET /api/admin/purchasenew/1.0/applyDetail 采购申请详情
export function applyDetail<T = ResponseResult>(params: { planId: number }) {
	return request<T>(`${PREFIX}/applyDetail`, { params });
}

// POST /api/admin/purchasenew/1.0/planUpdate 采购申请修改
export function planUpdate<T = ResponseResult>(data: {
	planId: number;
	quantity: number;
	isUrgent: boolean;
}) {
	return request.post<T>(`${PREFIX}/planUpdate`, { data });
}
