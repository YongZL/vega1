// repository-in-bound-summary-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/repositoryInBoundSummary/1.0';

// GET/api/admin/repositoryInBoundSummary/1.0/export 导出入库汇总报表数据

// GET/api/admin/repositoryInBoundSummary/1.0/pageList 分页获取入库汇总列表
export function queryRule<T = ResponseList<RepositoryInBoundSummaryController.QueryRuleRecord>>(
	params: RepositoryInBoundSummaryController.QueryRuleParams,
) {
	return request.get<T>(`${PREFIX}/pageList`, { params });
}
