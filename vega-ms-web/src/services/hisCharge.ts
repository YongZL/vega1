// his-charge-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/his/charge/1.0';

// GET/api/admin/his/charge/1.0/findHisChargeDetailList his收费详情列表
export function charge_scheduleDetailsList<
	T = ResponseList<HisChargeController.HisChargeDetailList[]>,
>(params: HisChargeController.HisChargeDetailParams) {
	return request.get<T>(`${PREFIX}/findHisChargeDetailList`, { params });
}

// GET/api/admin/his/charge/1.0/findHisChargeList his收费列表
export function charge_scheduleList<T = ResponseResult<HisChargeController.HisChargeRecord[]>>(
	params: HisChargeController.HisChargeParams,
) {
	return request.get<T>(`${PREFIX}/findHisChargeList`, { params });
}

// GET/api/admin/his/charge/1.0/getHisDeptList 获取所有已经启用的his科室名称和id
export function getDepartmentList<T = ResponseResult<HisChargeController.GetHisDeptList[]>>() {
	return request.get<T>(`${PREFIX}/getHisDeptList`, {});
}
