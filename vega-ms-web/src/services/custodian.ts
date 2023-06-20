// 一级供应商信息custodian-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/custodian/1.0';

// POST/api/admin/custodian/1.0 新增 配送商业

// GET/api/admin/custodian/1.0/getAvailableCustodians 获取可用的 配送商业
export function queryCustodiansList<T = ResponseResult>(
	params: CustodianController.CustodiansListParams,
) {
	return request.get<T>(`${PREFIX}/getAvailableCustodians`, { params });
}

// POST/api/admin/custodian/1.0/setAccountPeriod 设置 配送商业账期
export function setCustodianPeriod<T = ResponseResult>(
	data: CustodianController.AccountPeriodParams,
) {
	return request.post<T>(`${PREFIX}/setAccountPeriod`, { data });
}

// GET/api/admin/custodian/1.0/{id} 根据id获取 配送商业详情

// POST/api/admin/custodian/1.0/{id} 更新 配送商业信息
