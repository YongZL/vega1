// gsp-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/gsp/1.0';

// GET/api/admin/gsp/1.0/companyLicenseRemindList 企业证照提醒
export function getLicenseRemindList<
	T = ResponseResult<GSPController.LicenseRemindListRecord[]>,
>() {
	return request.get<T>(`${PREFIX}/companyLicenseRemindList`);
}

// GET/api/admin/gsp/1.0/goodsRegisterRemindList 产品注册证提醒
export function getRegisterRemindList<
	T = ResponseResult<GSPController.RegisterRemindListRecord[]>,
>() {
	return request.get<T>(`${PREFIX}/goodsRegisterRemindList`);
}

// GET /api/admin/gsp/1.0/parseUdiCode 解析udi
export function getParseUdiCode<T = ResponseResult<GSPController.UdiCode>>(params: {
	udiCode: string;
}) {
	return request<T>(`${PREFIX}/parseUdiCode`, { params });
}
