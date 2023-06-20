// SummaryReport Controller
import request from '@/utils/request';

const RS_PREFIX = '/api/rs/scanCountReport/1.0';

/* GET/api/rs/scanCountReport/1.0/queryConsumeList 消耗查询 */
export async function queryConsumeList<T = ResponseList<ScanCountReportController.ConsumeRecord>>(
	params: ScanCountReportController.ConsumeListParams,
) {
	return request<T>(`${RS_PREFIX}/queryConsumeList`, { params });
}

/* POST/api/rs/scanCountReport/1.0/returnGoods 消耗退货 */
export async function postReturnGoods<T = ResponseResult>(
	data: ScanCountReportController.ReturnGoodsParams,
) {
	return request.post<T>(`${RS_PREFIX}/returnGoods`, { data });
}

/* POST/api/rs/scanCountReport/1.0/consumeCount 扫码消耗提交 */
export async function consumeCount<T = ResponseResult>(
	data: ScanCountReportController.ConsumeCountParams,
) {
	return request.post<T>(`${RS_PREFIX}/consumeCount`, { data });
}

/* GET/api/rs/scanCountReport/1.0/code 扫码计数，校验试剂或设备条码 */
export async function getCode<T = ResponseResult<ScanCountReportController.ConsumeHandleRecord>>(
	params: ScanCountReportController.GetCodeParams,
) {
	return request<T>(`${RS_PREFIX}/code`, { params });
}

/* GET/api/rs/scanCountReport/1.0/findLowerExpirationDate 查询比当前条码更小的近效期数值 */
export async function findLowerExpirationDate<T = ResponseResult<string[]>>(params: {
	operatorBarcode: string;
}) {
	return request<T>(`${RS_PREFIX}/findLowerExpirationDate`, { params });
}

/* /api/rs/scanCountReport/1.0/scanCapacityUpdate 单次容量编辑 */
export async function scanCapacityUpdate<T = ResponseResult>(params: {
	goodsId: number | string;
	scanCapacity: number;
}) {
	return request<T>(`${RS_PREFIX}/scanCapacityUpdate`, { params });
}

// /* /api/rs/scanCountReport/1.0/findRealScanCapacity 查询当前单次容量 */
// export async function findRealScanCapacity<T = ResponseResult>(params: any) {
//   return request<T>(`${RS_PREFIX}/findRealScanCapacity`, { params });
// }

/* /api/rs/scanCountReport/1.0/findDepartmentAndWarehouse 查询科室+仓库信息 */
// export async function findDepartmentAndWarehouse<T = ResponseResult<ScanCountReportController.DepartmentAndWarehouseRecord[]>>() {

//   return request<T>(`${RS_PREFIX}/findDepartmentAndWarehouse`);
// }

/* /api/rs/scanCountReport/1.0/findOperatorInfo 查询操作人员id和名称 */
export async function findOperatorInfo<T = ResponseResult>() {
	return request<T>(`${RS_PREFIX}/findOperatorInfo`);
}

// /* /api/rs/scanCountReport/1.0/queryGoodsListByParam 获取试剂 */
// export async function queryGoodsListByParam(params: any) {
//   return request(`${RS_PREFIX}/queryGoodsListByParam`, { params });
// }

/* /api/rs/scanCountReport/1.0/findDistributorInfo 查询配送商业id和名称,可按首字母查询 */
export async function findDistributorInfo<T = ResponseResult>() {
	return request<T>(`${RS_PREFIX}/findDistributorInfo`);
}

/* /api/rs/scanCountReport/1.0/warehouseContextSave 设置扫码计数科室列表，默认为用户所属科室列表 */
export async function warehouseContextSave<T = ResponseResult>(ids: number[]) {
	return request<T>(`${RS_PREFIX}/warehouseContextSave?warehouseIds=${ids.join(',')}`);
}
