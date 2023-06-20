import request from '@/utils/request';
import { TableListParams } from './data.d';
import api from '@/constants/api';
//选项一  列表查询
export async function departmentStatisticSummary(params?: TableListParams) {
	return request(api.goods_test.departmentStatisticSummary, { params });
}
//列表
export async function deanStatisticDepartment(params?: TableListParams) {
	return request(api.goods_test.deanStatisticDepartment, { params });
}
//列表右
export async function deanStatistic(params?: TableListParams) {
	return request(api.goods_test.deanStatistic, { params });
}
//验收详情
export async function deanStatisticDetail(params?: object) {
	return request(api.goods_test.deanStatisticDetail, { params });
}

//获取时间节点 gettimelist
export async function gettimelist() {
	return request(api.historyStatementList.timeList);
}

export async function queryStatementInfoDetail(params: any) {
	return request(api.generate_settlement.queryStatementInfoDetail, { params });
}
