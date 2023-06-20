import request from '@/utils/request';
import api from '@/constants/api';

export interface ListType {
	pageNum: number;
	pageSize: number;
	code: string;
	approvalBy: string;
	createdBy: string;
	status: string;
	warehouseIds: string;
	createdFrom: string;
	createdTo: string;
	watcher: string;
	reviewer: string;
	operator: string;
}
export async function getList(params?: ListType) {
	return request(api.stockTaking.list, {
		params,
	});
}
// 详情
export async function getDetail(id?: string) {
	return request(api.stockTaking.detailInfo + id, {});
}

// 用户列表
export interface UserType {
	departmentIds: string;
	pageNum: number;
	pageSize: number;
}
export async function getUserListByDepId(params?: UserType) {
	return request(api.users.listByDepartmentId, {
		params,
	});
}

// 新增
export interface AddType {
	warehouseId: string;
	stockTakingOperator: string;
	stockTakingReviewer: string;
	stockTakingWatcher: string;
}
export async function add(params?: AddType) {
	return request(api.stockTaking.generate, {
		method: 'POST',
		data: params,
	});
}

// 明细列表
export interface detailLIstType {
	pageNum: number;
	pageSize: number;
	stockTakingOrderId: string;
	materialCode: string;
	type: string;
}
export async function detailList(params?: detailLIstType) {
	return request(api.stockTaking.detail, {
		params,
	});
}

// 编辑
export interface EditType {
	stockTakingOrderId: string;
	items: any;
}
export async function edit(params?: EditType) {
	return request(api.stockTaking.solvingStockError, {
		method: 'POST',
		data: params,
	});
}

// 完成
export interface FinishType {
	stockTakingOrderId: string;
}
export async function finish(params?: FinishType) {
	return request(api.stockTaking.submitStockTakingOrder, {
		method: 'POST',
		data: params,
	});
}
