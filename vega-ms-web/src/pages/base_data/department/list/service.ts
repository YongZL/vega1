import request from '@/utils/request';
import api from '@/constants/api';

export interface ListType {
	pageNum: number;
	pageSize: number;
	departmentId: string;
	isCombined: boolean;
}
export async function getGoods(params?: ListType) {
	return request(api.departments.goodsWithPage, {
		params,
	});
}
export async function getBulk(params?: ListType) {
	return request(api.package_bulks.packageBulkList, {
		params,
	});
}

export async function getOrdinary(params?: ListType) {
	return request(api.package_ordinary.packageSurgicalList, {
		params,
	});
}

export async function getSurgical(params?: ListType) {
	return request(api.package_ordinary.packageSurgicalList, {
		params,
	});
}
export async function getDiagonsis(params?: ListType) {
	return request(api.diagnosis.getDepartmentDiagnosisProjectList, {
		params,
	});
}
export interface UnbindType {
	departmentId: string;
	goodsId: string;
	packageBulkId: string;
	packageSurgicalId: string;
	projectId: string;
}
export async function unbindGoods(params?: UnbindType) {
	return request(api.departments.unbindGoods, {
		method: 'POST',
		data: params,
	});
}
export async function unbindBulk(params?: UnbindType) {
	return request(api.package_bulks.unBindWarehouse, {
		method: 'POST',
		data: params,
	});
}
export async function unbindSurgical(params?: UnbindType) {
	return request(api.package_surgical.unBindWarehouse, {
		method: 'POST',
		data: params,
	});
}
export async function unbindProject(params?: UnbindType) {
	return request(api.package_ordinary.unbind, {
		method: 'POST',
		data: params,
	});
}

export async function getDetail(id?: string) {
	return request(api.diagnosis.detail + id, {});
}

export interface GoodsType {
	pageNum: number;
}
export async function getGoodsList(params?: GoodsType) {
	return request(api.goods.newlist, { params });
}
export interface SearchType {
	pageNum: number;
	pageSize: number;
	departmentId: string;
	departmentAdd: string;
}

export async function searchGoodsList(params?: SearchType) {
	return request(api.departments.goodsWithPage, { params });
}
export async function searchBulkList(params?: SearchType) {
	return request(api.package_bulks.getUnbindList, { params });
}
export async function searchSurgicalList(params?: SearchType) {
	return request(api.package_surgical.getUnbindList, { params });
}
export async function searchProjectList(params?: SearchType) {
	return request(api.diagnosis.getDepartmentDiagnosisProjectList, { params });
}
export async function ordinaryList(params?: SearchType) {
	return request(api.package_ordinary.packageSurgicalList, { params });
}

export interface WarehouseType {
	pageNum: number;
	pageSize: number;
	departmentId: string;
}

export async function warehouseList(params?: WarehouseType) {
	return request(api.warehouses.warehouseList, { params });
}

export async function bindGoods(params?: any) {
	return request(api.departments.setDepartmentGoods, { method: 'POST', data: params });
}
export async function bindBulk(params?: any) {
	return request(api.package_bulks.bindWarehouse, { method: 'POST', data: params });
}
export async function bindSurgical(params?: any) {
	return request(api.package_surgical.bindWarehouse, { method: 'POST', data: params });
}
export async function bindProject(params?: any) {
	return request(api.diagnosis.bind, { method: 'POST', data: params });
}
export async function bindOrdinary(params?: any) {
	return request(api.package_ordinary.editBindWarehouse, { method: 'POST', data: params });
}

export async function limitsGoods(params?: any) {
	return request(api.departments.warehouseGoodsList, { params });
}
export async function limitsBulk(params?: any) {
	return request(api.package_bulks.findPackageBulkLimits, { params });
}
export async function limitsOrdinary(params?: any) {
	return request(api.package_ordinary.findPackageWarehouseLimits, { params });
}

export interface ProjectType {
	departmentIds: string;
}

export async function getTreeDate(params?: any) {
	// console.log(params)
	return request(api.departments.treeList, { params });
}

export async function getCampuss() {
	return request(api.departments.hospital_campus, {});
}

export async function getProvincesList() {
	return request(api.districts.province, {});
}
export interface CityType {
	areaCode: string;
}
export async function getChildren(params?: CityType) {
	return request(api.districts.city, { params });
}

export async function getAreaList() {
	return request(api.districts.area, {});
}

export async function getParentPaths(params?: CityType) {
	return request(api.districts.parentPaths, { params });
}

export interface SubmitType {
	name: string;
	hospitalCampusId: number;
	mergeName: string;
	address: string;
	contactName: string;
	contactPhone: string;
	remark: string;
	parentId: string;
	id: string;
}
export async function departmentAdd(params?: SubmitType) {
	return request(api.departments.add, {
		method: 'POST',
		data: params,
	});
}

export async function departmentEdit(params?: SubmitType) {
	return request(`${api.departments.add}/${params.id}`, {
		method: 'POST',
		data: params,
	});
}

export async function detailInfo(id?: string) {
	return request(`${api.departments.add}/${id}`, {});
}

export interface BatchBindType {
	departmentIds: any;
	goodsId: string;
}
// 批量绑定
export async function batchBindDepartmentGoods(params?: BatchBindType) {
	return request(api.departments.batchBindDepartmentGoods, {
		method: 'POST',
		data: params,
	});
}

//获取生产厂家
export async function getAllManufacturers() {
	return request(api.manufacturers.allList, {});
}

// 科室批量绑定基础物资
export async function batchGoods(params: any) {
	return request(api.departments.bindGoods, {
		dataType: 'json',
		method: 'POST',
		data: params,
	});
}

// 科室批量绑定定数包
export async function bindPackageBulk(params: any) {
	return request(api.package_bulks.bindPackageBulk, {
		dataType: 'json',
		method: 'POST',
		data: params,
	});
}

export async function partmentBindOrdinary(params: any) {
	return request(api.package_bulks.partmentBindOrdinary, {
		dataType: 'json',
		method: 'POST',
		data: params,
	});
}

//物资批量绑定科室时（获取物资）
export async function getGoodsData(params?: any) {
	return request(api.goods.getGoods, { params });
}

export async function getTreeListData(params?: any) {
	return request(api.departments.departmentTreeList, { params });
}
