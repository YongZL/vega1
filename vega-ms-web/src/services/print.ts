// print-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/print/1.0';

// GET/api/admin/print/1.0/batchLoadPrintingData 批量加载打印信息
export function batchThermalPrint<T = ResponseResult<[]>>(
	params: PrintController.BatchPrintParams,
) {
	return request.get<T>(`${PREFIX}/batchLoadPrintingData`, { params });
}

// GET/api/admin/print/1.0/loadPrintingData 加载打印信息
export function thermalPrint<T = ResponseResult<[]>>(params: PrintController.PrintParams) {
	return request.get<T>(`${PREFIX}/loadPrintingData`, { params });
}

// GET/api/admin/print/1.0/printSuccess 标记打印成功
export function markPrintSuccess<T = ResponseResult>(params: PrintController.PrintParams) {
	return request.get<T>(`${PREFIX}/printSuccess`, { params });
}
/* /api/admin/print/1.0/loadBlankBarcode 打印空白条码 */
export function loadBlankBarcode<T = ResponseResult<Record<string, any>[]>>(num: number) {
	return request.get<T>(`${PREFIX}/loadBlankBarcode`, { params: { num } });
}
