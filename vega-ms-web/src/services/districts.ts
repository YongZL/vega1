// 省市区 district-controller
import request from '@/utils/request';
const PREFIX = '/api/admin/districts/1.0';

// get  '/api/admin/districts/1.0/listProvince 省
export function getProvincesList<T = ResponseResult<DistrictController.ProvincesList[]>>() {
	return request.get<T>(`${PREFIX}/listProvinces`, {});
}

// get  '/api/admin/districts/1.0/listChildren 城市
export function getChildren<T = ResponseResult<DistrictController.ProvincesList[]>>(
	params?: DistrictController.CityType,
) {
	return request.get<T>(`${PREFIX}/listChildren`, { params });
}

// get  '/api/admin/districts/1.0/getParentPaths areaCode父层区域路径
export function getParentPaths<T = ResponseResult<DistrictController.ProvincesList[]>>(
	params?: DistrictController.CityType,
) {
	return request.get<T>(`${PREFIX}/getParentPaths`, { params });
}

// get  /api/admin/districts/1.0/listSiblings 根据areaCode获取同级区域
export function getAreaList<T = ResponseResult<DistrictController.ProvincesList[]>>() {
	return request.get<T>(`${PREFIX}/listSiblings`, {});
}
