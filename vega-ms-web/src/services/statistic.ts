// statistic-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/statistic/1.0';

/** POST/api/admin/statistic/1.0/export 导出数据 */
export const exportUrl = `${PREFIX}/export`;

/** GET/api/admin/statistic/1.0/get/{id} 获取单个报表的源数据 */
export function getStatistic<T = ResponseResult<StatisticController.GetStatisticRecord>>(
	id: number,
) {
	return request.get<T>(`${PREFIX}/get/${id}`);
}

/** GET/api/admin/statistic/1.0/list 获取所有可以访问的报表 */
export function getAllStatistic<T = ResponseResult<StatisticController.GetAllStatisticRecord[]>>() {
	return request.get<T>(`${PREFIX}/list`);
}

/** POST/api/admin/statistic/1.0/query 查询数据 */
export function queryList<T = ResponseResult<StatisticController.QueryListRecord[]>>(
	data: StatisticController.QueryListData,
) {
	return request.post<T>(`${PREFIX}/query`, { data });
}
