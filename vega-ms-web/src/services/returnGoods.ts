// return-goods-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/returnGoods/1.0';

// POST/api/admin/returnGoods/1.0/approve 审核
export function approve<T = ResponseResult>(params?: ReturnGoodsController.ConfirmType) {
	return request.post<T>(`${PREFIX}/approve`, { data: params });
}

// POST/api/admin/returnGoods/1.0/confirm 确认
export function confirm<T = ResponseResult>(params?: ReturnGoodsController.ConfirmType) {
	return request.post<T>(`${PREFIX}/confirm`, { data: params });
}

// POST/api/admin/returnGoods/1.0/delivered 科室退货送达中心库
export function confirmDelivered<T = ResponseResult>(params?: {
	itemsIds: number[];
	returnGoodsId?: number;
}) {
	return request.post<T>(`${PREFIX}/delivered`, { data: params });
}

// GET/api/admin/returnGoods/1.0/findReturnablePackageBulkGoods 查询科室可以退的定数包里面的商品
export function findBulkGoods<
	T = ResponseResult<ReturnGoodsController.ListDepartmentRecord[]>,
>(params?: {
	packageBulkItemId: string; // 定数包实例id
	warehouseId: string; //仓库id
}) {
	return request.get<T>(`${PREFIX}/findReturnablePackageBulkGoods`, { params });
}

// GET/api/admin/returnGoods/1.0/findReturnableSurgicalPackageGoods 查询科室可以退的手术套包里面的商品
export function findSurgicalGoods<T = ResponseResult>(params?: {
	packageSurgicalItemId: string;
	warehouseId: string;
}) {
	return request.get<T>(`${PREFIX}/findReturnableSurgicalPackageGoods`, { params });
}

// GET/api/admin/returnGoods/1.0/getDetails 查询退货单商品

// GET/api/admin/returnGoods/1.0/getDetailsByMessageType 查询退货单商品

// GET/api/admin/returnGoods/1.0/getDetailsSeparated 查询退货单详情，按照商品、定数包、手术套包分开
export function getDetail<T = ResponseResult<ReturnGoodsController.ReturnGoodsDetailRecord>>(
	params: ReturnGoodsController.ReturnGoodsDetailParams,
) {
	return request.get<T>(`${PREFIX}/getDetailsSeparated`, { params });
}

// GET/api/admin/returnGoods/1.0/getQueryWithPage 分页查询退货信息

// GET/api/admin/returnGoods/1.0/getReturnGoods 查询退货单详情

// GET/api/admin/returnGoods/1.0/getReturnGoodsByMessageType 查询退货单详情

// GET/api/admin/returnGoods/1.0/getWithPage 分页查询退货信息
export function getList<T = ResponseList<ReturnGoodsController.ReturnGoodsRecord>>(
	params: ReturnGoodsController.GetWithPageParams,
) {
	return request.get<T>(`${PREFIX}/getWithPage`, { params });
}

// GET/api/admin/returnGoods/1.0/listDepartmentReturnable 查询科室可以退货列表
export function getReturnable<T = ResponseList<ReturnGoodsController.ListDepartmentRecord>>(
	params: ReturnGoodsController.ReturnableType,
) {
	return request.get<T>(`${PREFIX}/listDepartmentReturnable`, { params });
}

// POST/api/admin/returnGoods/1.0/makeDepartmentReturnGoods 制作科室退货单
export function submitDepartmentData<T = ResponseResult>(
	params: ReturnGoodsController.CenterSubmitParams,
) {
	return request.post<T>(`${PREFIX}/makeDepartmentReturnGoods`, { data: params });
}

// POST/api/admin/returnGoods/1.0/makeReturnGoods 中心库制作退货单
export function submitData<T = ResponseResult>(params: ReturnGoodsController.CenterSubmitParams) {
	return request.post<T>(`${PREFIX}/makeReturnGoods`, { data: params });
}

// POST/api/admin/returnGoods/1.0/returningGoods 中心库扫码退货
export function returnGoods<T = ResponseResult>(params: ReturnGoodsController.ReturnType) {
	return request.post<T>(`${PREFIX}/returningGoods`, { data: params });
}

// GET/api/admin/returnGoods/1.0/search 扫描查询需要退货的物品（商品、定数包、手术套包）
export function submitCode<T = ResponseResult>(params: ReturnGoodsController.SubmitCodeType) {
	return request.get<T>(`${PREFIX}/search`, { params });
}

// GET/api/admin/returnGoods/1.0/searchDepartmentReturnable 扫码搜索科室可退货物资
export function submitDepartmentCode<
	T = ResponseResult<ReturnGoodsController.ListDepartmentRecord[]>,
>(params: ReturnGoodsController.SubmitCodeType) {
	return request.get<T>(`${PREFIX}/searchDepartmentReturnable`, { params });
}
/* GET/api/admin/returnGoods/1.0/notBarcodeControllerReturnGoodsList 查询中心库非条码管控物资列表 **/
export function notBarcodeControllerList<
	T = ResponseResult<ReturnGoodsController.NotBarcodeControllerListRecord[]>,
>(params: ReturnGoodsController.NotBarcodeControllerListParams) {
	return request.get<T>(`${PREFIX}/notBarcodeControllerReturnGoodsList`, { params });
}
/* POST/api/admin/returnGoods/1.0/confirmReturningGoods 中心库扫码退货-非条码管控(确认退货) **/
export function confirmReturn<T = ResponseResult>(data: ReturnGoodsController.ConfirmReturnData) {
	return request.post<T>(`${PREFIX}/confirmReturningGoods`, { data });
}
