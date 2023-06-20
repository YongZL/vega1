// dictionary-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/dictionary/1.0';

// GET /api/admin/dictionary/1.0/getDictLabelAllCategory
export function getDictLabelAllCategory<T = ResponseResult>() {
	return request<T>(`${PREFIX}/getDictLabelAllCategory`);
}

// GET /api/admin/dictionary/1.0/getDictAllCategory
export function getDictAllCategory<T = ResponseResult>() {
	return request<T>(`${PREFIX}/getDictAllCategory`);
}
// GET/api/admin/dictionary/1.0/getByCategory 根据字典类型查询某个字典类别

// GET/api/admin/dictionary/1.0/getDictByCategory 查询某个字典类别

// GET/api/admin/dictionary/1.0/list 查询所有字典数据

// GET/api/admin/dictionary/1.0/listDictAllCategory 查询所有字典类别
