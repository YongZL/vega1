// unpacking-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/unpacking/1.0';

// POST/api/admin/unpacking/1.0/batchUnpack 批量拆包
export function batchUnpack<T = ResponseResult<UnpackingController.BatchUnpackRecord[]>>(data: {
	operatorBarcode: string[];
}) {
	return request.post<T>(`${PREFIX}/batchUnpack`, { data });
}

// GET/api/admin/unpacking/1.0/search 查询定数包或手术套包

// POST/api/admin/unpacking/1.0/unpack 拆包
