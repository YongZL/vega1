// distributorGoods-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/distributorGoods/1.0';

// GET /api/admin/distributorGoods/1.0/list 配送商业相关基础物资列表
export function getGoodsList<T = ResponseList<DistributorAuthorizationController.GoodsListRecord>>(
	params: DistributorAuthorizationController.GoodsListPager,
) {
	return request.get<T>(`${PREFIX}/list`, { params });
}

// POST /api/admin/distributorGoods/1.0/setInvoiceSync 绑定/解除绑定
export function setInvoiceSync<T = ResponseResult>(data: Record<string, any>) {
	return request.post<T>(`${PREFIX}/setInvoiceSync`, { data });
}
