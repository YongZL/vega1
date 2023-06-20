// storage-areas-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/storageAreas/1.0';

// GET/api/admin/storageAreas/1.0/sortListByLevel 根据条件查询库房优先级列表
export async function sortListByLevel<
  T = ResponseResult<StorageAreasController.StorageAreaRecord[]>,
>(params: { isCenterWarehouse?: boolean; warehouseIds?: number[]; isCurrentUser?: boolean }) {
  const { warehouseIds } = params || {};
  return request.get<T>(`${PREFIX}/sortListByLevel`, {
    params: {
      ...params,
      ...(warehouseIds && warehouseIds.length > 0 ? { warehouseIds: warehouseIds.join(',') } : {}),
    },
  });
}
// POST/api/admin/storageAreas/1.0/create 新增库区
export async function itemAdd<T = ResponseResult>(
  params: StorageAreasController.ItemAddRuleParams,
) {
  return request<T>(`${PREFIX}/create`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
// GET/api/admin/storageAreas/1.0/listByCentralWarehouse 查询中心库的库房列表  返回参数后端未定义且接口未应用
export async function listByCentralWarehouse<T = ResponseResult>() {
  return request.get<T>(`${PREFIX}/listByCentralWarehouse`);
}
// GET/api/admin/storageAreas/1.0/listByWarehouse 根据仓库id获取库房列表 返回参数后端未定义且接口未应用
export async function listByWarehouse<T = ResponseResult>(params: { warehouseId: number }) {
  return request.get<T>(`${PREFIX}/listByWarehouse`), { params };
}
// GET/api/admin/storageAreas/1.0/pageList 分页获取库房列表
export async function getList<T = ResponseList<StorageAreasController.GetDetailRuleParams>>(
  params: StorageAreasController.GetListRuleParams,
) {
  return request.get<T>(`${PREFIX}/pageList`, {
    params,
  });
}
// POST/api/admin/storageAreas/1.0/update 更新库区信息
export async function itemEdit<T = ResponseResult>(
  params: StorageAreasController.ItemAddRuleParams,
) {
  return request<T>(`${PREFIX}/update`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
// GET/api/admin/storageAreas/1.0/{id} 根据库房id获取详情
export function getDetail<T = ResponseResult<StorageAreasController.GetDetailRuleParams>>(
  id: string,
) {
  return request.get<T>(`${PREFIX}/${id}`);
}

// GET/api/admin/storageAreas/1.0/getAll 获取所有库房列表
export function getAll<T = ResponseResult<StorageAreasController.GetDetailRuleParams>>() {
  return request.get<T>(`${PREFIX}/getAll`);
}

// POST/api/admin/storageAreas/1.0/delete/{id} 根据id删除库房信息
