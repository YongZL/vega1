// consume-controller
import request from '@/utils/request';
const PREFIX = '/api/admin/consume/1.0';
const RS_PREFIX = '/api/rs/consume/1.0';
const MS_PREFIX = '/api/ms/consume/1.0';
const systemType = sessionStorage.getItem('systemType');
const AUTO_PREFIX = systemType === 'Insight_MS' ? MS_PREFIX : RS_PREFIX;

// POST/api/:systemType/consume/1.0/batchConsume 批量消耗
export function batchConsume<T = ResponseResult<ConsumeController.SearchGoodsInfo[]>>(
	data: ConsumeController.BatchConsumeParams,
) {
	return request.post<T>(`${AUTO_PREFIX}/batchConsume`, { data });
}

// POST/api/:systemType/consume/1.0/batchUnconsume 扫码反消耗
export function batchUnConsume<T = ResponseResult<ConsumeController.SearchGoodsInfo[]>>(
	data: ConsumeController.BatchUnConsumeParams,
) {
	return request.post<T>(`${AUTO_PREFIX}/batchUnconsume`, { data });
}

// POST/api/:systemType/consume/1.0/consume 扫码消耗
export function consume<T = ResponseResult>(data: ConsumeController.ConsumeParams) {
	return request.post<T>(`${AUTO_PREFIX}/consume`, { data });
}

// GET/api/admin/consume/1.0/exportGoodsConsume 导出商品消耗记录

// GET/api/admin/consume/1.0/exportGoodsUnconsumeRecords 导出商品反消耗记录

// GET/api/admin/consume/1.0/exportOrdinaryConsume 导出医耗套包消耗记录

// GET/api/admin/consume/1.0/exportPackageBulkConsume 导出定数包消耗记录

// GET/api/admin/consume/1.0/exportPackageBulkUnconsumeRecords 导出定数包反消耗记录

// GET/api/admin/consume/1.0/exportPackageSurgicalUnconsumeRecords 导出手术套包反消耗记录

// GET/api/admin/consume/1.0/exportSurgicalPackageConsume 导出手术套包消耗记录

// GET/api/admin/consume/1.0/getConsumeDetails 查询消耗记录详情
export async function queryConsumeDetails<
	T = ResponseResult<ConsumeController.QueryConsumeDetails[]>,
>(params: { goodsItemId: number }) {
	return request.get<T>(`${PREFIX}/getConsumeDetails`, {
		params,
	});
}

// GET/api/admin/consume/1.0/getGoodsConsumeWithPage 分页查询商品消耗记录
export async function queryGoodsConsumeList<
	T = ResponseResult<ConsumeController.QueryGoodsConsumeList>,
>(params: ConsumeController.GoodsConsumeList) {
	return request.get<T>(`${PREFIX}/getGoodsConsumeWithPage`, {
		params,
	});
}
// GET/api/admin/consume/1.0/getOrdinaryConsumeDetails 查询医耗套包记录详情

export async function getOrdinaryConsumeDetails<
	T = ResponseResult<ConsumeController.QueryGetOrdinaryConsumeDetails[]>,
>(params: { ordinaryItemId: number }) {
	return request.get<T>(`${PREFIX}/getOrdinaryConsumeDetails`, {
		params,
	});
}
// GET/api/admin/consume/1.0/getOrdinaryConsumeWithPage 分页查询医耗套包消耗记录
export async function queryordinaryConsumeList<
	T = ResponseList<ConsumeController.QueryordinaryConsumeList>,
>(params: ConsumeController.OrdinaryConsumeList) {
	return request.get<T>(`${PREFIX}/getOrdinaryConsumeWithPage`, {
		params,
	});
}

// GET/api/admin/consume/1.0/getPackageBulkConsumeWithPage 分页查询定数包消耗记录   //项目中以无定数包

// GET/api/admin/consume/1.0/getPackageBulkUnconsumeDetail 查询定数包反消耗明细

// GET/api/admin/consume/1.0/getPackageSurgicalUnconsumeDetail 查询手术套包反消耗明细

// GET/api/admin/consume/1.0/getSurgicalPackageConsumeWithPage 分页查询手术套包消耗记录

// GET/api/admin/consume/1.0/goodsUnconsumeRecords 查询商品反消耗记录

// GET/api/admin/consume/1.0/packageBulkUnconsumeRecords 查询定数包反消耗记录

// GET/api/admin/consume/1.0/packageSurgicalUnconsumeRecords 查询手术套包反消耗记录

// GET/api/admin/consume/1.0/search 查询物资（商品、套包）
export function searchDate<T = ResponseResult<ConsumeController.SearchGoodsInfo>>(
	params: ConsumeController.SearchDateParams,
) {
	return request.get<T>(`${PREFIX}/search`, { params });
}

// POST/api/systemType/consume/1.0/searchAndConsume 查询并消耗
export function postSearchAndConsume<T = ResponseResult<Record<string, any>>>(
	data: ConsumeController.SearchConsumeParams,
) {
	return request.post<T>(`${AUTO_PREFIX}/searchAndConsume`, { data });
}

// POST/api/admin/consume/1.0/searchAndConsume 查询并消耗

// POST/api/admin/consume/1.0/unconsume 扫码反消耗
export function unconsumefun<T = ResponseResult>(params: { barcode: string; consumeId?: number }) {
	return request<T>(`${AUTO_PREFIX}/unconsume`, {
		method: 'POST',
		data: {
			...params,
		},
	});
}

// GET/api/admin/consume/1.0/updateReturnGoodsToConsumeData updateReturnGoodsToConsumeData

/* GET /api/admin/consume/1.0/warehouseContextSave 设置扫码消耗仓库 */
export async function consumeWarehouseSave<T = ResponseResult>(ids: number[]) {
	return request<T>(`${PREFIX}/warehouseContextSave?warehouseIds=${ids.join(',')}`);
}

/* GET /api/ms/warehouseContext/1.0/warehouseContextSave 设置扫码消耗科室消耗兼容仓库 */
export async function msConsumeWarehouseSave<T = ResponseResult>(warehouseId: number) {
	return request<T>(`/api/ms/warehouseContext/1.0/warehouseContextSave?warehouseId=${warehouseId}`);
}
