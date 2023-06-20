import request from '@/utils/request';
import { TableListParams } from './data.d';
import api from '@/constants/api';
import { notification } from '@/utils/ui';
//列表
export async function queryRule(params?: TableListParams) {
	return request(`${api.custodians.list}`, { params });
}

//生产厂家详情
export async function queryDetail(params?: any) {
	return request(`${api.custodian}/${params.id}`);
}

//启用/禁用
export async function withdrawManualRequest(params: object) {
	return request(`${api.custodians.enable}`, {
		method: 'POST',
		data: {
			...params,
		},
	});
}

export const addCustodian = async (params) => {
	const res = await request(api.custodian, {
		method: 'POST',
		data: {
			...params,
		},
	});
	if (res && res.code === 0) {
		notification.success('新增成功');
		return true;
	}

	return false;
};

export const editCustodian = async (id, params) => {
	const res = await request(`${api.custodian}/${id}`, {
		method: 'POST',
		data: {
			...params,
		},
	});

	if (res && res.code === 0) {
		notification.success('编辑成功');
		return true;
	}

	return false;
};

export function getGoodsList(url: any, params: any) {
	return request(url, { params });
}
