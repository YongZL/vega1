// statement-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/statement/1.0';

// POST/api/admin/statement/1.0/audit 审批结算单

// POST/api/admin/statement/1.0/commit 确认并提交结算单

// POST/api/admin/statement/1.0/createStatementByTime 根据时间周期生成结算单

// GET/api/admin/statement/1.0/export 导出结算单数据

// GET/api/admin/statement/1.0/exportCustodianStatementSummary 导出托管商结算单

// GET/api/admin/statement/1.0/exportStatementDetail 结算单生成结算单详情导出

// GET/api/admin/statement/1.0/getPrintData 获取结算单打印数据

// GET/api/admin/statement/1.0/getStatementDetailGroupWithPage 分页显示结算单组

// GET/api/admin/statement/1.0/getStatementWithPage 查询条件分页查询

// GET/api/admin/statement/1.0/initDate 根据医院id获取结算单最新生成时间

// GET/api/admin/statement/1.0/loadReceipt 加载发票

// GET/api/admin/statement/1.0/queryRequestInfo 点击科室查看消耗细节详情列表

// GET/api/admin/statement/1.0/queryRequestInfoByInvoiceSync 查看货票同行的消耗细节详情列表

// GET/api/admin/statement/1.0/queryStatement 查询条件分页查询配送商业信息

// GET/api/admin/statement/1.0/queryStatementInfoDetail 查询科室消耗物资数量信息

// POST/api/admin/statement/1.0/rebuild 重新生成结算单

// GET/api/admin/statement/1.0/retStatementDate 根据医院查询结算周期列表
export function getStatementTimeList<T = ResponseResult<StatementController.TimeListRecord[]>>(
	params: StatementController.TimeListParams,
) {
	return request.get<T>(`${PREFIX}/retStatementDate`, { params });
}

// POST/api/admin/statement/1.0/review 复核结算单

// POST/api/admin/statement/1.0/uploadReceipt 上传发票
