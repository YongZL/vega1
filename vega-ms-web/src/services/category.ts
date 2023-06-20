import request from '@/utils/request';

const PREFIX = '/api/admin/category/1.0';

/** GET /api/admin/category/1.0/getAll12 查询所有2012类别 */
export function getAllGoods12<T = ResponseResult<CategoryController.TypeData[]>>(
	params: CategoryController.AllGoodsParams = {},
) {
	return request.get<T>(`${PREFIX}/getAll12`, { params });
}

/** GET /api/admin/category/1.0/getAll18 查询所有2018类别 */
export function getAllGoods18<T = ResponseResult<CategoryController.TypeData[]>>(
	params: CategoryController.AllGoodsParams = {},
) {
	return request.get<T>(`${PREFIX}/getAll18`, { params });
}

export { getAllGoods12 as getAllCategory12, getAllGoods18 as getAllCategory18 };
