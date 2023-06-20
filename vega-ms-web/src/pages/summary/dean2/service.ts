import request from '@/utils/request';
import { TableListParams } from './data.d';
import api from '@/constants/api';
//列表
export async function deanStatisticDepartment(params?: TableListParams) {
	return request(api.medical_supplies_report.deanStatisticDepartment, { params });
}

//列表详情
export async function deanStatisticDepartmentDetail(params?: TableListParams) {
	return request(api.medical_supplies_report.deanStatisticDetail, { params });
}

//导出
export async function deanStatisticDepartmentDetailExport(params?: TableListParams) {
	return request(api.medical_supplies_report.deanStatisticDepartment, { params });
}

export async function getType12() {
	return request(api.goods.typeList12, {});
}
export async function getType18() {
	return request(api.goods.typeList18, {});
}
export async function getType95() {
	return request(api.goods.typeList95, {});
}
//获取时间节点 gettimelist
export async function gettimelist() {
	return request(api.historyStatementList.timeList);
}

//列表打印
export async function deanStatisticDepartmentPrint(params?: TableListParams) {
	return request(api.medical_supplies_report.deanStatisticPrint, { params });
}

//详情列表打印
export async function deanStatisticDepartmentDetailPrint(params?: TableListParams) {
	return request(api.medical_supplies_report.deanStatisticPrint, { params });
}
