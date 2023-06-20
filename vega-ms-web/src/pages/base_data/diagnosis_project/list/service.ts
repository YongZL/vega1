import request from '@/utils/request';
import api from '@/constants/api';

export interface ListType {
	pageNum: number;
	pageSize: number;
}
export async function getList(params?: ListType) {
	return request(api.diagnosis.pageList, {
		params,
	});
}

export async function enabled(id?: string) {
	return request(api.diagnosis.enabled + id, {
		method: 'POST',
	});
}
export async function disabled(id?: string) {
	return request(api.diagnosis.forbid + id, {
		method: 'POST',
	});
}

export async function getDetail(id?: string) {
	return request(api.diagnosis.detail + id, {});
}

export interface GoodsType {
	pageNum: number;
}
export async function getGoodsList(params?: GoodsType) {
	return request(api.goods.newlist, { params });
}

export interface ProjectType {
	departmentIds: string;
}
export async function projectAdd(params?: ProjectType) {
	return request(api.diagnosis.add, {
		method: 'POST',
		data: params,
	});
}

export async function projectEdit(params?: ProjectType) {
	return request(api.diagnosis.edit, {
		method: 'POST',
		data: params,
	});
}

//导出
export async function diagnosisExport(params?: any) {
	return request(api.diagnosis.export, { params });
}
