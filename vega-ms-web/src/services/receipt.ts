// 财务管理 收料单 receipt-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/receipt/1.0';

// GET/api/admin/receipt/1.0/notFinishSettlementDateList 收料单生成中时间周期下拉框
export function queryNotFinishDateList<T = ResponseResult<ReceiptController.DateListRecord[]>>(
	params: ReceiptController.DateListParams,
) {
	return request.get<T>(`${PREFIX}/notFinishSettlementDateList`, { params });
}

// GET/api/admin/receipt/1.0/exportReceipt 收料单导出
export const exportReceiptUrl = `${PREFIX}/exportReceipt`;

// POST/api/admin/receipt/1.0/generateReceipt 生成收料单
export function postGenerateReceipt<T = ResponseResult>(
	data: ReceiptController.GenerateReceiptParams,
) {
	return request.post<T>(`${PREFIX}/generateReceipt`, { data });
}

// GET/api/admin/receipt/1.0/generateReceiptGoodsList 生成收料单物资列表
export function queryReceiptGoodsList<T = ResponseList<ReceiptController.GoodsListRecord>>(
	params: ReceiptController.GoodsListPager,
) {
	return request.get<T>(`${PREFIX}/generateReceiptGoodsList`, { params });
}

// GET/api/admin/receipt/1.0/receiptList 收料单列表
export function queryReceiptList<T = ResponseList<ReceiptController.ListRecord>>(
	params: ReceiptController.ListPager,
) {
	return request.get<T>(`${PREFIX}/receiptList`, { params });
}

// GET/api/admin/receipt/1.0/receiptListDetail 收料单详情列表
export function queryReceiptListDetail<T = ResponseResult<ReceiptController.DetailData[]>>(
	params: ReceiptController.DetailParams,
) {
	return request.get<T>(`${PREFIX}/receiptListDetail`, { params });
}

// GET/api/admin/receipt/1.0/receiptListPrint 收料单列表打印
export const receiptListPrintUrl = `${PREFIX}/receiptListPrint`;

// POST/api/admin/receipt/1.0/updateReceiptCode 编辑收料单号
export function postUpdateReceiptCode<T = ResponseResult>(
	params: ReceiptController.UpdateCodeParams,
) {
	return request.post<T>(`${PREFIX}/updateReceiptCode`, { params });
}

// POST/api/admin/receipt/1.0/uploadInvoice 上传发票
export function postUploadInvoice<T = ResponseResult>(data: ReceiptController.UploadInvoiceParams) {
	return request.post<T>(`${PREFIX}/uploadInvoice`, { data });
}

// POST/api/admin/receipt/1.0/examine 审核收料单
export function postexamine<T = ResponseResult>(params: ReceiptController.Examine) {
	return request.post<T>(`${PREFIX}/examine`, { params });
}

// GET /api/admin/receipt/1.0/getPendingGenerateReceiptListByInvoiceSync 查询货票同行待上传发票物资列表
export function getPendingGenerateReceiptListByInvoiceSync<
	T = ResponseResult<ReceiptController.DetailInvoiceSync[]>,
>(params: ReceiptController.DetailRecord) {
	return request.get<T>(`${PREFIX}/getPendingGenerateReceiptListByInvoiceSync`, { params });
}

// GET /api/admin/receipt/1.0/getDistributorAndManufacturerByInvoiceSync 获取货票同行列表内数据的配送商业和生产商
export function getDistributorAndManufacturerByInvoiceSync<
	T = ResponseResult<ReceiptController.DetailManufacturerByInvoiceSync>,
>() {
	return request.get<T>(`${PREFIX}/getDistributorAndManufacturerByInvoiceSync`);
}

// GET /api/admin/receipt/1.0/generateReceiptByInvoiceSync 货票同行生成收料单
export function generateReceiptByInvoiceSync<T = ResponseResult>(
	params: ReceiptController.SubmitParams,
) {
	return request.post<T>(`${PREFIX}/generateReceiptByInvoiceSync`, { params });
}
