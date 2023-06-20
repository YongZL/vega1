import request from '@/utils/request';
import api from '@/constants/api';

export interface ListType {
	pageNum?: number;
	pageSize?: number;
}
export async function getList(params?: ListType) {
	return request(api.goods_inquire.getList, {
		params,
	});
}
export interface StorageAreaType {
	pageNum: number;
	pageSize: number;
	warehouseId: string;
}
export async function getStorageArea(params?: StorageAreaType) {
	return request(api.warehousesStorage.pageList, {
		params,
	});
}
