// 配送商业基础数据相关操作 distributor-authorization-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/distributorAuthorization/1.0';

// GET /api/admin/distributorAuthorization/1.0/getAuthorizationList 获取授权书列表
export function getPageList<T = ResponseList<DistributorAuthorizationController.ListRecord[]>>(
  params: DistributorAuthorizationController.TableListPager,
) {
  return request.get<T>(`${PREFIX}/getAuthorizationList`, { params });
}

// POST /api/admin/distributorAuthorization/1.0/operate 启用/禁用
export function setEnabled<T = ResponseResult>(data: Record<string, any>) {
  return request.post<T>(`${PREFIX}/operate`, { data });
}

// GET /api/admin/distributorAuthorization/1.0/pageList 分页获取配送商业授权 一级配送商业授权书列表
export function getAuthList<T = ResponseList<DistributorAuthorizationController.ListRecord[]>>(
  params: Record<string, any>,
) {
  return request.get<T>(`${PREFIX}/pageList`, { params });
}

// POST /api/admin/distributorAuthorization/1.0/add 新增授权书
export function addAuth<T = ResponseResult>(data: Record<string, any>) {
  return request.post<T>(`${PREFIX}/add`, { data });
}

// POST /api/admin/distributorAuthorization/1.0/edit 编辑授权书
export function editAuth<T = ResponseResult>(data: Record<string, any>) {
  return request.post<T>(`${PREFIX}/edit`, { data });
}

// GET /api/admin/distributorAuthorization/1.0/view 根据授权书id获取授权书详情
export function getAuthDetailByAuthId<
  T = ResponseResult<DistributorAuthorizationController.AuthDetailData>,
>(params: { id: number }) {
  return request.get<T>(`${PREFIX}/view`, { params });
}

// POST /api/admin/distributorAuthorization/1.0/checkBeforeDeletingMaterial 判断改物资是否可以删除
export function checkBeforeDeletingMaterial<T = ResponseResult<[]>>(
  data: DistributorAuthorizationController.CheckGoodsParams,
) {
  return request.post<T>(`${PREFIX}/checkBeforeDeletingMaterial`, { data });
}

// GET /api/admin/distributorAuthorization/1.0/getAuthorizableDistributorList 新增配送商业-获取被授权配送商
export function getCustodianList<
  T = ResponseResult<DistributorAuthorizationController.DistributorListRecord[]>,
>(distributorId: number) {
  return request.get<T>(`${PREFIX}/getAuthorizableDistributorList/${distributorId}`);
}

// GET /api/admin/distributorAuthorization/1.0/getAuthorizationGoods 授权书中基础物资信息
export function getAuthGoodList<
  T = ResponseList<DistributorAuthorizationController.GoodsListRecord[]>,
>(params: DistributorAuthorizationController.GoodsListPager) {
  return request.get<T>(`${PREFIX}/getAuthorizationGoods`, { params });
}

// GET/api/admin/distributorAuthorization/1.0/getAuthorizationGoods/{id} 获取授权书中的商品信息
export function getAuthGoodInfo<
  T = ResponseList<DistributorAuthorizationController.GoodsListRecord>,
>(params: DistributorAuthorizationController.GoodsListPager) {
  return request.get<T>(`${PREFIX}/getAuthorizationGoods/${params.id}`, { params });
}

// GET/api/admin/distributorAuthorization/1.0/getAuthorizationList 获取授权书列表

// GET/api/admin/distributorAuthorization/1.0/getEnabledAuthorizingDistributor 获取存在启用中的被授权关系列表
export function getEnabledAuthorizingDistributor<
  T = ResponseResult<Partial<DistributorAuthorizationController.GetEnabledAuthorizingDistributorRes>[]>,
>(params: { ids: number[] }) {
  const idsStr = params.ids.map((id) => `ids=${id}`).join('&')
  return request.get<T>(`${PREFIX}/getEnabledAuthorizingDistributor?${idsStr}`);
}
