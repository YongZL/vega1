// audit-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/audit/1.0';

// GET/api/admin/audit/1.0/getHistory 查询操作历史
export async function getHistory<T = ResponseResult<Audit.QuerygetHistory>>(params: {
	target?: string;
	key?: string | number;
}) {
	return request.get<T>(`${PREFIX}/getHistory`, { params });
}

// GET/api/admin/audit/1.0/getWithPage 分页查询审计记录
export async function getOnDetail<T = ResponseResult<ResponseList<Audit.QueryRulelist>>>(
	params: Audit.Rulelist,
) {
	return request.get<T>(`${PREFIX}/getWithPage`, { params });
}
