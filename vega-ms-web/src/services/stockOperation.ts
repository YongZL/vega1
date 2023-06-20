// stock-operation-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/stockOperation/1.0';

// GET/api/admin/stockOperation/1.0/exportGoodsStockOperation 导出商品库存操作日志

// GET/api/admin/stockOperation/1.0/exportPackageBulkStockOperation 导出定数包库存操作日志

// GET/api/admin/stockOperation/1.0/exportSurgicalPackageStockOperation 导出手术套包库存操作日志

// GET/api/admin/stockOperation/1.0/getGoodsStockOperation 获取商品库存操作日志

// GET/api/admin/stockOperation/1.0/getPackageBulkStockOperation 获取定数包库存操作日志

// GET/api/admin/stockOperation/1.0/getStockOperatorByGoodsItemId 查询某个商品实例的所有库存操作日志
export function getStockOperatorByGoodsItemId<
	T = ResponseResult<StockOperationController.StockOperatorRecord[]>,
>(params: { id: number }) {
	return request.get<T>(`${PREFIX}/getStockOperatorByGoodsItemId`, { params });
}

// GET/api/admin/stockOperation/1.0/getSurgicalPackageStockOperation 获取手术套包库存操作日志

// GET/api/admin/stockOperation/1.0/recordExport 导出组包/拆包记录

// GET/api/admin/stockOperation/1.0/recordList 组包/拆包记录
