// import { number, string } from "prop-types";
// user-controller
declare namespace UsersController {
	interface UpdatePwdParams {
		newPassword: string; // 新密码
		oldPassword: string; // 旧密码
	}
	type QueryRuleParams = Pager & {
		custodianIds?: number; // 用户id
		departmentIds?: number; // 部门id
		isEnabled?: boolean; // 是否启用
		loginPhone?: string; // 登录账号
		name?: string; // 用户姓名
		roleId?: number; // 角色id
		supplierIds?: Array; // 供应商id
		type?: string; // 用户类型
		typeList?: any; // 用户类型集合
	};
	type AddUserRuleParams = {
		contactId?: any; // 用户id
		createdBy?: number;
		email?: string; // 电子邮箱
		gender?: string;
		id?: number;
		initialPassword?: string; // 初始密码
		isDeleted?: boolean;
		loginPassword?: string; //登录密码
		loginPhone?: string;
		modifiedBy?: number;
		name?: string; // 用户姓名
		profileImg?: string; //头像地址
		remark?: string;
		roleIds?: number[]; // 权限id集合
		timeCreated?: number;
		timeModified?: number;
		titleId?: number;
		type?: string; // 用户类型
		storageAreaIds?: number[]; // 所属库房，用户类型为医院并且所属科室为中心库或者用户类型为共享服务时需要传
	};
	interface QueryPusherListRecord {
		id: number;
		name: string;
	}
	type UserListParams = {
		id?: number;
		loginPwdUpdateTime?: number;
		isEnabled?: boolean; //
		loginPhone?: string; //登录账号
		type?: string; // 用户类型
		roles?: Array; // 用户权限
		departmentName?: string; //所属科室
		distributorName?: string; // 配送商业
		name?: string; // 用户姓名
		isSystem?: string;
		initialPassword?: number;
		storageAreaNames?: string[]; // 库房名称列表
	};

	//根据角色Id获取用户列表 出参
	interface ByRoleIdGetUserRecord {
		appKey?: string;
		code?: string;
		contactId?: number[];
		createdBy?: number;
		custodianName?: string;
		departmentName?: string; //科室
		distributorName?: string; //配送商业
		email?: string; //邮箱
		id?: number;
		initialPassword?: string; //初始密码
		isDeleted?: boolean;
		isEnabled?: boolean; //状态
		lastLoginTime?: number;
		loginErrorCount?: number; //登录错误次数
		loginPassword?: string; //登录密码
		loginPhone?: string; //登录账号
		loginPwdUpdateTime?: number; //密码更新时间
		modifiedBy?: string; // 修改人id
		name?: string; //用户姓名
		permissions?: string[];
		profileImg?: string; // 头像
		remark?: string; //备注
		supplierName?: string;
		system?: boolean;
		timeCreated?: number;
		timeModified?: number;
		titleId?: number;
		titleName?: string;
		type?: string; //类型
		roles?: Array;
	}
	//根据角色Id获取用户列表 入参
	type ByRoleIdGetUserParams = CommonPageParams & {
		name?: string;
		roleId?: number;
		typeList?: string;
		status?: boolean;
		loginPhone?: string;
	};

	type UserDetailItem = {
		type?: string; // 类型
		useType?: string;
		rolesText?: string; //角色
		name?: string; // 用户姓名
		email?: string; // 邮箱
		loginPhone?: string; //登录账号
		timeCreated?: string; //创建时间
		remark?: string; //备注
		profileImg?: string; //头像
		userTypeLabel?: string; //所属科室
		distributorName?: string;
		roles?: any[];
		departmentName?: string;
		roleIds?: number[];
		userType?: string;
	};
	type UserDateItem = {
		phoneNumber: string; //手机号码
		appKey?: string;
		code?: string; // 推送单号
		contactIds?: Array[];
		createdBy?: number; //创建人员id
		custodianName?: string; // 一级配送商业
		departmentName?: string; // 物资验收单
		distributorId?: number; //配送商业id
		distributorName?: string; //配送商业名字
		email?: string; //邮箱
		gender?: string; // 性别
		hospitals?: [object];
		id?: number;
		initialPassword?: string; // 初始密码
		isAssociateToDepartment?: string;
		isAssociateToRole?: string;
		isDeleted?: boolean;
		isEnabled?: boolean; // 启用禁用配送商业
		lastLoginTime?: timeType; // 上次登录时间
		loginErrorCount?: number; // 登录错误的次数
		loginPassword?: string; // 登录密码
		loginPhone?: string; // 登录账号
		loginPwdUpdateTime?: timeType; // // 登录密码重置时间
		modifiedBy?: string; // 修改人要不
		name?: string; // 用户类型
		permissions?: [object]; // 权限字典
		profileImg?: string; // 头像地址
		remark?: string; //备注
		roles?: Array<string, object>;
		supplierName?: string; // 供应商 id
		system?: boolean;
		timeCreated?: timeType; //开始  时间
		timeModified?: timeType; // 结束时间
		titleId?: string;
		titleName?: string;
		type?: string;
		roleIds?: number[]; // 权限集合
		rolesText?: string; //角色
		storageAreaIds?: number[]; // 所属库房
	};
	type GetUserListByDepId = {
		departmentIds?: string;
		pageNum?: number;
		pageSize?: number;
	};
	interface GetUserQueryListByDepId {
		appKey?: string;
		code?: string;
		contactIds?: number;
		createdBy?: number; // 创建人
		custodianName?: string; // 一级配送商业
		departmentName?: string; // 科室
		distributorId?: number; // 配送商业  id
		distributorName?: string; // 配送商业  名字
		email?: string; // 邮箱
		gender?: string; // 性别
		hospitals?: string;
		id?: number;
		initialPassword?: string; // 初始密码
		isAssociateToDepartment?: string;
		isAssociateToRole?: string;
		isDeleted?: boolean;
		isEnabled?: boolean; // 配送商业启用禁用状态
		lastLoginTime?: string; //‘上次登录时间
		loginErrorCount?: number; // 登录错误次数
		loginPassword?: string; // 登录密码
		loginPhone?: string; // 登录账号
		loginPwdUpdateTime?: string; // 登录密码重置时间
		modifiedBy?: string; // 修改人
		name?: string;
		permissions?: string; // 用户权限
		profileImg?: string; //头像
		remark?: string; // 备注
		roles?: string;
		supplierName?: string; // 配送商业名称
		system?: boolean;
		timeCreated?: string; // 创建时间
		timeModified?: string; // 修改时间
		titleId?: number;
		titleName?: string;
		type?: string;
	}
}
