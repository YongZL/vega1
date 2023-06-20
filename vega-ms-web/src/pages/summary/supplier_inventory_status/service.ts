import request from '@/utils/request';
import api from '@/constants/api';

export interface ListType {
	pageNum?: number;
	pageSize?: number;
}
export async function getList(params?: ListType) {
	return request(api.stock.supplier_inventory_status, {
		params,
	});
}
export interface SupplierType {
	pageNum: number;
	pageSize: number;
	supplierName: string;
}
export async function getSupplierByUser(params?: SupplierType) {
	// return request(api.suppliers.supplierByUser, {
	//   params,
	// });
}
