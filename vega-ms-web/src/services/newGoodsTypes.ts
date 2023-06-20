// new-goods-type-controller 新基础物资controller
import request from '@/utils/request';

const PREFIX = '/api/admin/new/goodsTypes/1.0';

// GET/api/admin/new/goodsTypes/1.0/pageList 分页获取商品列表
export function pageList<T = ResponseList<NewGoodsTypesController.GoodsRecord>>(
	params: NewGoodsTypesController.PageListParams,
) {
	return request<T>(`${PREFIX}/pageList`, { params });
}

// POST/api/admin/new/goodsTypes/1.0/updateEnabled 修改启用/禁用状态
export function updateEnabled<T = ResponseResult>(data: { isEnabled: boolean; goodsId: number }) {
	return request.post<T>(`${PREFIX}/updateEnabled`, { data });
}

// GET/api/admin/new/goodsTypes/1.0/{id} 根据id获取商品详情
export function getDetail<T = ResponseResult<NewGoodsTypesController.GoodsRecord>>(
	id: number | string,
) {
	return request<T>(`${PREFIX}/${id}`);
}

/* GET/api/admin/goodsTypes/1.0/getBubbleExpireCount/{days} 获取有效期内的数据 */
export async function getBubbleExpireCount<
	T = ResponseResult<NewGoodsTypesController.GetBubbleExpireCountRecord>,
	>(days: number) {
	return request<T>(`${PREFIX}/getBubbleExpireCount/${days}`);
}

/* GET/api/admin/new/goodsTypes/1.0/getGoodsDepartmentWithPage 获取有效期内的数据 */
export async function getGoodsDepartmentWithPage<T = ResponseResult<ResponseList<any[]>>>(
	params: NewGoodsTypesController.DepartmentPage,
) {
	return request.get<T>(`${PREFIX}/getGoodsDepartmentWithPage`, { params });
}
/* GET/api/admin/new/goodsTypes/1.0/getGoodsDistributorWithPage 获取有效期内的数据 */
export async function getGoodsDistributorWithPage<T = ResponseResult<ResponseList<any[]>>>(
	params: NewGoodsTypesController.DepartmentPage,
) {
	return request.get<T>(`${PREFIX}/getGoodsDistributorWithPage`, { params });
}
