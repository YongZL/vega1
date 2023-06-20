//仓库 warehouse-controller
declare namespace WarehouseController {
	//获取仓库列表 出参
	interface WarehouseRecord {
		createdB?: string; //创建人
		deliveryGroupId?: number; //推送组别id
		deliveryGroupName?: string; //推送组别
		departmentId?: number; //科室id
		departmentName?: string; //所属科室
		hospitalId?: number; //所属医院id
		id: number;
		isDeleted?: boolean;
		isVirtual?: boolean; //是否虚拟库
		level?: number; //仓库类型
		modifiedBy?: number; //修改人id
		name: string; //仓库名称
		nameAcronym?: string;
		priority?: string; //推送优先级别
		timeCreated?: number; //创建时间
		timeModified?: number; //修改时间
	}
	//获取仓库列表 入参
	type WarehouseListParams = Pager & {
		name?: string; //仓库名称
		departmentIds?: number; //所属科室
		level?: string; //仓库类型
		virtual?: boolean; //是否为虚拟库
	};

	//获取仓库详情 出参
	interface WarehouseDetailItem {
		name: string; //仓库名称
		departmentName: string; //所属科室
		level: number; //仓库类型
		isVirtual: boolean; //是否为虚拟库
		deliveryGroupName: string; //推送组别
		priority: string; //推送优先级别
		timeCreated: number; //创建时间
		deliveryGroupId: number;
		departmentId: number; //所属科室Id
	}

	//新增仓库
	type AddWarehouseParams = {
		name: string; //仓库名称
		level: number; //仓库类型
		departmentId: number; //科室id
		isVirtual: boolean; //是否为虚拟库
		priority: string; //推送优先级别
		deliveryGroupId: number; //推送组别id
	};

	//编辑仓库
	type EditWarehouseParams = AddWarehouseParams & {
		id: number;
	};

	interface GroupListItem {
		id: number;
		name: string;
	}
	type WarehouseParams = Pager & {
		departmentId; //科室id
	};

	interface GetCentralWare {
		createdBy: number;
		deliveryGroupId: number;
		deliveryGroupName: string;
		departmentId: number;
		departmentName: string;
		hospitalId: number;
		id: number;
		isDeleted: boolean;
		isVirtual: boolean;
		level: number;
		modifiedBy: string;
		name: string;
		nameAcronym: string;
		priority: string;
		timeCreated: number;
		timeModified: number;
	}

	interface ByUserData {
		id: number;
		isDeleted: boolean;
		timeCreated: number;
		timeModified: number;
		createdBy: number;
		modifiedBy: number;
		departmentName: string;
		hospitalId: number;
		departmentId: number;
		name: string;
		level: number;
		deliveryGroupId: number;
		deliveryGroupName: string;
		priority: string;
		isVirtual: boolean;
		nameAcronym: string;
	}

	interface WarehouseFiled {
		id?: number; // id
		isDeleted?: boolean;
		timeCreated?: number;
		timeModified?: number;
		createdBy?: number;
		modifiedBy?: number;
		hospitalId?: string; // 医院id
		displayFieldLabel?: string; // 物资属性label描述
		displayFieldKey?: string; // 物资属性key标识
		enabled?: boolean; // 是否启用
		required?: boolean; // 是否是必填
		listShow?: boolean; // 是否在列表展示
		lineShow?: boolean; // 扩展字段是否在一行显示
		displayFieldType?: 'Integer' | 'Float' | 'Long' | 'Double' | 'String' | 'Date' | 'Boolean'; // 物资属性类型
		sort: number;
		listSort: number;
	}
}
