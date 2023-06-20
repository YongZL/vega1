// 调拨业务 reallocate-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/reallocate/1.0';

// GET/api/admin/reallocate/1.0/selectStorageAreaList 供货/到货下拉框列表

// GET/api/admin/reallocate/1.0/pageList 分页查询列表

// POST/api/admin/reallocate/1.0/export 导出

// GET/api/admin/reallocate/1.0/detail 查看

// POST/api/admin/reallocate/1.0/closeReallocateOrder/{storageReallocateId} 结束订单

// POST/api/admin/reallocate/1.0/operationEntryStorage/{storageReallocateId} 送达入库

// GET/api/admin/reallocate/1.0/detailItem 调拨单详情明细

// POST/api/admin/reallocate/1.0/overPick/{storageReallocateId} 结束配货

// POST/api/admin/reallocate/1.0/pick 配货

// GET/api/admin/reallocate/1.0/getByCode 查询待上架的商品

// POST/api/admin/reallocate/1.0/complete/{storageReallocateId} 提前完成配货

// POST/api/admin/reallocate/1.0/approve 审批调拨单
export function approve<T = ResponseResult>(params: ReallocateController.Approve) {
	return request.post<T>(`${PREFIX}/approve`, { data: params });
}

// POST/api/admin/reallocate/1.0/batchAccept 批量验收
export function batchPass<T = ResponseResult>(params: ReallocateController.Approve) {
	return request.post<T>(`${PREFIX}/batchAccept`, { data: params });
}

// POST/api/admin/reallocate/1.0/commit 调拨单验收确认
export function commit<T = ResponseResult>(params: ReallocateController.ReallocateParams) {
	return request.post<T>(`${PREFIX}/commit`, { data: params });
}

// GET/api/admin/reallocate/1.0/getOne 查询一个调拨单详情
export function getDetail<T = ResponseResult<ReallocateController.ReallocateRecord>>(
	params: ReallocateController.ReallocateParams,
) {
	return request.get<T>(`${PREFIX}/getOne`, { params });
}

// GET/api/admin/reallocate/1.0/getWithPage 分页查询列表

// POST/api/admin/reallocate/1.0/makingReallocate 制作调拨单
export function makingReallocate<T = ResponseResult>(
	data: ReallocateController.MakingReallocateParams,
) {
	return request.post<T>(`${PREFIX}/makingReallocate`, { data });
}

// POST/api/admin/reallocate/1.0/pass 验收通过
export function pass<T = ResponseResult>(params: ReallocateController.PassParams) {
	return request.post<T>(`${PREFIX}/pass`, { data: params });
}
