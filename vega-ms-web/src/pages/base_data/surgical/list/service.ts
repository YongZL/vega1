import request from '@/utils/request';
import api from '@/constants/api';

export interface ListType {
	pageNum: number;
	pageSize: number;
}
export async function getList(params?: ListType) {
	return request(api.package_surgical.list, {
		params,
	});
}

export async function disabled(id?: string) {
	return request(`${api.package_surgical.disable}/${id}`, { method: 'POST' });
}
export async function enabled(id?: string) {
	return request(`${api.package_surgical.enable}/${id}`, { method: 'POST' });
}

export async function getDetail(id?: string) {
	return request(`${api.package_surgical.detail}/${id}`, {});
}

export interface GoodsType {
	pageNum: number;
}
export async function getGoodsList(params?: GoodsType) {
	return request(api.goods.surgicalGoodsList, { params });
}

export interface ItemType {
	id: string;
	name: string;
	description: string;
	category: string;
	chargeNum: string;
	stockingUp: boolean;
	packageSurgicalGoodsList: any;
}
export async function itemAdd(params?: ItemType) {
	return request(api.package_surgical.detail, {
		method: 'POST',
		data: params,
	});
}

export async function itemEdit(params?: ItemType) {
	return request(`${api.package_surgical.detail}/${params.id}`, {
		method: 'POST',
		data: params,
	});
}
