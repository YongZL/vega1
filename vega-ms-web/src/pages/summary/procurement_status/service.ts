import request from '@/utils/request';
import api from '@/constants/api';
import { TableListParams } from './data.d';
//列表
export async function queryRule(params?: TableListParams) {
	return request(api.purchase_order.status, { params });
}
//获取配送商业列表
export async function getSuppliersList() {
	return request(api.suppliers.listAll);
}
//获取一级配送商业
export async function getCustodiansByUser() {
	return request(api.custodians.listAll);
}
