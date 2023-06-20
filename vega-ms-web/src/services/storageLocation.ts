// storage-location-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/storageLocation/1.0';

// GET/api/admin/storageLocation/1.0/findLocationCanBindByCabinetId/{cabinetId} 根据货架查询可以绑定物资的货位
export async function findLocationCanBindByCabinetId<
	T = ResponseResult<StorageLocationController.LocationRecord[]>,
>(id: number | string, params: { goodsId?: number | string } = {}) {
	return request.get<T>(`${PREFIX}/findLocationCanBindByCabinetId/${id}`, { params });
}

// POST/api/admin/storageLocation/1.0/goodsBatchBindLocation 物资绑定货位信息
export async function goodsBatchBindLocation<T = ResponseResult>(data: Record<number, number[]>) {
	return request.post<T>(`${PREFIX}/goodsBatchBindLocation`, { data });
}
