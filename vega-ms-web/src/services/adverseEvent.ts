// 不良事件 adverse-event-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/dverseEvent/1.0';

// POST/api/admin/dverseEvent/1.0/create 新增不良事件
export function createAdd<T = ResponseResult>(params: AdverseEvent.createAdd) {
	return request<T>(`${PREFIX}/create`, {
		method: 'POST',
		data: {
			...params,
		},
	});
}

// GET/api/admin/dverseEvent/1.0/findAdverseInfoById 查看不良事件详情
export async function getDetail<T = ResponseResult<AdverseEvent.QueryDetail>>(params: {
	id: number;
}) {
	return request.get<T>(`${PREFIX}/findAdverseInfoById`, { params });
}

// GET/api/admin/dverseEvent/1.0/list 不良事件列表
export async function getList<T = ResponseResult<ResponseList<AdverseEvent.QuerygetList[]>>>(
	params: AdverseEvent.GetList,
) {
	return request.get<T>(`${PREFIX}/list`, { params });
}
