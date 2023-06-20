// import { get } from 'lodash';
// users-controller
import request from '@/utils/request';

const PREFIX = '/api/admin/users/1.0';

// GET/api/admin/users/1.0 获取用户列表
export async function queryRule<T = ResponseResult<UsersController.ByRoleIdGetUserRecord>[]>(
	params: UsersController.QueryRuleParams,
) {
	return request.get<T>(PREFIX, {
		params,
	});
}
// POST/api/admin/users/1.0 新增用户
export async function addUser<T = ResponseResult>(params: UsersController.AddUserRuleParams) {
	return request<T>(PREFIX, {
		method: 'POST',
		data: {
			...params,
		},
	});
}
// POST/api/admin/users/1.0/adminUpdatePwd 重置密码
export async function queryUpdatePwd<T = ResponseResult>(params: { userId: number }) {
	return request<T>(`${PREFIX}/adminUpdatePwd`, {
		method: 'POST',
		data: {
			...params,
		},
	});
}

// GET/api/admin/users/1.0/getPickerList 查询拣货员列表
export async function queryPackList<T = ResponseResult>() {
	return request.get<T>(`${PREFIX}/getPickerList`);
}

// GET/api/admin/users/1.0/getPusherList 查询推送员列表
export async function queryPusherList<
	T = ResponseResult<UsersController.QueryPusherListRecord[]>,
>() {
	return request.get<T>(`${PREFIX}/getPusherList`);
}

// GET/api/admin/users/1.0/getUserBaseInfo 查询用户基本信息
export async function getUserBaseInfo<T = ResponseResult>() {
	return request.get<T>(`${PREFIX}/getUserBaseInfo`);
}

// GET/api/admin/users/1.0/listByDepartmentId 根据组织Id获取用户列表，如果为中心库绑定的科室，则查询中心库和该科室的所有人员
export async function getUserListByDepId<T = ResponseList<UsersController.GetUserQueryListByDepId>>(
	params: UsersController.GetUserListByDepId,
) {
	return request.get<T>(`${PREFIX}/listByDepartmentId`, { params });
}

// GET /api/admin/users/1.0/listByRoleId 根据角色Id获取用户列表
export async function getUserListByRoleId<
	T = ResponseResult<UsersController.ByRoleIdGetUserRecord>,
>(params: UsersController.ByRoleIdGetUserParams) {
	return request<T>(`${PREFIX}/listByRoleId`, { params });
}

// POST/api/admin/users/1.0/operate 启用/禁用
export async function queryOperate<T = ResponseResult>(params: { enable: boolean; id: number }) {
	return request<T>(`${PREFIX}/operate`, {
		method: 'POST',
		data: {
			...params,
		},
	});
}

// POST/api/admin/users/1.0/updatePwd 修改密码
export function updatePwd<T = ResponseResult>(data: UsersController.UpdatePwdParams) {
	return request.post<T>(`${PREFIX}/updatePwd`, {
		data,
	});
}

// GET/api/admin/users/1.0/{id} 根据id获取用户详情
export function getUserDetail<T = ResponseResult>(id: number) {
	return request<T>(`${PREFIX}/${id}`);
}

// POST/api/admin/users/1.0/{id} 更新用户信息
export function updatingUserInformation<T = ResponseResult>(id: number) {
	return request<T>(`${PREFIX}/${id}`, {
		method: 'POST',
	});
}
// POST/api/admin/users/1.0/id=?', // 编辑用户信息
export async function eaitUser<T = ResponseResult>(
	id: number,
	params: UsersController.AddUserRuleParams,
) {
	return request<T>(`${PREFIX}/${id}`, {
		method: 'POST',
		data: {
			...params,
		},
	});
}
// GET/api/admin/users/1.0/id=?', // 用户信息详情
// ResponseResult<UsersController.UserDateItem>>(id: number) {   UsersController.UserDateItem返回的参数约束  (入参约束)
export async function queryDetail<T = ResponseResult<UsersController.UserDateItem>>(id: number) {
	return request.get<T>(`${PREFIX}/${id}`);
}
