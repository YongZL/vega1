import request from '@/utils/request';
import api from '@/constants/api';

export interface ListType {
	pageNum: number;
	pageSize: number;
}
export async function getList(params?: ListType) {
	return request(api.package_bulks.list, {
		params,
	});
}

export interface EnabledType {
	id: string;
	enable: boolean;
}
// export async function setEnabled(params?: EnabledType) {
// 	return request(api.package_bulks.enable, {
// 		method: 'POST',
// 		data: params,
// 	});
// }

// export async function getDetail(id?: string) {
// 	return request(`${api.package_bulks.detail}/${id}`, {});
// }

export interface GoodsType {
	pageNum: number;
	pageSize: number;
	keywords: string;
	isBarcodeControlled: boolean;
}
export async function getGoodsList(params?: GoodsType) {
	return request(api.goods.newlist, { params });
}

export interface ProjectType {
	departmentIds: string;
}
// export async function itemAdd(params?: ProjectType) {
// 	return request(api.package_bulks.add, {
// 		method: 'POST',
// 		data: params,
// 	});
// }

// export async function itemEdit(params?: ProjectType) {
// 	return request(api.package_bulks.edit, {
// 		method: 'POST',
// 		data: params,
// 	});
// }

export async function itemExamine(params?: any) {
	return request(api.package_ordinary.examineOrdinary, {
		method: 'POST',
		data: params,
	});
}

export async function getAllManufacturers() {
	return request(api.manufacturers.allList, {});
}
