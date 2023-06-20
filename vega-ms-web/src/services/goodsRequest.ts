// 普通请领 goods-request-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/goodsRequest/1.0';

// POST/api/admin/goodsRequest/1.0/add 新增普通请领
export function addApply<T = ResponseResult>(
	data: GoodsRequestController.AddGoodsParams | GoodsRequestController.AddOrdinaryParams,
) {
	return request.post<T>(`${PREFIX}/add`, { data });
}

// POST/api/admin/goodsRequest/1.0/approval 请领审核
export function approval<T = ResponseResult>(data: GoodsRequestController.ApprovalParams) {
	return request.post<T>(`${PREFIX}/approval`, { data });
}
// POST/api/admin/goodsRequest/1.0/approvalReview 请领复核
export function approvalReview<T = ResponseResult>(data: GoodsRequestController.ApprovalParams) {
	return request.post<T>(`${PREFIX}/approvalReview`, { data });
}
// GET/api/admin/goodsRequest/1.0/detail 查询普通请领明细
export function getDetail<T = ResponseResult<GoodsRequestController.GoodsRecord[]>>(params: {
	goodsRequestId: number;
}) {
	return request<T>(`${PREFIX}/detail`, { params });
}
// POST/api/admin/goodsRequest/1.0/edit 修改普通请领
export function editApply<T = ResponseResult>(
	data: GoodsRequestController.EditGoodsParams | GoodsRequestController.EditOrdinaryParams,
) {
	return request.post<T>(`${PREFIX}/edit`, { data });
}

// GET/api/admin/goodsRequest/1.0/getById 根据id获取请领单信息
export function getDetailById<T = ResponseResult<GoodsRequestController.DetailRecord>>(params: {
	id: number;
}) {
	return request<T>(`${PREFIX}/getById`, { params });
}
// GET/api/admin/goodsRequest/1.0/getByIdAndMessageType 根据id和状态获取请领单信息

// GET/api/admin/goodsRequest/1.0/list 查询普通请领列表

// GET/api/admin/goodsRequest/1.0/queryGoodsRequestList 根据条件查询请领列表

// POST/api/admin/goodsRequest/1.0/remove 删除请领单
export function remove<T = ResponseResult>(data: { goodsRequestId: number }) {
	return request.post<T>(`${PREFIX}/remove`, { data });
}

// POST/api/admin/goodsRequest/1.0/withdraw 请领单撤回
export function withdraw<T = ResponseResult>(data: { goodsRequestId: number }) {
	return request.post<T>(`${PREFIX}/withdraw`, { data });
}
