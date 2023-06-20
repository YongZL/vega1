// 三级库库存 ThreeStockController
import request from '@/utils/request';

const PREFIX = '/api/admin/threeStock/1.0';

// GET/api/admin/threeStock/1.0/findStockInfo 获取三级库库存状况
export function getStockInquiry<T = ResponseList<ThreeStockController.ThreeStockRecord[]>>(
	params?: ThreeStockController.ThreeStockParams,
) {
	return request<T>(`${PREFIX}/findStockInfo`, { params });
}
