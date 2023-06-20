import request from '@/utils/request';
import api from '@/constants/api';

// 获取面包屑数据
export async function getMenu() {
	return request(api.summary_report_form.menu, {});
}

// 获取查询条件和表头
export async function getSearch(id?: string) {
	return request(api.summary_report_form.search + id, {});
}

// 查询列表
export interface ListType {
	pageNum?: number;
	pageSize?: number;
}
export async function getList(params?: ListType) {
	return request(api.summary_report_form.list, {
		method: 'POST',
		data: params,
	});
}

export interface SupplierType {
	pageNum: number;
	pageSize: number;
	supplierName: string;
}
