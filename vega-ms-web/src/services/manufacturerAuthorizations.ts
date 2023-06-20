// manufacturer-authorization-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/manufacturerAuthorizations/1.0';

// GET/api/admin/manufacturerAuthorizations/1.0 根据厂商id和配送商业id获取授权书列表

// POST/api/admin/manufacturerAuthorizations/1.0/add 添加配送商业授权书

// POST/api/admin/manufacturerAuthorizations/1.0/distributor/add 添加配送商业授权书
export function addAuth<T = ResponseResult>(data: Record<string, any>) {
	return request.post<T>(`${PREFIX}/distributor/add`, { data });
}

// POST/api/admin/manufacturerAuthorizations/1.0/distributor/edit 修改配送商业授权书
export function editAuth<T = ResponseResult>(data: Record<string, any>) {
	return request.post<T>(`${PREFIX}/distributor/edit`, { data });
}

// GET/api/admin/manufacturerAuthorizations/1.0/distributor/getAuthorizationGoods 获取授权书中的商品信息
export function getAuthorizationGoods<
	T = ResponseList<ManufacturerAuthorizationsController.GoodsListRecord[]>,
>(params: ManufacturerAuthorizationsController.GoodsListPager) {
	return request.get<T>(`${PREFIX}/distributor/getAuthorizationGoods`, { params });
}

// GET /api/admin/manufacturerAuthorizations/1.0/distributor/getAuthorizationList 生产厂家授权【新配送商业】
export function getPageList<T = ResponseList<ManufacturerAuthorizationsController.ListRecord[]>>(
	params: ManufacturerAuthorizationsController.TableListPager,
) {
	return request.get<T>(`${PREFIX}/distributor/getAuthorizationList`, { params });
}

// GET /api/admin/manufacturerAuthorizations/1.0/distributor/list 新配送商业获取授权书列表
export function getManufacturerAuthList<
	T = ResponseList<ManufacturerAuthorizationsController.AuthListRecord[]>,
>(params: ManufacturerAuthorizationsController.AuthListPager) {
	return request.get<T>(`${PREFIX}/distributor/list`, { params });
}

// GET/api/admin/manufacturerAuthorizations/1.0/distributor/pageList 分页获取授权书列表
export function getAuthList<T = ResponseList<ManufacturerAuthorizationsController.ListRecord[]>>(
	params: ManufacturerAuthorizationsController.TableListPager,
) {
	return request.get<T>(`${PREFIX}/distributor/pageList`, { params });
}

// POST/api/admin/manufacturerAuthorizations/1.0/distributor/setEnabled/{type} 启用授权书
export function setEnabled<T = ResponseResult>(
	type: number,
	data: ManufacturerAuthorizationsController.EnabledParams,
) {
	return request.post<T>(`${PREFIX}/distributor/setEnabled/${type}`, { data });
}

// GET/api/admin/manufacturerAuthorizations/1.0/distributor/{id} 根据id获取授权书详情
export function getAuthDetailById<
	T = ResponseResult<DistributorAuthorizationController.AuthDetailData>,
>(id: number) {
	return request.get<T>(`${PREFIX}/distributor/${id}`);
}

// POST/api/admin/manufacturerAuthorizations/1.0/edit 修改配送商业授权书

// GET/api/admin/manufacturerAuthorizations/1.0/getAuthorizationList 获取授权书列表

// GET/api/admin/manufacturerAuthorizations/1.0/pageList 分页获取授权书列表

// POST/api/admin/manufacturerAuthorizations/1.0/setDisabled 禁用授权书

// POST/api/admin/manufacturerAuthorizations/1.0/setEnabled 启用授权书

// GET/api/admin/manufacturerAuthorizations/1.0/{id} 根据id获取授权书详情
