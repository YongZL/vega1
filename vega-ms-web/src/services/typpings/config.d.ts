// config-controller
declare namespace ConfigController {
	interface ConfigListParams {
		feature?: string; // 功能
		hospitalId?: number | string; // 医院id
		isDeleted?: boolean;
		module?: string; // 模块
		name?: string; // 参数名
		nameCode?: string; // 参数变量名
	}
	interface Config {
		createdBy: number; // 创建人id
		endDate?: number;
		feature: string;
		hospitalId: number;
		id: number;
		isDeleted?: boolean;
		modifiedBy?: number; // 修改人id
		module: string;
		name: string;
		startDate: number;
		timeCreated?: number;
		timeModified?: number;
		value: any;
	}
	interface UserType {
		label?: string;
		key?: string;
		value?: string;
	}
}
