// goods-operator-record-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/goodsOperatorRecord/1.0';

// GET/api/admin/goodsOperatorRecord/1.0/selectRecord 操作历史记录
export function selectRecord<T = ResponseList<GoodsOperatorRecordController.GoodsOperatorRecord[]>>(
	params: GoodsOperatorRecordController.SelectRecordParams,
) {
	return request<T>(`${PREFIX}/selectRecord`, { params });
}
