import request from '@/utils/request';
import api from '@/constants/api';

export interface ListType {
	pageNum: number;
	pageSize: number;
}
export async function getList(params?: ListType) {
	return request(api.reallocation.getList, {
		params,
	});
}
export interface DetailType {
	reallocateId: string;
}
export async function getDetail(params?: DetailType) {
	return request(api.reallocation.getDetails, {
		params,
	});
}

// todo
export interface WarehouseType {
	departmentIds: string;
}
export async function getWarehouseListByIds(params?: WarehouseType) {
	return request(api.warehouses.warehouseListbyIds, {
		params,
	});
}

export interface ApproveType {
	status: boolean;
	reason: string;
	reallocateId: string;
}
// 审核
export async function approve(params?: ApproveType) {
	return request(api.reallocation.approve, {
		method: 'POST',
		data: params,
	});
}

export interface PassType {
	reallocateId?: string;
	operatorBarcode?: string;
}
// 验收
export async function pass(params?: PassType) {
	return request(api.reallocation.pass, {
		method: 'POST',
		data: params,
	});
}

// 批量验收
export async function batchPass(params?: PassType) {
	return request(api.reallocation.batchPass, {
		method: 'POST',
		data: params,
	});
}

// 批量验收
export async function commit(params?: PassType) {
	return request(api.reallocation.commit, {
		method: 'POST',
		data: params,
	});
}
