import request from '@/utils/request';
import api from '@/constants/api';

export const queryRecordList = (params?: any) => {
	return request(api.unpacking.list, {
		params: params,
	});
};
export const queryRecordDetails = (params?: any) => {
	return request(api.unpacking.detail, {
		params: params,
	});
};
