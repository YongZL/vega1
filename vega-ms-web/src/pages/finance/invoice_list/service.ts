import request from '@/utils/request';
import api from '@/constants/api';
import { TableListParams } from './data';

// 待审核列表
export async function getApprovePendingList(params?: TableListParams) {
	return request(api.invoice_list.approvePendingList, { params });
}
// 待验收列表
export async function getCheckPendingList(params?: TableListParams) {
	return request(api.invoice_list.checkPendingList, { params });
}
// 待支付列表
export async function getPayPendingList(params?: TableListParams) {
	return request(api.invoice_list.payPendingList, { params });
}
// 支付完成列表
export async function getPayFinishedList(params?: TableListParams) {
	return request(api.invoice_list.payFinishedList, { params });
}
// 驳回列表
export async function getRejectList(params?: TableListParams) {
	return request(api.invoice_list.rejectedList, { params });
}

export interface Detail {
	invoiceId: string;
}
// 详情列表
export async function getDetail(params?: Detail) {
	return request(api.invoice_list.detail, { params });
}
// 查看转账凭证
export async function orderPayDetail(params?: Detail) {
	return request(api.invoice_list.payDetail, { params });
}

export interface HandleOrder {
	invoiceId: string;
	reason: string;
	success: boolean;
}
// 审核
export async function orderApprove(params?: HandleOrder) {
	return request(api.invoice_list.approve, { method: 'POST', data: params });
}

// 验收
export async function orderCheck(params?: HandleOrder) {
	return request(api.invoice_list.check, { method: 'POST', data: params });
}

// 作废
export async function orderRemove(params?: HandleOrder) {
	return request(api.invoice_list.remove, { method: 'POST', data: params });
}

// 上传转账凭证
export async function orderPay(params?: HandleOrder) {
	return request(api.invoice_list.pay, { method: 'POST', data: params });
}

export interface UploadInfo {
	updateInvoiceDetailList: any;
	updateInvoice: any;
}
// 销后结算发票修改
export async function salesEdit(params?: UploadInfo) {
	return request(api.invoice_list.salesEdit, { method: 'POST', data: params });
}
// 货票同行发票修改--电子
export async function billElectronicEdit(params?: UploadInfo) {
	return request(api.invoice_list.billElectronicEdit, { method: 'POST', data: params });
}
// 货票同行发票修改--手工
export async function billManualEdit(params?: UploadInfo) {
	return request(api.invoice_list.billManualEdit, { method: 'POST', data: params });
}
// 红冲发票修改--手工
export async function reverseManualEdit(params?: UploadInfo) {
	return request(api.invoice_list.reverseManualEdit, { method: 'POST', data: params });
}
// 获取所有开票企业
export async function enterpriseAll() {
	return request(api.invoice_list.enterpriseList, {});
}
