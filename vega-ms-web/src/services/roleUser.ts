//角色：Role Controller
import request from '@/utils/request';

const PREFIX = '/api/admin/roleUser/1.0';

type Params = { roleId: number; userIds: number[] };

//POST /api/admin/roleUser/1.0/bind 角色绑定到用户
export function roleBindUser(data: Params) {
	return request.post(`${PREFIX}/bind`, { data });
}

//POST /api/admin/roleUser/1.0/unbind 用户解绑角色
export function roleUnBindUser(data: Params) {
	return request.post(`${PREFIX}/unbind`, { data });
}
