// history-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/history/1.0';

// GET/api/admin/history/1.0/list 获取商品历史库存列表
export function queryGoodsStockList<T = ResponseList<HistoryController.QueryGoodsStockList>>(
	params: HistoryController.QuerGoodsStockList,
) {
	return request.get<T>(`${PREFIX}/list`, {
		params,
	});
}

// GET/api/admin/history/1.0/listByPackageBulk 获取定数包历史库存列表  项目中以无定数包

// GET/api/admin/history/1.0/listByPackageSurgical 获取手术套包历史库存列表 项目中以无手术套包
