import request from '@/utils/request';
import api from '@/constants/api';

export interface ReturnableType {
	pageNum: number;
	pageSize: number;
	warehouseId: string;
	materialCode: string;
	lotNum: string;
	status: string;
	goodsName: string;
	sortList: any;
}
export async function getReturnable(params?: ReturnableType) {
	return request(api.return_purchase.returnable, {
		params,
	});
}

export interface SubmitType {
	details: any;
	sourceWarehouseId: string;
	targetWarehouseId: string;
}
export async function submitDate(params?: SubmitType) {
	return request(api.reallocation.makingReallocate, {
		method: 'POST',
		data: params,
	});
}

export interface SubmitCodeType {
	warehouseId: string;
	operatorBarcode: string;
}
export async function submitCode(params?: SubmitCodeType) {
	return request(api.stock.getMaterialInfo, {
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
