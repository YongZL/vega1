// 查询科室诊疗项目列表  diagnosis-project-department-controller
import request from '@/utils/request';
const PREFIX = '/api/admin/diagnosis-project-department/1.0';

// GET '/api/admin/diagnosis-project-department/1.0/getDepartmentDiagnosisProjectWithPage', // 科室绑定诊疗项目列表
export function searchProjectList<T = ResponseList>(
	params?: DiagnosisProjectDepartmentContoller.UnbindTypeParams,
) {
	return request.get<T>(`${PREFIX}/getDepartmentDiagnosisProjectWithPage`, { params });
}

// POST/api/admin/diagnosis-project-department/1.0/bind 绑定

// POST/api/admin/diagnosis-project-department/1.0/unbind 解绑
