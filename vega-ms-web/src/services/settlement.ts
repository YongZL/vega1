// settlement-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/settlement/1.0';

const PREFIXIN = '/api/admin/report/outbound/1.0';

// POST/api/admin/settlement/1.0/createStatementByTime 根据时间周期生成结算单
export function createStatementByTime<T = ResponseResult>(
  data: SettlementController.InitDateParams,
) {
  return request.post<T>(`${PREFIX}/createStatementByTime`, { data });
}

// GET/api/admin/settlement/1.0/exportHistory 历史结算单导出
export const exportHistoryUrl = `${PREFIX}/exportHistory`;

// GET/api/admin/settlement/1.0/exportStatementDetail 结算单生成结算单详情导出
export const exportStatementDetailUrl = `${PREFIX}/exportStatementDetail`;

// GET/api/admin/settlement/1.0/historyStatementList 历史结算单列表
export const historyListUrl = `${PREFIX}/historyStatementList`;
export function queryHistoryList<T = ResponseResult<SettlementController.HistoryData>>(
  params: SettlementController.HistoryListPager,
) {
  return request.get<T>(`${PREFIX}/historyStatementList`, { params });
}

// GET/api/admin/settlement/1.0/initDate 根据医院id获取结算单最新生成时间
export function getStatementDate<T = ResponseResult<SettlementController.InitDateData>>(
  params: SettlementController.InitDateParams,
) {
  return request.get<T>(`${PREFIX}/initDate`, { params });
}

// GET/api/admin/settlement/1.0/queryGoodsInfoByDistributorId 查询已消耗的配送商业的物资信息
export const exportDetailListUrl = `${PREFIX}/queryGoodsInfoByDistributorId`;
export function queryGoodsInfoByDistributorId<
  T = ResponseList<SettlementController.DetailRecord[]>,
>(params: SettlementController.DetailPager) {
  return request.get<T>(`${PREFIX}/queryGoodsInfoByDistributorId`, { params });
}

// GET/api/admin/settlement/1.0/queryRequestInfo 点击科室查看消耗细节详情列表
export function queryRequestInfo<T = ResponseResult<SettlementController.DetailRecord[]>>(
  params: SettlementController.RequestInfoParams,
) {
  return request.get<T>(`${PREFIX}/queryRequestInfo`, { params });
}

// GET/api/admin/settlement/1.0/queryRequestInfoByInvoiceSync 查看货票同行的消耗细节详情列表
export function queryRequestInfoByInvoiceSync<
  T = ResponseList<SettlementController.InvoiceSyncRecord>,
>(params: SettlementController.DetailListCommonPager) {
  return request.get<T>(`${PREFIX}/queryRequestInfoByInvoiceSync`, { params });
}

// GET/api/admin/settlement/1.0/queryStatement 查询条件分页查询配送商业信息
export function queryStatementList<T = ResponseList<SettlementController.ListRecord>>(
  params: SettlementController.ListPager,
) {
  return request.get<T>(`${PREFIX}/queryStatement`, { params });
}

// GET/api/admin/settlement/1.0/queryStatementInfoDetail 查询科室消耗物资数量信息
export function queryStatementInfoDetail<T = ResponseList<SettlementController.DetailRecord>>(
  params: SettlementController.DetailListCommonPager,
) {
  return request.get<T>(`${PREFIX}/queryStatementInfoDetail`, { params });
}

// GET/api/admin/settlement/1.0/retStatementDate 根据医院查询结算周期列表
export function getTimeList<T = ResponseResult<SettlementController.TimeListRecord[]>>(
  params: SettlementController.TimeListParams,
) {
  return request.get<T>(`${PREFIX}/retStatementDate`, { params });
}

// GET/api/admin/settlement/1.0/getIncomeExpenditureSummaryDate 报表业务收支汇总-根据医院查询结算周期列表
export function getIncomeExpenditureSummaryDate<T = ResponseResult<SettlementController.TimeListRecord[]>>() {
  return request.get<T>(`${PREFIX}/getIncomeExpenditureSummaryDate`);
}

// POST api/admin/settlement/1.0/exportIncomeExpenditureSummary 导出
export const exportFile = `${PREFIX}/exportIncomeExpenditureSummary`;

// GET 列表接口：/api/admin/settlement/1.0/incomeExpenditureSummary
export function getList<
  T = ResponseResult<SettlementController.IncomeExpenditureSummaryParams[]>,
>(params: { timeFrom: number; timeTo: number }) {
  return request.get<T>(`${PREFIX}/incomeExpenditureSummary`, { params });
}

//  GET  /api/admin/report/outbound/1.0/summary   //获取出库汇总列表
export function summary<T = ResponseResult<SettlementController.summary[]>>(
  params: SettlementController.summaryParams,
) {
  return request.get<T>(`${PREFIXIN}/summary`, { params });
}

//  GET /api/admin/report/outbound/1.0/summaryExport   //出库汇总导出
export const summaryExport = `${PREFIXIN}/summaryExport`;
