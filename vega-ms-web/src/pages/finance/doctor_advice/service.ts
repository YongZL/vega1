import request from '@/utils/request';
import api from '@/constants/api';
import { TableListParams } from './data.d';
//列表
export async function queryRule(params?: TableListParams) {
	return request(api.doctor_advice.getList, { params });
}
//获取医嘱信息
export async function queryProcess(params: any) {
	return request(api.doctor_advice.getListByNum, { params });
}
//获取消耗列表
export async function queryConsumedGoodsList(params: any) {
	return request(api.doctor_advice.getConsumedGoodsList, { params });
}
//获取一级配送商业/药商
export async function getCustodiansByUser() {
	return request(api.custodians.listAll);
}
//获取科室列表
export async function getDepartmentList() {
	return request(api.departments.departmentList);
}
