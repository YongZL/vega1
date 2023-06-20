import request from '@/utils/request';
import api from '@/constants/api';
import { TableListParams } from './data.d';
//列表
export async function queryRule(params?: TableListParams) {
	return request(api.logic_stock_operation.list, { params });
}
//同步操作
export async function queryProcess(params: object) {
	return request(api.logic_stock_operation.process, {
		method: 'POST',
		data: {
			...params,
		},
	});
}
//获取仓库列表
export async function getWarehousesByUser() {
	return request('/api/admin/warehouses/1.0/getByUser');
}
//获取某个科室下的仓库列表
export async function getWarehousesByDepartment(params: object) {
	return request('/api/admin/warehouses/1.0/getListByDepartmentIds', { params });
}
//获取科室列表
export async function getDepartmentList() {
	return request('/api/admin/departments/1.0/getSelections');
}
