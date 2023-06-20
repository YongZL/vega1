// rfid-stock-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/rfidStock/1.0';

// POST/api/admin/rfidStock/1.0/batchFetchRfidForDevice 根据Rfid查询物资信息

// GET/api/admin/rfidStock/1.0/batchQueryRfid 根据Rfid查询物资信息

// GET/api/admin/rfidStock/1.0/batchQueryRfidForDevice 根据Rfid查询物资信息

/** POST/api/admin/rfidStock/1.0/bindingRfid 绑定RFID */
export function bindingRfid<T = ResponseResult>(data: RfidStockController.BindingRfidData) {
	return request.post<T>(`${PREFIX}/bindingRfid`, { data });
}

// GET/api/admin/rfidStock/1.0/export 导出
export const rfidStockExport = `${PREFIX}/export`;

/** GET/api/admin/rfidStock/1.0/getPageList 分页查询 */
export function getList<T = ResponseList<RfidStockController.GetListRecord>>(
	params: RfidStockController.GetListParams,
) {
	return request.get<T>(`${PREFIX}/getPageList`, { params });
}

// GET/api/admin/rfidStock/1.0/queryByEpc 根据EPC查询标签信息

// GET/api/admin/rfidStock/1.0/queryRfid 根据Rfid查询物资信息

/** POST/api/admin/rfidStock/1.0/unbindingRfid 解绑RFID */
export function unbindingRfid<T = ResponseResult>(data: RfidStockController.UnbindingRfidData) {
	return request.post<T>(`${PREFIX}/unbindingRfid`, { data });
}

// POST/api/admin/rfidStock/1.0/updateInventory 更新库存

// POST/api/admin/rfidStock/1.0/uploadRfid 导入RFID标签

// POST/api/admin/rfidStock/1.0/uploadRfidByTemplate 导入RFID标签(根据模板)

// POST/api/admin/rfidStock/1.0/uploadRfidByRange RFID注册
export function uploadRfidByRange<T = ResponseResult>(
	data: RfidStockController.UploadRfidByRangeData,
) {
	return request.post<T>(`${PREFIX}/uploadRfidByRange`, { data });
}
