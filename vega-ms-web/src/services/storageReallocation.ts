// 库房调拨单接口 Storage Reallocate Controller
import request from '@/utils/request';

const PREFIX = '/api/admin/storage/reallocate/1.0';

// GET /api/admin/storage/reallocate/1.0/pageList 分页查询列表
export function pageList<T = ResponseList<StorageReallocateController.ReallocateRecord>>(
  params: StorageReallocateController.PageListParams,
) {
  return request.get<T>(`${PREFIX}/pageList`, {
    params,
  });
}

// GET /api/admin/storage/reallocate/1.0/selectStorageAreaList 供货/到货下拉框列表
export function selectStorageAreaList<
  T = ResponseResult<StorageReallocateController.AreaRecord[]>,
>(params: {
  type: 'source' | 'target'; // 类型 source-供货 target-到货
  id?: number;
}) {
  return request.get<T>(`${PREFIX}/selectStorageAreaList`, { params });
}

// POST /api/admin/storage/reallocate/1.0/export 导出
export function exportFile<T = ResponseResult<string>>(data: { ids: number[] }) {
  return request.post<T>(`${PREFIX}/export`, { data });
}

// POST /api/admin/storage/reallocate/1.0/operationEntryStorage/{storageReallocateId} 送达入库
export function operationEntryStorageById<T = ResponseResult>(id: number) {
  return request.post<T>(`${PREFIX}/operationEntryStorage/${id}`);
}

// POST /api/admin/storage/reallocate/1.0/closeReallocateOrder/{storageReallocateId} 结束订单
export function closeReallocateOrderById<T = ResponseResult>(id: number) {
  return request.post<T>(`${PREFIX}/closeReallocateOrder/${id}`);
}

// GET /api/admin/storage/reallocate/1.0/detail 查看
export function getDetail<
  T = ResponseResult<StorageReallocateController.ReallocateDetailRecord[]>,
>(params: { storageReallocateId: number }) {
  return request.get<T>(`${PREFIX}/detail`, { params });
}

// GET /api/admin/storage/reallocate/1.0/detailItem 调拨单详情明细
export function getDetailItem<T = ResponseResult<string[]>>(params: StorageReallocateController.DetailItemParams) {
  return request.get<T>(`${PREFIX}/detailItem`, { params });
}
// GET /api/admin/storage/reallocate/1.0/applyGoodsList 申请物资列表
export function getApplyGoodsList<T = ResponseResult<string[]>>(
  params: StorageReallocateController.GetApplyGoodsListParams,
) {
  return request.get<T>(`${PREFIX}/applyGoodsList`, { params });
}
// POST /api/admin/storage/reallocate/1.0/create 申请(创建)库房调拨单
export function create<T = ResponseResult>(data: StorageReallocateController.createData) {
  return request.post<T>(`${PREFIX}/create`, { data });
}
