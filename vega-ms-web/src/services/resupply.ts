// resupply-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/resupply/1.0';

// GET/api/admin/resupply/1.0/goodsResupplyList 查询商品补货设置列表
export function goodsResupplyList<T = ResponseList<ResupplyController.GoodsResupplyRecord[]>>(
	params: ResupplyController.GoodsResupplyListParams,
) {
	return request<T>(`${PREFIX}/goodsResupplyList`, { params });
}

// GET/api/admin/resupply/1.0/packageResupplyList 查询定数包补货列表

// POST/api/admin/resupply/1.0/removeGoodsResupply/{resupplySettingId} 删除商品补货
export function removeGoodsResupplyById<T = ResponseResult>(id: number) {
	return request.post<T>(`${PREFIX}/removeGoodsResupply/${id}`);
}

// POST/api/admin/resupply/1.0/removePackageResupply/{resupplySettingId} 删除定数包补货

// POST/api/admin/resupply/1.0/removeSurgicalResupply/{resupplySettingId} 删除手术套包补货

// POST/api/admin/resupply/1.0/setGoodsResupply 设置商品补货
export function setGoodsResupply<T = ResponseResult>(data: ResupplyController.SetGoodsParams) {
	return request.post<T>(`${PREFIX}/setGoodsResupply`, { data });
}

// POST/api/admin/resupply/1.0/setPackageResupply 设置定数包补货

// POST/api/admin/resupply/1.0/setSurgicalResupply 设置手术套包补货

// GET/api/admin/resupply/1.0/surgicalResupplyList 查询手术套包补货列表
