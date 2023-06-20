// goodsTypes-controller 物资
import request from '@/utils/request';

const PREFIX = '/api/admin/goodsTypes/1.0';
const RS_PREFIX = '/api/rs/goodsTypes/1.0';

//get /api/admin/goodsTypes/1.0/goodsFindDepartment 物资批量绑定科室时（获取物资）
export function getGoodsData<T = ResponseResult<GoodsTypesController.BatchList[]>>(
	params: GoodsTypesController.queryGoodsTypeParams,
) {
	return request.get<T>(`${PREFIX}/goodsFindDepartment`, { params });
}

//GET /api/admin/goodsTypes/1.0/pageListWithoutPrice 分页获取商品列表（去处价格）
export function getWithoutPriceList<T = ResponseList<GoodsTypesController.WithoutPriceListRecord>>(
	params: GoodsTypesController.WithoutPricePager,
) {
	return request.get<T>(`${PREFIX}/pageListWithoutPrice`, { params });
}

// POST/api/admin/goodsTypes/1.0/add 新增商品
export async function addGoods<T = ResponseResult>(data: NewGoodsTypesController.GoodsRecord) {
	return request.post<T>(`${PREFIX}/add`, { data });
}

// POST/api/admin/goodsTypes/1.0/batchUpdateStatus 批量修改物资状态
export function batchUpdateStatus<T = ResponseResult>(data: {
	enabled?: boolean;
	goodsIds: number[];
}) {
	return request.post<T>(`${PREFIX}/batchUpdateStatus`, { data });
}

// POST/api/admin/goodsTypes/1.0/bindDI 商品绑定DI码
export function bindDI<T = ResponseResult>(data: { diCode: string; goodsId: number }) {
	return request.post<T>(`${PREFIX}/bindDI`, { data });
}

// POST/api/admin/goodsTypes/1.0/edit 修改商品
export async function editGoods<T = ResponseResult>(data: NewGoodsTypesController.GoodsRecord) {
	return request.post<T>(`${PREFIX}/edit`, { data });
}

// GET/api/admin/goodsTypes/1.0/export 导出商品
export const exportGoodsTypes = `${PREFIX}/export`;

// GET/api/admin/goodsTypes/1.0/getGoodsByDepartment 根据部门获取商品列表，去除已生成定数包的
export function getGoodsByDepartment<
	T = ResponseList<GoodsTypesController.GoodsByDepartmentRecord[]>,
>(params: GoodsTypesController.GoodsByDepartmentParams) {
	return request.get<T>(`${PREFIX}/getGoodsByDepartment`, { params });
}

// GET/api/admin/goodsTypes/1.0/getSurgicalGoods 获取组合商品

// GET/api/admin/goodsTypes/1.0/pageList 分页获取商品列表

// POST/api/admin/goodsTypes/1.0/setDefaultSupplier 设置默认的供应商

// GET/api/admin/goodsTypes/1.0/supplierGoods 获取供应商关联的商品信息

// POST/api/admin/goodsTypes/1.0/upload 导入商品

// GET/api/admin/goodsTypes/1.0/{id} 根据id获取商品详情

// GET/api/admin/goodsTypes/1.0/goodsFindDepartment 科室绑定时查询物资信息

/* GET/api/admin/goodsTypes/1.0/getGoodsField 获取物资属性字段信息 */
export async function getGoodsField<T = ResponseResult<GoodsTypesController.GoodsField[]>>() {
	return request<T>(`${PREFIX}/getGoodsField`);
}

// // 试剂消耗业务
// /* GET/api/admin/goodsTypes/1.0/queryGoodsListByParam 获取试剂号/名 */
// export async function queryGoodsListByParam<T = ResponseResult<GoodsTypesController.GoodsField[]>>(params: { goodsName: string }) {
//   return request<T>(`${RS_PREFIX}/queryGoodsListByParam`, { params });
// }
