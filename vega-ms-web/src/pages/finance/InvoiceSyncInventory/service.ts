import request from '@/utils/request';
import { TableListParams } from './data.d';
import api from '@/constants/api';
//列表
export async function invoiceSyncList(params?: TableListParams) {
	return request(api.InvoiceSyncInventory.invoiceSyncList, { params });
}

//导出
export async function invoiceSyncExport(params?: TableListParams) {
	return request(api.InvoiceSyncInventory.invoiceSyncExport, { params });
}

//获取时间节点 gettimelist
export async function gettimelist(params?: TableListParams) {
	return request(api.historyStatementList.timeList, { params });
}

//列表打印
export async function deanStatisticDepartmentPrint(params?: TableListParams) {
	return request(api.medical_supplies_report.deanStatisticPrint, { params });
}
