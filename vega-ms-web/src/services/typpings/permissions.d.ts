// permission-controller
declare namespace PermissionsController {
	interface MenuItem {
		children?: MenuItem[];
		code: string;
		createdBy: number;
		hospitalId: number;
		icon?: string;
		id: number;
		isDeleted: boolean;
		modifiedBy?: number;
		name: string;
		parentId?: number;
		remark: string;
		route?: string;
		sort: number;
		timeCreated: number;
		timeModified: number;
		type: string;
	}

	interface PermissionsRecord {
		code: string;
		createdBy: number;
		hospitalId: number;
		icon: string;
		id: number;
		isDeleted: boolean;
		modifiedBy: string;
		name: string;
		parentId: number;
		remark: string;
		route: string;
		sort: number;
		timeCreated: number;
		timeModified: number;
		type: string;
		children: PermissionsRecord[];
	}

	export interface Permission {
		children?: PermissionItem[];
		code: string;
		icon: string;
		id: number;
		name: string;
		parentId?: number;
	}
	type QuerygetPermissionsListid = {
		children?: QuerygetPermissionsListid[];
		code?: String; //权限编码
		createdBy?: number;
		hospitalId?: number;
		icon?: String; // 图标
		id?: number;
		isDeleted?: Boolean;
		modifiedBy?: String;
		name?: String; //权限名称
		parentId?: number; //上级菜单
		remark?: String; //备注
		route: null; // 路由
		sort?: number; // 排序
		timeCreated?: number;
		timeModified?: number;
		type?: String; //序列号
		title?: string; //标题
		key?: string | number;
	};
	type QueryPutUpdate = {
		children?: QueryPutUpdate[];
		code?: string; //权限编码
		createdBy?: number;
		hospitalId?: number;
		icon?: string; // 图标
		id?: number;
		isDeleted?: boolean;
		modifiedBy?: number;
		name?: string; //权限名称
		parentId?: number; //上级菜单
		remark?: string; //备注
		route?: string; // 路由
		sort?: number; // 排序
		timeCreated?: number;
		timeModified?: number;
		type?: string; //序列号
	};
	type QueryPermissionTree = {
		code?: string; //权限编码
		createdBy?: number;
		hospitalId?: number;
		icon?: string; // 图标
		id?: number;
		isDeleted?: boolean;
		modifiedBy?: string;
		name?: string; //权限名称
		parentId?: number; //上级菜单
		remark?: string; //备注
		route?: string; // 路由
		sort?: number; // 排序
		timeCreated?: number;
		timeModified?: number;
		type?: string; //序列号
		disabled?: boolean;
		children?: Array;
	};
}
