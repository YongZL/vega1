// distributor-controller 配送商业
import request from '@/utils/request';

const PREFIX = '/api/admin/distributor/1.0';

// GET /api/admin/distributor/1.0/pageList 分页获取配送商业列表
export function getPageList<T = ResponseList<DistributorController.ListRecord>>(
	params: DistributorController.TableListPager,
) {
	return request.get<T>(`${PREFIX}/pageList`, { params });
}
// GET /api/admin/distributor/1.0/getAllDistributors 获取所有配送商业列表
export function getAllDistributors<
	T = ResponseResult<DistributorController.DistributorsRecord[]>,
>() {
	return request.get<T>(`${PREFIX}/getAllDistributors`);
}

// GET /api/admin/distributor/1.0/findAllDistributorByGoodsId 获取物资绑定的配送商
export function getFindAllDistributorByGoodsId<
	T = ResponseResult<DistributorController.DistributorsRecord[]>,
>(goodsId: number) {
	return request.get<T>(`${PREFIX}/findAllDistributorByGoodsId`, { params: { goodsId } });
}

// POST /api/admin/distributor/1.0/operateDistributorByGoodsId 编辑供货渠道保存
export function setOperateDistributorByGoodsId<T = ResponseResult>(
	data: DistributorController.OperateDistributorByGoodsId,
) {
	return request.post<T>(`${PREFIX}/operateDistributorByGoodsId`, { data });
}

// GET /api/admin/distributor/1.0/getDistributorByUser 根据当前用户查列表
export function getListByUser<T = ResponseResult<DistributorController.ListRecord[]>>(
	params: DistributorController.TableListPager,
) {
	return request.get<T>(`${PREFIX}/getDistributorByUser`, { params });
}

// GET /api/admin/distributor/1.0/get 配送商业详情
export function getDistributorDetail<T = ResponseResult<DistributorController.DetailData>>(
	params: DistributorController.DetailParams,
) {
	return request.get<T>(`${PREFIX}/get/${params.id}`, { params });
}

// GET /api/admin/distributor/1.0/get 配送商业新增详情
export function getDistributorDetailById<T = ResponseResult<DistributorController.DetailData>>(
	id: number,
) {
	return request.get<T>(`${PREFIX}/get/${id}`);
}

// POST /api/admin/distributor/1.0/create 新增配送商业
export function addDistributor<T = ResponseResult>(
	data: DistributorController.AddOrEditDistributorParams,
) {
	return request.post<T>(`${PREFIX}/create`, { data });
}

// POST /api/admin/distributor/1.0/update 编辑配送商业
export function editDistributor<T = ResponseResult>(
	id: number,
	data: DistributorController.AddOrEditDistributorParams,
) {
	return request.post<T>(`${PREFIX}/update/${id}`, { data });
}

// POST /api/admin/distributor/1.0/operate 启用/禁用配送商业
export function setEnable<T = ResponseResult>(data: DistributorController.EnableParams) {
	return request.post<T>(`${PREFIX}/operate`, { data });
}

// POST /api/admin/distributor/1.0/operateBatch 1启用 2:禁用 批量启用/禁用配送商业
export function setBatchEnable<T = ResponseResult>(
	type: number,
	data: DistributorController.BatchEnableParams,
) {
	return request.post<T>(`${PREFIX}/operateBatch/${type}`, { data: data.ids });
}

// GET /api/admin/distributor/1.0/getNearExpireAndExpired 获取经营许可30天内过期的个数，及过期的个数
export function getNearExpireAndExpired<T = ResponseResult<DistributorController.NearExpireData>>(
	day: number,
) {
	return request.get<T>(`${PREFIX}/getNearExpireAndExpired/${day}`);
}

// POST /api/admin/distributor/1.0/setAccountPeriod 设置账期
export function setAccountPeriod<T = ResponseResult>(
	params: DistributorController.AccountPeriodParams,
) {
	return request.post<T>(`${PREFIX}/setAccountPeriod`, { params });
}

// POST /api/admin/distributor/1.0/setAccountPeriodBatch 批量设置账期
export function setAccountPeriodBatch<T = ResponseResult>(
	data: DistributorController.AccountPeriodParams,
) {
	return request.post<T>(`${PREFIX}/setAccountPeriodBatch`, { data });
}

// GET /api/admin/distributor/1.0/distributorListByInvoiceSync 根据是否货票同行获取配送商业
export function getListByInvoiceSync<T = ResponseResult<DistributorController.InvoiceSyncRecord[]>>(
	params: DistributorController.InvoiceSyncParams,
) {
	return request.get<T>(`${PREFIX}/distributorListByInvoiceSync`, { params });
}

// POST /api/admin/distributor/1.0/pageList 新增/编辑生产厂家
export function updateManufacturer<T = ResponseResult>(data: Record<string, any>) {
	return request.post<T>(`${PREFIX}/pageList`, { data });
}

// GET/api/admin/distributor/1.0/list 获取配送商业列表（hospital）

// GET/api/admin/distributor/1.0/nonDesignated/{id} 获取可授权的配送商业，排除指定id

// GET/api/admin/distributor/1.0/DistributorRecordVoucherScope/{id} 获取配送商业经营范围

// GET/api/admin/distributor/1.0/LicenseDistributorBusinessScope/{id} 获取配送商业经营范围

// GET/api/admin/distributor/1.0/LicenseDistributorPermitScope/{id} 获取配送商业经营范围

// GETapi/admin/warehouses/1.0/getDistributorFiled 获取配送商业字段信息 */
export async function getDistributorFiled<
	T = ResponseResult<DistributorController.DistributorFiled[]>,
>() {
	return request<T>(`${PREFIX}/getDistributorFiled`);
}
