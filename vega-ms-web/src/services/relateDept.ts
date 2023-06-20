// relate-dept-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/relateDept/1.0';

// POST/api/admin/relateDept/1.0/batchBindDept 批量绑定
export function batchBindDept(data: RelateDeptController.BindDeptParams) {
	return request.post(`${PREFIX}/batchBindDept`, { data });
}

// POST/api/admin/relateDept/1.0/bindDept 绑定
export function bindDept(data: RelateDeptController.BindDeptParams) {
	return request.post(`${PREFIX}/bindDept`, { data });
}

// GET/api/admin/relateDept/1.0/export 对照导出
export function exportData() {
	return `${PREFIX}/export`;
}
// GET/api/admin/relateDept/1.0/getRelatedWithPage 分页查询对照信息 已对照
export function getRelate<T = ResponseResult<RelateDeptController.RelateRecord>>(
	params: RelateDeptController.RelateParams,
) {
	return request<T>(`${PREFIX}/getRelatedWithPage`, { params });
}

// GET/api/admin/relateDept/1.0/getWithHisPage 分页查询部门对照原始数据 未对照
export function getNoRelate<T = ResponseResult<RelateDeptController.NoRelateRecord>>(
	params: RelateDeptController.NoRelateParams,
) {
	return request<T>(`${PREFIX}/getWithHisPage`, { params });
}

// POST/api/admin/relateDept/1.0/unbindDept 解绑
export function unbindDept(data: { deptId: number; hisDeptId: number }) {
	return request.post(`${PREFIX}/unbindDept`, { data });
}
