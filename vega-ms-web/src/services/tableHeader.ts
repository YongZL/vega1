// TableHeaderController
import request from '@/utils/request';

const RS_PREFIX = '/api/rs/tableHeader/1.0';

// GET/api/rs/tableHeader/1.0/getByUserIdAndType 获取表头信息
export async function getByUserIdAndType(params?: any) {
	return request(`${RS_PREFIX}/getByUserIdAndType`, {
		params,
	});
}

// POST/api/rs/tableHeader/1.0/updateTableHeader 更新表头信息
export async function updateTableHeader(data: any) {
	return request.post(`${RS_PREFIX}/updateTableHeader`, { data });
}
