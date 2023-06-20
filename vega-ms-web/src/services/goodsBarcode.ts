// GoodsBarcodeController
import request from '@/utils/request';

const PREFIX = '/api/admin/goodsBarcode/1.0';

// POST /api/admin/goodsBarcode/1.0/goodsBarcodeCompletedForWeb 赋码
export function goodsBarcodeCompletedForWeb<T = ResponseList>(
	params: GoodsBarcodeRecordController.GoodsBarcodeRecordParams,
) {
	console.log('paramsparams', params);

	return request.post<T>(`${PREFIX}/goodsBarcodeCompletedForWeb`, { data: params });
}
