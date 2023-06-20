// OrdinaryDepartmentController 科室绑定普耗包
import request from '@/utils/request';

const PREFIX = '/api/admin/ordinaryDepartment/1.0';

//get /api/admin/ordinaryDepartment/1.0/partmentBindOrdinary 绑定医耗套包
export function partmentBindOrdinary<T = ResponseResult>(params: {
	departmentId?: number; //科室id
	ordinarys?: Array<number>;
}) {
	return request.post<T>(`${PREFIX}/partmentBindOrdinary`, { data: params, dataType: 'json' });
}
