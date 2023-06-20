import request from '@/utils/request';
import api from '@/constants/api';
//列表
export async function queryRule(params?: any) {
	return request(api.procurementUse.list, { params });
}

//获取时间节点
export async function gettimelist() {
	return request(api.historyStatementList.timeList);
}
