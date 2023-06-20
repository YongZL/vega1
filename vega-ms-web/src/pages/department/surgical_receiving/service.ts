import request from '@/utils/request';
import api from '@/constants/api';

// 列表接口
export async function queryReceivingList(params: any) {
	return request(api.receiving.list, {
		params,
	});
}
// 详情接口
export async function queryReceivingDetail(params: any) {
	return request(api.receiving.detailsReceiving, {
		params,
	});
}
// 赋码打印详情接口
export async function queryBarcodeDetial(params: any) {
	return request(api.receiving.loadBarcodeControlledInfo, {
		params,
	});
}
// 验收通过接口
export async function recevingPass(params: any) {
	return request(api.receiving.pass, {
		method: 'POST',
		data: params,
	});
}
// 验收拒绝接口
export async function recevingReject(params: any) {
	return request(api.receiving.reject, {
		method: 'POST',
		data: params,
	});
}
// 验收撤回接口
export async function recevingRevert(params: any) {
	return request(api.receiving.revert, {
		method: 'POST',
		data: params,
	});
}
// 批量通过或拒绝
export async function batchPass(params: any) {
	return request(api.receiving.doBatchPass, {
		method: 'POST',
		data: params,
	});
}
// 验收完成提交
export async function submitReceiving(params: any) {
	return request(api.receiving.makeConclusion, {
		method: 'POST',
		data: params,
	});
}
