// relate-goods-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/relateGoods/1.0';

/** POST/api/admin/relateGoods/1.0/batchRelateGoods 批量对照 */
export function batchRelateGoods<T = ResponseResult>(
	data: RelateGoodsController.BatchRelateGoodsData,
) {
	return request.post<T>(`${PREFIX}/batchRelateGoods`, { data });
}

/** GET/api/admin/relateGoods/1.0/export 对照导出 */
export const exportApi = `${PREFIX}/export`;

/** GET/api/admin/relateGoods/1.0/getRelatedWithPage 分页查询对照信息 */
export function queryRelateGoods<T = ResponseResult<RelateGoodsController.QueryRelateGoodsRecord>>(
	params: RelateGoodsController.QueryRelateGoodsPageParams,
) {
	return request.get<T>(`${PREFIX}/getRelatedWithPage`, { params });
}

/** GET/api/admin/relateGoods/1.0/getWithPage 分页查询物资对照原始数据 */
export function queryHisGoods<T = ResponseResult<RelateGoodsController.QueryRelateGoodsRecord>>(
	params: RelateGoodsController.QueryHisGoodsParams,
) {
	return request.get<T>(`${PREFIX}/getWithPage`, { params });
}

/** POST/api/admin/relateGoods/1.0/relateGoods 对照 */
export function relateGoods<T = ResponseResult>(data: RelateGoodsController.RelateGoodsData) {
	return request.post<T>(`${PREFIX}/relateGoods`, { data });
}

/** POST/api/admin/relateGoods/1.0/unbindGoods 解绑 */
export function unbindGoods<T = ResponseResult>(data: RelateGoodsController.UnbindGoodsData) {
	return request.post<T>(`${PREFIX}/unbindGoods`, { data });
}
