// stock-taking-order-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/stockTakingOrder/1.0';

// POST/api/admin/stockTakingOrder/1.0/generateStockTakingOrder 生成盘库单
export function generateStockTakingOrder<T = ResponseResult>(
  params: StockTakingOrderController.GenerateStockTakingOrder,
) {
  return request<T>(`${PREFIX}/generateStockTakingOrder`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// GET/api/admin/stockTakingOrder/1.0/getDetails 查询盘库单明细
export async function getStockDetails<
  T = ResponseList<StockTakingOrderController.GetStockQueryDetails>,
>(params: StockTakingOrderController.GetStockDetails) {
  return request.get<T>(`${PREFIX}/getDetails`, {
    params,
  });
}

// GET/api/admin/stockTakingOrder/1.0/getList 查询盘库列表
export async function getStockList<
  T = ResponseList<StockTakingOrderController.GetDetailRuleParams>,
>(params: StockTakingOrderController.GetListRuleParams) {
  return request.get<T>(`${PREFIX}/getList`, {
    params,
  });
}

// GET/api/admin/stockTakingOrder/1.0/getOnDetail 根据商品code查询商品盘库信息   返回参数后端未定义，且无应用该接口
export async function getOnDetail<T = ResponseResult>(params: {
  code?: string;
  stockTakingOrderId: number;
}) {
  return request.get<T>(`${PREFIX}/getOnDetail`, { params });
}

// POST/api/admin/stockTakingOrder/1.0/solvingStockError 提交盘盈、盘亏原因和解决办法
export function solvingStockError<T = ResponseResult>(
  params: StockTakingOrderController.SolvingStockError,
) {
  return request<T>(`${PREFIX}/solvingStockError`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// POST/api/admin/stockTakingOrder/1.0/stockTaking 盘库
export function stockTaking<T = ResponseResult>(data: StockTakingOrderController.StockTaking) {
  return request.post<T>(`${PREFIX}/stockTaking`, { data });
}
// POST/api/admin/stockTakingOrder/1.0/stopStockTakingOrder/{id} 废除盘库
export function stopStockTakingOrder<T = ResponseResult>(id: string | number) {
  return request.post<T>(`${PREFIX}/stopStockTakingOrder/${id}`);
}

// POST/api/admin/stockTakingOrder/1.0/submitStockTakingOrder 提交盘库单
export function submitStockTakingOrder<T = ResponseResult>(params: { stockTakingOrderId: string }) {
  return request.post<T>(`${PREFIX}/submitStockTakingOrder`, { params });
}
// GET/api/admin/stockTakingOrder/1.0/{id} 查询盘库单
export async function getStockDetail<
  T = ResponseResult<StockTakingOrderController.GetStockDetailParams[]>,
>(id: number) {
  return request.get<T>(`${PREFIX}/${id}`);
}

// GET/api/admin/stockTakingOrder/1.0/getStorageAreaList 查询盘点仓库
export async function getStorageAreaList<
  T = ResponseResult<any>,
>(params: { pageType: 'handle' | 'query' }) {
  return request.get<T>(`${PREFIX}/getStorageAreaList`, { params });
}

// GET/api/admin/stockTakingOrder/1.0/getStockTakingOrderReasonList 盈亏原因列表
export async function getStockTakingOrderReasonList<
  T = ResponseResult<StockTakingOrderController.ReasonList[]>,
>() {
  return request.get<T>(`${PREFIX}/getStockTakingOrderReasonList`);
}

// GET/api/admin/stockTakingOrder/1.0/deleteStockTakingOrderReason/{id} 盈亏原因删除
export async function deleteStockTakingOrderReason<
  T = ResponseResult<any>,
>(id: string | number) {
  return request.delete<T>(`${PREFIX}/deleteStockTakingOrderReason/${id}`);
}

// GET/api/admin/stockTakingOrder/1.0/addStockTakingOrderReason 新增盈亏原因
export async function addStockTakingOrderReason<
  T = ResponseResult<any>,
>(params: Array<{
  id: number,
  reason: string
}>) {
  return request.post<T>(`${PREFIX}/addStockTakingOrderReason`, { data: params });
}

// GET/api/admin/stockTakingOrder/1.0/getStockTakingGoods 获取盘库物资
export async function getStockTakingGoods<
  T = ResponseList<StockTakingOrderController.GetDetailRuleParams>,
>(params: StockTakingOrderController.GetListRuleParams) {
  return request.get<T>(`${PREFIX}/getStockTakingGoods`, {
    params,
  });
}

