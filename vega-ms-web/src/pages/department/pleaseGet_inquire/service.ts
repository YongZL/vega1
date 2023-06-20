import request from '@/utils/request';
import api from '@/constants/api';

export interface ListType {
	pageNum: number;
	pageSize: number;
	level: number;
	sortList: any;
}
export async function getList(params?: ListType) {
	return request(api.pleaseGet_inquire.list, {
		params,
	});
}
