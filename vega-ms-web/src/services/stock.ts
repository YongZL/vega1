// stock-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/stock/1.0';

// GET/api/admin/stock/1.0/exportAvailableStocks 中心库可用库存导出

// GET/api/admin/stock/1.0/getAvailableStocks 中心库可用库存查询
export async function getAvailableStocks<T = ResponseList<StockController.GetQueryAvailableStocks>>(
	params: StockController.GetStockWithPage,
) {
	return request.get<T>(`${PREFIX}/getAvailableStocks`, { params });
}

// GET/api/admin/stock/1.0/getByCode 根据code查询同一批次待上架的商品

// GET/api/admin/stock/1.0/getGoodsByCode 根据条码查询商品实例

// GET/api/admin/stock/1.0/getGoodsItemWithDeleted 分页查询商品实例（包括已经删除的）
export function getGoodsItemWithDeleted<T = ResponseResult<StockController.GoodsItem>>(
	params: StockController.GoodsItemParams,
) {
	return request.get<T>(`${PREFIX}/getGoodsItemWithDeleted`, { params });
}

// GET/api/admin/stock/1.0/getHomePageSupplierStock 首页获取配送商业库存
export function getHomeSupplierStock<T = ResponseResult<StockController.HomeStockData>>() {
	return request.get<T>(`${PREFIX}/getHomePageSupplierStock`);
}

// GET/api/admin/stock/1.0/getHomePageWarehouseStock 首页获取仓库库存
export function getHomeWarehouseStock<T = ResponseResult<StockController.HomeStockData>>() {
	return request.get<T>(`${PREFIX}/getHomePageWarehouseStock`);
}

// GET/api/admin/stock/1.0/getInvoicingWithPage 进销存查询

// GET/api/admin/stock/1.0/getMaterialInfo 一物一码查询物资
export function searchGoods<T = ResponseResult<ReturnGoodsController.ReturnGoodsRecord>>(params: {
	operatorBarcode?:
		| string
		| {
				gs1Code?: string;
				items?: any[];
		  };
	returnGoodsCode?: string;
	warehouseId?: string;
}) {
	return request.get<T>(`${PREFIX}/getMaterialInfo`, { params });
}

// GET/api/admin/stock/1.0/getPackageBulkStock 查询定数包库存

// GET/api/admin/stock/1.0/getPackageBulkStockDetails 查询定数包库存实例

// GET/api/admin/stock/1.0/getPackageOrdinaryStock 查询医耗套包库存
export async function queryOrdinaryStockList<
	T = ResponseList<StockController.GetQueryOrdinaryStockList>,
>(params: StockController.GetOrdinaryStockList) {
	return request.get<T>(`${PREFIX}/getPackageOrdinaryStock`, { params });
}

// GET/api/admin/stock/1.0/getPackageOrdinaryStockDetails 查询医耗套包库存实例
export async function queryOrdinaryStockDetails<
	T = ResponseResult<StockController.GetQueryOrdinaryStockDetails[]>,
>(params: StockController.GetOrdinaryStockDetails) {
	return request.get<T>(`${PREFIX}/getPackageOrdinaryStockDetails`, { params });
}

// GET/api/admin/stock/1.0/getPackageSurgicalStock 查询手术套包库存

// GET/api/admin/stock/1.0/getPackageSurgicalStockDetails 查询手术套包库存实例

// GET/api/admin/stock/1.0/getReagentPackageBulkStock 指定科室查看定数包库存(试剂,质控品,定标品,生化耗品)

// GET/api/admin/stock/1.0/getReagentRepositoryStockWithPage 指定科室查看商品库存(试剂,质控品,定标品,生化耗品)

// GET/api/admin/stock/1.0/getRepositoryStockWithPage 商品仓库库存
export async function queryGoodsStockList<
	T = ResponseList<StockController.GetQueryGoodsStockListList[]>,
>(params: StockController.GetGoodsStockListList) {
	return request.get<T>(`${PREFIX}/getRepositoryStockWithPage`, { params });
}

// GET/api/admin/stock/1.0/getStockDetails getStockDetails 基础物资仓库库存详情
export async function getStockDetails<
	T = ResponseResult<StockController.GetQueryGoodsStockDetails[]>,
>(params: StockController.GetStockDetails) {
	return request.get<T>(`${PREFIX}/getStockDetails`, { params });
}

// GET/api/admin/stock/1.0/getStockWithPage 商品在途库存

export async function getStockWithPage<T = ResponseList<StockController.GetQueryStockWithPage>>(
	params: StockController.GetStockWithPage,
) {
	return request.get<T>(`${PREFIX}/getStockWithPage`, { params });
}

// GET/api/admin/stock/1.0/getSupplierStock 配送商业库存查询

// GET/api/admin/stock/1.0/goods/export 导出商品仓库库存

// GET/api/admin/stock/1.0/invoicing/export 进销存导出

// GET/api/admin/stock/1.0/packageBulk/export 导出定数包库存

// GET/api/admin/stock/1.0/packageItemGoods 查询包实例中的商品详情

// GET/api/admin/stock/1.0/packageOrdinary/export ordinaryExport

// GET/api/admin/stock/1.0/packageSurgical/export export

// POST/api/admin/stock/1.0/putOffShelf 下架

// POST/api/admin/stock/1.0/putOnShelf 上架

// GET/api/admin/stock/1.0/reagent/goods/export 导出商品库存(试剂,质控品,定标品,生化耗品)

// GET/api/admin/stock/1.0/reagent/packageBulk/export 指定科室导出定数包库存(试剂,质控品,定标品,生化耗品)

// GET/api/admin/stock/1.0/supplierStock/export 配送商业库存查询导出
