// 报表汇总 SummaryReport Controller
import request from '@/utils/request';

const PREFIX = '/api/admin/summaryReport/1.0';

// GET api/admin/summaryReport/1.0/reportTotalData 分页查询列表
export function reportTotalData<T = ResponseList<SummaryReportController.SummaryReportRecord>>(
	params: SummaryReportController.SummaryReportParams,
) {
	return request<T>(`${PREFIX}/reportTotalData`, {
		params,
	});
}
//api/admin/summaryReport/1.0/reportExport //报表汇总导出
export const reportExport = `${PREFIX}/reportExport`;

//api/rs/summaryReport/1.0/stockReportExport //库存查询导出
export const stockReportExport = '/api/rs/summaryReport/1.0/stockReportExport';
