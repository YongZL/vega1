import request from '@/utils/request';
import api from '@/constants/api';
// 列表
export async function queryRule(params?: any) {
	return request(api.department_consume.list, { params });
}
