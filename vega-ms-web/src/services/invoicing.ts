// invoicing-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/invoicing/1.0';

// GET/api/admin/invoicing/1.0/export 导出
export const exportInvoicingUrl = `${PREFIX}/export`;

export function exportInvoicingList<T = ResponseList<InvoicingController.ListRecord>>(
	params: InvoicingController.ListPager,
) {
	return request.get<T>(`${PREFIX}/export`, { params });
}

// GET/api/admin/invoicing/1.0/pageList 列表查询
export function getInvoicingList<T = ResponseList<InvoicingController.ListRecord>>(
	params: InvoicingController.ListPager,
) {
	return request.get<T>(`${PREFIX}/pageList`, { params });
}
