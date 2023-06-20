// 获取工作日 expecttime-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/expecttime/1.0';

// GET/api/admin/expecttime/1.0/getworkdays 获取当前日期往后的第三个工作日日期
export function getWorkdays<T = ResponseResult<number>>() {
	return request.get<T>(`${PREFIX}/getworkdays`);
}
