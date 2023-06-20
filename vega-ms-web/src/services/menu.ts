import request from '@/utils/request';
import api from '@/constants/api';

export interface MenuParamsType {
	hospitalId: number;
}

export async function getMenuList(params: MenuParamsType) {
	return request(
		`/api/admin/permissions/1.0/getMenus/${params.hospitalId}?hospitalId=${params.hospitalId}`,
		{
			data: params,
		},
	);
}

export async function getConfigInfo() {
	return request(api.config, {});
}
