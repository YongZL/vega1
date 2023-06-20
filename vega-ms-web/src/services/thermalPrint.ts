import request from '@/utils/request';
import api from '@/constants/api';

// 单个打印
export async function thermalPrint(params: any) {
	return await request(api.public.thermalPrint, {
		params,
	});
}

// 批量打印
export async function batchThermalPrint(params: any) {
	return await request(api.public.batchThermalPrint, {
		params,
	});
}

//  打印成功标记
export async function markPrintSuccess(params: any) {
	return await request(api.public.markPrintSuccess, {
		params,
	});
}
