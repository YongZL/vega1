// 获取医院院区列表 hospital-campus-controller

import request from '@/utils/request';
const PREFIX = '/api/admin/hospitalCampus/1.0';

// get /api/admin/hospitalCampus/1.0 医院院区
export function getCampuss<T = ResponseResult<HospitalCampusController.HospitalCampus[]>>() {
	return request.get<T>(`${PREFIX}`, {});
}

// GET/api/admin/hospitalCampus/1.0/{id} 根据id获取医院院区详情
