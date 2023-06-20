// distribution-unit-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/distributionUnit/1.0';

// POST/api/admin/distributionUnit/1.0/add 新建
export function addDistributionUnit<T = ResponseResult>(
	data: DistributionUnitController.DistributionUnitRecord,
) {
	return request.post<T>(`${PREFIX}/add`, { data });
}

// POST/api/admin/distributionUnit/1.0/delete/{id} 删除
export function deleteDistributionUnitById<T = ResponseResult>(id: string | number) {
	return request.post<T>(`${PREFIX}/delete/${id}`);
}

// GET/api/admin/distributionUnit/1.0/list 列表
export function getList<
	T = ResponseResult<DistributionUnitController.DistributionUnitRecord[]>,
>(params: { goodsId: number }) {
	return request<T>(`${PREFIX}/list`, { params });
}

// POST/api/admin/distributionUnit/1.0/setDefault 设置默认配送单位
export function setDefault<T = ResponseResult>(data: { id: number; goodsId: number }) {
	return request.post<T>(`${PREFIX}/setDefault`, { data });
}

// POST/api/admin/distributionUnit/1.0/unsetDefault 清空默认配送单位
export function unsetDefault<T = ResponseResult>(data: { id: number; goodsId: number }) {
	return request.post<T>(`${PREFIX}/unsetDefault`, { data });
}

// POST/api/admin/distributionUnit/1.0/update 更新
export function updateDistributionUnit<T = ResponseResult>(
	data: DistributionUnitController.DistributionUnitRecord,
) {
	return request.post<T>(`${PREFIX}/update`, { data });
}
