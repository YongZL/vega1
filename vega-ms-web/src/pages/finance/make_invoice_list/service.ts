import request from '@/utils/request';
import api from '@/constants/api';
import { TableListParams } from './data';

//销后结算列表
export async function getSalesList(params?: TableListParams) {
	return request(api.make_invoice_list.salesList, { params });
}

//货票同行列表
export async function getWaybillList(params?: TableListParams) {
	return request(api.make_invoice_list.waybillList, { params });
}
export interface UploadInfo {
	invoiceDetailDtoList: any;
	invoiceUploadDto: any;
}
//销后结算上传发票
export async function salesUpload(params?: UploadInfo) {
	return request(api.make_invoice_list.salesUpload, { method: 'POST', data: params });
}
//货票同行上传发票
export async function waybillUpload(params?: UploadInfo) {
	return request(api.make_invoice_list.waybillUpload, { method: 'POST', data: params });
}
//手工红冲发票上传
export async function manualUpload(params?: UploadInfo) {
	return request(api.make_invoice_list.manualUpload, { method: 'POST', data: params });
}
//电子红冲发票上传
export async function electronicUpload(params?: UploadInfo) {
	return request(api.make_invoice_list.electronicUpload, { method: 'POST', data: params });
}
export interface SerialNumber {
	serialNumber: string;
}
// 根据发票号码查询蓝票
export async function getInvoiceList(params?: SerialNumber) {
	return request(api.make_invoice_list.getInvoice, { params });
}

export interface InvoiceId {
	invoiceId: string;
}
// 根据发票查询明细
export async function getInvoiceInfo(params?: InvoiceId) {
	return request(api.make_invoice_list.getInvoiceInfo, { params });
}
