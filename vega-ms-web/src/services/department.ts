// 科室资料 department-controller
import request from '@/utils/request';
const PREFIX = '/api/admin/departments/1.0';

// GET '/api/admin/departments/1.0/getSelections', // 非一级科室的科室列表
export function queryDepartmentList<
  T = ResponseResult<DepartmentController.DepartmentTreeList[]>,
>() {
  return request.get<T>(`${PREFIX}/getSelections`);
}

// GET /api/admin/departments/1.0/treeList 科室资料 树形结构
export function getTreeData<T = ResponseResult<DepartmentController.DepartmentTreeList[]>>() {
  return request.get<T>(`${PREFIX}/treeList`);
}

// POST /api/admin/departments/1.0/unbindDepartmentGoods
export function unbindGoods<T = ResponseResult>(params: {
  departmentId?: number;
  goodsId?: number;
}) {
  return request.post<T>(`${PREFIX}/unbindDepartmentGoods`, { data: params });
}
export interface SearchType {
  pageNum: number;
  pageSize: number;
  departmentId: number;
  departmentAdd: string;
}

// GET '/api/admin/departments/1.0/getDepartmentGoodsWithPage', // 科室基础物资列表
export function searchGoodsList<T = ResponseList<DepartmentController.DepartmentGoodsAdd>>(
  params?: DepartmentController.UnbindTypeParams,
) {
  return request.get<T>(`${PREFIX}/getDepartmentGoodsWithPage`, { params });
}

// POST /api/admin/departments/1.0  编辑科室
export function departmentEdit<T = ResponseResult>(params: DepartmentController.SubmitTypeParams) {
  return request.post<T>(`${PREFIX}/${params.id}`, { data: params });
}

// post /api/admin/departments/1.0  新增科室
export function departmentAdd<T = ResponseResult>(params?: DepartmentController.SubmitTypeParams) {
  return request.post<T>(`${PREFIX}`, { data: params });
}

// get /api/admin/departments/1.0 科室详情
export function detailInfo<T = ResponseResult<DepartmentController.DepartmentTreeList>>(
  id?: string,
) {
  return request.get<T>(`${PREFIX}/${id}`, {});
}

//POST   /api/admin/departments/1.0/batchSetDepartmentGoods 科室批量绑定基础物资
export function batchGoods<T = ResponseResult>(params: { departmentId?: number; goodsIds?: any }) {
  return request.post<T>(`${PREFIX}/batchSetDepartmentGoods`, { dataType: 'json', data: params });
}

// get /api/admin/departments/1.0/getUnbindPackageBulk
export function searchBulkList<T = ResponseResult>(params?: DepartmentController.SearchType) {
  return request.get<T>(`${PREFIX}/getUnbindPackageBulk`, params);
}

//get /api/admin/departments/1.0/departmentTreeList 获取批量绑定科室
export function getTreeListData<
  T = ResponseResult<DepartmentController.DepartmentTreeList[]>,
>(params: {
  goodsIds?: string; //物资ids
}) {
  return request.get<T>(`${PREFIX}/departmentTreeList`, { params });
}

//POST /api/admin/departments/1.0/batchBindDepartmentGoodsMore 科室批量绑定基础物资
export function batchBindDepartmentGoods<
  T = ResponseResult<DepartmentController.WarehouseGoodsList>,
>(params?: DepartmentController.BatchBindTypeParams) {
  return request.post<T>(`${PREFIX}/batchBindDepartmentGoodsMore`, { data: params });
}

//GET /api/admin/departments/1.0/getWarehouseGoodsList 仓库列表
export function limitsGoods<T = ResponseResult>(params?: DepartmentController.BatchBindTypeParams) {
  return request.get<T>(`${PREFIX}/getWarehouseGoodsList`, { params });
}

//GET '/api/admin/departments/1.0/setDepartmentGoods', // 设置科室商品并设置上下限
export function bindGoods<T = ResponseResult>(params?: DepartmentController.bindGoodsParams) {
  return request.post<T>(`${PREFIX}/setDepartmentGoods`, { data: params });
}

// POST/api/admin/departments/1.0/addWarehouseGoodsLimit 设置仓库商品上下限

// POST/api/admin/departments/1.0/batchBindDepartmentGoods 批量绑定科室和商品

// GET/api/admin/departments/1.0/exportDepartmentGoods 导出科室商品

// GET/api/admin/departments/1.0/getAllDepartment 获取所有科室(包含一级科室)的科室名称和id

// GET/api/admin/departments/1.0/getAllSubDepartment 获取所有非一级科室的科室名称和id
export function queryAllDepartmentList<T = ResponseResult>() {
  return request.get<T>(`${PREFIX}/getAllSubDepartment`);
}

// GET/api/admin/departments/1.0/getParent/{id} 根据id获取父级组织
export function ByIdGetParent<T = ResponseResult>(id: number) {
  return request.get<T>(`${PREFIX}/getParent/${id}`);
}

// GET/api/admin/departments/1.0/pageList 分页获取直接子节点组织列表

// POST/api/admin/departments/1.0/removeDepartmentGoods/{departmentGoodsId} 移除科室商品

// POST/api/admin/departments/1.0/removeWarehouseGoodsLimit 删除仓库商品上下限

// POST/api/admin/departments/1.0/setDepartmentGoods 设置科室商品并设置上下限

// POST/api/admin/departments/1.0/updateWarehouseGoodsLimit 修改仓库商品上下限

// GET/api/admin/departments/1.0/{id} 根据id获取组织详情

// POST/api/admin/departments/1.0/{id} 更新组织信息

// POST/api/admin/departments/1.0/delete/{id} 根据id删除组织信息

// GET '/api/admin/departments/1.0/findDepartmentAndWarehouse', // 获取科室+仓库
export function findDepartmentAndWarehouse<
  T = ResponseResult<DepartmentController.DepartmentAndWarehouseRecord[]>,
>() {
  return request<T>(`${PREFIX}/findDepartmentAndWarehouse`);
}

// GET '/api/admin/departments/1.0/batchUnbindDepartmentGoods', // 批量解绑科室
export function batchUnbindDepartmentGoods<T = ResponseResult>(
  params?: DepartmentController.batchBindGoodsParams,
) {
  return request.post<T>(`${PREFIX}/batchUnbindDepartmentGoods`, { data: params });
}

// GET/api/admin/departments/1.0/getAllMainDepartments  获取所有一级科室的科室名称和id
export function getAllMainDepartments<
  T = ResponseResult<DepartmentController.getAllMainDepartments>[],
>() {
  return request.get<T>(`${PREFIX}/getAllMainDepartments`);
}