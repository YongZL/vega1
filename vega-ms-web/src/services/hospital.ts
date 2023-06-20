// hospital-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/hospital/1.0';

// POST /api/admin/hospital/1.0/setCurrentHospital
export function setCurrentHospital<T = ResponseResult>(data: { hospitalId: number }) {
	return request.post<T>(`${PREFIX}/setCurrentHospital`, { data });
}

// POST/api/admin/hospital/1.0/create 创建医院

// GET/api/admin/hospital/1.0/pageList 医院分页列表

// GET/api/admin/hospital/1.0/selectList 医院下拉列表

// GET/api/admin/hospital/1.0/list 医院列表
