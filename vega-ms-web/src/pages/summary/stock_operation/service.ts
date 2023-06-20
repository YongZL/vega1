import request from '@/utils/request';
import api from '@/constants/api';

export const queryGoodsList = (params?: any) => {
	return request(api.stock_operation.goods_list, {
		params: params,
	});
};
export const queryPackageBulkList = (params?: any) => {
	return request(api.stock_operation.package_bulk_list, {
		params: params,
	});
};
export const querySurgicalList = (params?: any) => {
	return request(api.stock_operation.package_surgical_list, {
		params: params,
	});
};
