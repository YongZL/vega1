import request from '@/utils/request';
import { TableListParams } from './data.d';
import api from '@/constants/api';
//列表
export async function queryList(params?: TableListParams) {
	return request(api.material_report.materialList, { params });
}
