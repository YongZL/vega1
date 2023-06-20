import request from '@/utils/request';
import { TableListParams } from './data.d';
import api from '@/constants/api';
//列表
export async function queryRule(params?: TableListParams) {
	return request(api.dueIn_goodsAndMaterials.list, { params });
}

//配货人列表
export async function queryPackList(params?: object) {
	return request(api.pick_up_ready.get_picker_list, { params });
}
//生成配货单
export async function queryCreatPickOrder(params: object) {
	return request(api.pick_up_ready.create_pick_order, {
		method: 'POST',
		data: {
			...params,
		},
	});
}
//加工台列表
export async function queryWorkbenchList(params: object) {
	return request(api.pick_up_ready.get_workbench_list, {
		method: 'POST',
		data: {
			...params,
		},
	});
}
//取消待配货
export async function queryCancel(params: object) {
	return request(api.pick_up_ready.cancel, {
		method: 'POST',
		data: {
			...params,
		},
	});
}
//一键生成配货单
export async function queryPickOrderBatch(params: object) {
	return request(api.pick_up_ready.create_pick_order_batch, {
		method: 'POST',
		data: {
			...params,
		},
	});
}

//获取科室列表
export async function getDepartmentList(params: object) {
	return request('/api/admin/departments/1.0/getSelectionsBy', { params });
}
//获取某个科室下的仓库列表
export async function getWarehousesByDepartment(params: object) {
	return request('/api/admin/warehouses/1.0/getListByDepartmentIds', { params });
}
