import request from '@/utils/request';
import api from '@/constants/api';
// 列表
export async function queryRule(params?: any) {
	return request(api.manual_request.list, { params });
}

// 普通请领物资详情
export async function queryDetail(params?: any) {
	return request(api.manual_request.detail, { params });
}

// 普通请领单详情
export async function getDetail(params?: any) {
	return request(api.manual_request.getById, { params });
}

// 请领审核
export async function manualRequestApproval(params: any) {
	return request(api.manual_request.approval, {
		method: 'POST',
		data: {
			...params,
		},
	});
}

// 请领复核
export async function manualRequestApprovalReview(params: any) {
	return request(api.manual_request.approvalReview, {
		method: 'POST',
		data: {
			...params,
		},
	});
}

// 新增请领的三个列表
// 基础物资列表
export function queryGoodsList(params: any) {
	console.log('paramsparams', params);
	return request(api.warehouses.listById, { params });
}
// 定数包列表
export async function queryPackageBulkList(params: any) {
	return request(api.package_bulks.packageBulkList, { params });
}
// 手术套包列表
export async function queryPackageSurgical(params: any) {
	return request(api.package_surgical.packageSurgicalList, { params });
}
// 医耗套包列表
export async function queryordinary(params: any) {
	return request(api.package_ordinary.packageSurgicalList, { params });
}

// 获取仓库列表
export async function getWarehousesByUser(params: any) {
	return request(api.warehouses.listAll, { params });
}
// 获取某个科室下的仓库列表
export async function getWarehousesByDepartment(params: any) {
	return request(api.warehouses.warehouseListbyIds, { params });
}
// 获取科室列表
export async function getDepartmentList() {
	return request(api.departments.departmentList);
}

// 新增请领
export async function addRule(params: any) {
	return request(api.manual_request.add, {
		method: 'POST',
		data: {
			...params,
		},
	});
}
// 编辑请领
export async function updateRule(params: any) {
	return request('/api/admin/goodsRequest/1.0/edit', {
		method: 'POST',
		data: {
			...params,
		},
	});
}
// 撤回
export async function withdrawManualRequest(params: any) {
	return request('/api/admin/goodsRequest/1.0/withdraw', {
		method: 'POST',
		data: {
			...params,
		},
	});
}
// 删除
export async function removeManualRequest(params: any) {
	return request('/api/admin/goodsRequest/1.0/remove', {
		method: 'delete',
		data: {
			...params,
		},
	});
}
