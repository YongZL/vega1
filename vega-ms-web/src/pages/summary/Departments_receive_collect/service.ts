import request from '@/utils/request';
import api from '@/constants/api';
import { TableListParams } from './data.d';
//列表
export async function queryRule(params?: TableListParams) {
	return request(api.Departments_receive_collect.list, { params });
}
// 获取科室列表
// export async function getDepartmentList(params?: TableListParams) {
//   return request(api.Departments_receive_collect.departmentList,{params});
// }
//获取时间节点
export async function gettimelist() {
	return request(api.Departments_receive_collect.timeList);
}
