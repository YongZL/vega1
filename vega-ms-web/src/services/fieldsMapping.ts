// equipment-controller
import request from '@/utils/request';
const PREFIX = '/api/admin/fieldsMapping/1.0';

// GET /api/admin/fieldsMapping/1.0/fetchFieldsMapping 基于系统/医院环境支持部分字段显示名字全局管理字典
export async function fetchFieldsMapping<T = ResponseResult<FieldsMapping.Data>>() {
	return request<T>(`${PREFIX}/fetchFieldsMapping`);
}
