// login-web-controller
declare namespace LoginWebController {
	interface LoginParams {
		loginPhone: string; // 登录账号
		loginPassword: string; // 登录密码
	}

	interface Hospital {
		address?: string; // 医院地址
		createdBy: number; // 创建人id
		id: number; // 医院id
		isDeleted: boolean;
		modifiedBy?: number; // 修改人id
		name: string; // 医院名称
		parentId: number; // 父级id
		profileImg: string; // 医院logo
		shortName: string; // 医院简称
		timeCreated: number; // 创建时间
		timeModified?: number; // 修改时间
	}

	interface Role {
		code: string;
		createdBy: number; // 创建人id
		enabled: boolean; // 是否启用
		hospitalId: number; // 所属医院
		id: number; // 角色id
		isDeleted: boolean;
		isSystemDefined: boolean;
		modifiedBy?: number; // 修改人id
		name: string; // 角色名称
		permissionIds?: number[]; // 权限id列表
		permissions?: string[]; // 权限列表
		remark?: string; // 备注
		timeCreated: number; // 创建时间
		timeModified?: number; // 修改时间
		type: string; // 角色类型
	}

	interface User {
		account: string; // 账号
		appKey: string;
		code?: string;
		custodianName?: string;
		departmentName: string; // 科室名称
		email?: string; // 邮箱
		gender?: string; // 性别
		hospitals: Hospital[];
		id: number; // 用户id
		loginPhone: string; // 登录账号
		loginPwdUpdateTime: number; // 登录密码重置时间
		name: string; // 用户名
		profileImg?: string; // 头像地址
		roles: Role[];
		supplierName?: string; // 供应商名称
		titleId?: number; // 标题id
		titleName: string; // 标题
		type: string; // 角色类型

		// /api/admin/login/web/1.0/verify_login接口的数据
		contactIds?: number[];
		createdBy: number; // 创建人id
		distributorName?: string; // 经销商名称
		initialPassword: string; // 初始密码
		// isAssociateToDepartment: null
		// isAssociateToRole: null
		isDeleted: boolean;
		isEnabled: boolean; // 是否启用
		lastLoginTime?: number; // 上次登录时间
		loginErrorCount: number; // 登录错误的次数
		loginPassword: string; // 登录密码
		modifiedBy?: number; // 修改人id
		permissions: Permission[];
		remark?: string; // 备注
		roles: Role[];
		system: boolean;
		timeCreated: number; // 创建时间
		timeModified?: number; // 修改时间
		systemType: 'Insight_MS' | 'Insight_RS' | 'Insight_GS' | 'Insight_DS'; // 当前系统类型 Insight_MS-器械耗材 Insight_RS-试剂 Insight_GS-总务物资 Insight_DS-药品
	}

	interface Permission {
		children?: Permission[];
		code: string;
		createdBy: number; // 创建人id
		hospitalId: number; // 医院id
		icon: string;
		id: number; // 权限id
		isDeleted: boolean;
		modifiedBy: number; // 修改人id
		name: string; // 权限名称
		parentId?: number; // 父级id
		remark: string; // 备注
		route?: string; // 路由
		sort: number; // 排序
		timeCreated: number; // 创建时间
		timeModified?: number; // 修改时间
		type: 'menu' | 'function'; // 权限类型
	}
}
