import request from '@/utils/request';
import api from '@/constants/api';
import { TableListParams } from './data.d';
// 列表
export async function queryRule(params?: TableListParams) {
	return request(api.repository_inbound.list, { params });
}
