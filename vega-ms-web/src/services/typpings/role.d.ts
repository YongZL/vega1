//角色 : Role Controller

declare namespace RoleController {
	//获取角色列表出参
	interface RoleRecord {
		code: string;
		id: number; // 角色id
		createdBy: number;
		isDeleted: boolean;
		modifiedBy?: number;
		name: string; // 角色名称
		remark?: string; // 备注
		type: string; // 角色类型
		isSystemDefined: boolean;
		enabled: boolean; // 是否启用
		hospitalId: number; // 所属医院
		permissionIds?: number[]; // 权限id列表
		permissions?: Permissions[]; // 权限列表
		timeCreated: number; // 创建时间
		timeModified?: number; // 修改时间调拨类型
	}

	//获取角色列表入参
	type RoleListParams = {
		type?: string;
		typeList?: string[]; //类型
		status?: string[] | boolean; //状态
		name?: string; //用户资料
		desc?: string;
		end?: number; //创建结束时间
		start?: number; //创建开始时间
		pageSize?: number;
		pageNum?: number;
	};

	//启用/禁用入参
	type EnableParams = {
		id: number;
		type: number;
	};

	//新增/编辑角色入参
	type AddRoleParams = {
		code: string; //编码
		id: number;
		remark: string; //备注
		type: string; //类型
		name: string; //权限名称
		isSystemDefined: boolean;
		permissionIds: number[]; //权限id
	};

	type RoleControllerPager = Pager & {
		keyword?: string;
	};
	type Permissions = {
		children?: Permissions[]
		code: string;
		createdBy: number;
		hospitalId: number
		icon: string;
		id: number;
		isDeleted: boolean;
		modifiedBy?: string;
		name: string;
		parentId: number;
		remark?: string;
		route?: string;
		sort: number;
		timeCreated: number;
		timeModified: number;
		type: string
	}
}
