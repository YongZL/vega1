import request from '@/utils/request';
import api from '@/constants/api';

export const queryCostCentralList = (params?: any) => {
	return request(api.cost_central.list, {
		params: params,
	});
};
export const queryCostCentralDetail = (params?: any) => {
	return request(api.cost_central.detail, {
		params: params,
	});
};
export const queryCostCentralExport = (params?: any) => {
	return request(api.cost_central.export, {
		params: params,
	});
};
