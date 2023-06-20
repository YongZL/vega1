import request from '@/utils/request';
import api from '@/constants/api';
import { TableListParams } from './data.d';
//列表
export async function queryRule(params?: TableListParams) {
	return request(api.material_acceptance.getList, { params });
}

//获取配送商业列表
export async function getSuppliersList() {
	return request(api.suppliers.listAll);
}
//获取科室列表
export async function getDepartmentList() {
	return request('/api/admin/departments/1.0/getSelections');
}
