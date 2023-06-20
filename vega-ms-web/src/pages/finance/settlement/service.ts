import request from '@/utils/request';
import api from '@/constants/api';

export const querySettlementList = (params?: any) => {
	return request(api.settlement.list, {
		params: params,
	});
};
export const querySettlementDetails = (params?: any) => {
	return request(api.settlement.detailGroup, {
		params: params,
	});
};
export const exportSettlement = (params?: any) => {
	return request(api.settlement.export, {
		params: params,
	});
};
export const loadReceipt = (params?: any) => {
	return request(api.settlement.loadReceipt, {
		params: params,
	});
};
export const uploadReceipt = (params?: any) => {
	return request(api.settlement.uploadReceipt, {
		method: 'POST',
		data: params,
	});
};
export const orderCommit = (params?: any) => {
	return request(api.settlement.commit, {
		method: 'POST',
		data: params,
	});
};
export const orderAudit = (params?: any) => {
	return request(api.settlement.audit, {
		method: 'POST',
		data: params,
	});
};
export const orderReview = (params?: any) => {
	return request(api.settlement.review, {
		method: 'POST',
		data: params,
	});
};
export const exportCutodianSettlement = (params?: any) => {
	return request(api.settlement.exportCutodianSettlement, {
		params: params,
	});
};
