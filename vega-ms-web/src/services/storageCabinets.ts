// storage-cabinets-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/storageCabinets/1.0';

// GET/api/admin/storageCabinets/1.0/getStorageAreaByLocBarcode 根据货位号查询库房
export async function getStorageAreaByLocBarcode<T = ResponseResult>(params: {
  storageLocBarcode: string;
}) {
  return request.get<T>(`${PREFIX}/getStorageAreaByLocBarcode`, {
    params,
  });
}

// POST/api/admin/storageCabinets/1.0 新增货架
export async function itemAdd<T = ResponseResult>(
  params: StorageCabinetsController.ItemAddRuleParams,
) {
  return request<T>(PREFIX, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// GET/api/admin/storageCabinets/1.0/listByStorageArea 根据库房id获取货柜列表
export async function listByStorageArea<
  T = ResponseResult<StorageCabinetsController.CabinetsRecord[]>,
>(params: { storageAreaId: number }) {
  return request.get<T>(`${PREFIX}/listByStorageArea`, {
    params,
  });
}

// GET/api/admin/storageCabinets/1.0/pageList 分页获取货柜列表
export async function storageGetList<
  T = ResponseList<StorageCabinetsController.GetListRuleParamsList>,
>(params: StorageCabinetsController.GetListRuleParams) {
  return request.get<T>(`${PREFIX}/pageList`, {
    params,
  });
}

// GET/api/admin/storageCabinets/1.0/{id} 根据id获取货柜详情
export async function storageGetDetail<
  T = ResponseResult<StorageCabinetsController.ItemAddRuleParams>,
>(id: string) {
  return request.get<T>(`${PREFIX}/${id}`);
}

// POST/api/admin/storageCabinets/1.0/{id} 更新货架信息
export async function itemEdit<T = ResponseResult>(
  params: StorageCabinetsController.ItemAddRuleParams,
) {
  return request<T>(`${PREFIX}/${params.id}`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// POST/api/admin/storageCabinets/1.0/delete/{id} 根据id删除货柜信息
export async function itemDelete<T = ResponseResult>(id: string) {
  return request<T>(`${PREFIX}/delete/${id}`, {
    method: 'POST',
  });
}

// /api/admin/storageCabinets/1.0/uploadLocation 货位导入上传
export const uploadLocationApi = `${PREFIX}/uploadLocation`;
