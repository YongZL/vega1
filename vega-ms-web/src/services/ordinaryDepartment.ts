// ordinary-department-controller 医耗套包绑定仓库
import request from '@/utils/request';
const PREFIX = '/api/admin/ordinaryDepartment/1.0';

//POST /api/admin/ordinaryDepartment/1.0/editBindWarehouse  编辑
export function bindOrdinary<T = ResponseResult>(
	params?: OrdinaryDepartmentController.BindGoodsParams,
) {
	return request.post<T>(`${PREFIX}/editBindWarehouse`, { data: params });
}

// POST/api/admin/ordinaryDepartment/1.0/partmentBindOrdinary departmentBindOrdinary

// POST/api/admin/ordinaryDepartment/1.0/unBind 解绑医耗套包
export function unbindSurgical<T = ResponseResult>(
	params?: OrdinaryDepartmentController.UnbindTypeParams,
) {
	return request.post<T>(`${PREFIX}/unBind`, { data: params });
}
