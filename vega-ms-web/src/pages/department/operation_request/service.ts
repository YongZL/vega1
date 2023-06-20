import request from '@/utils/request';
import { TableListParams } from './data.d';
import api from '@/constants/api';
// 手术套包请领列表
export async function queryRule(params?: TableListParams) {
	return request(api.operation_request.list, { params });
}
// 手术套包列表
export async function queryPackageSurgical(params?: TableListParams) {
	return request(api.operation_request.packageSurgical, { params });
}

//
export async function queryPackageSurgicalList(params?: TableListParams) {
	return request(api.package_surgical.packageSurgicalList, { params });
}
// 获取手术套包基础物资列表
export async function queryPackageSurgicalDetailList(params?: TableListParams) {
	return request(`${api.package_surgical.detail}/${params.id}`, { params });
}

// 手术套包请领详情
export async function queryDetail(params?: object) {
	return request(api.operation_request.detail, { params });
}

// 医嘱列表
export async function queryMedicalAdviceList(params?: object) {
	return request(api.doctor_advice.getList1, { params });
}
// 编辑请领
export async function queryDetailEdit(params: object) {
	return request(api.operation_request.detailEdit, {
		method: 'POST',
		data: {
			...params,
		},
	});
}

// 审核/复核
export async function queryDetailApproval(params: object) {
	return request(api.operation_request.detailApproval, {
		method: 'POST',
		data: {
			...params,
		},
	});
}
// 删除
export async function queryRemove(id: any) {
	return request(`${api.operation_request.remove}${id}`, { method: 'POST' });
}
// 根据科室查仓库列表
export async function queryWarehouseList(params?: object) {
	return request(api.warehouses.warehouseList, { params });
}
// 获取科室列表
export async function getDepartmentList() {
	return request('/api/admin/departments/1.0/getSelections');
}
