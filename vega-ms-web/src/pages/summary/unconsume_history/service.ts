import request from '@/utils/request';
import api from '@/constants/api';

export const queryGoodsConsumeList = (params?: any) => {
	return request(api.departmentUnConsume.goodsConsume, {
		params: params,
	});
};
export const queryPackageBulkConsumeList = (params?: any) => {
	return request(api.departmentUnConsume.packageBulkConsume, {
		params: params,
	});
};
export const querySurgicalConsumeList = (params?: any) => {
	return request(api.departmentUnConsume.surgicalConsume, {
		params: params,
	});
};
export const queryPackageBulkUnConsumeDetails = (params?: any) => {
	return request(api.departmentUnConsume.conpacsumedetails, {
		params: params,
	});
};
export const queryPackageSurgicalUnConsumeDetails = (params?: any) => {
	return request(api.departmentUnConsume.consumedetails, {
		params: params,
	});
};

//科室
export async function queryAllDepartmentList() {
	return request(`${api.departments.allDepartmentList}`);
}
//配送商业
export async function querySuppliersList(params: { pageNum: number; pageSize: number }) {
	return request(api.suppliers.listAll, { params });
}
