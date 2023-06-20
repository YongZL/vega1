// std-95-goods-category-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/std95GoodsCategory/1.0';

/** GET/api/admin/std95GoodsCategory/1.0/rootList */

/** GET/api/admin/std95GoodsCategory/1.0/singleList */

/** GET /api/admin/std95GoodsCategory/1.0/treeList 查询所有95分类 */
export function getAllGoods95<T = ResponseResult<Std95GoodsCategoryController.TypeData[]>>() {
	return request.get<T>(`${PREFIX}/treeList`);
}

export { getAllGoods95 as getAllCategory95 };
