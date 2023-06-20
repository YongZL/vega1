// equipment-controller

declare namespace EquipmentController {
	interface EquipmentRecord {
		id?: number;
		status?: 0 | 1; // 状态 0-禁用 1-启用
		equipmentName?: string; // 设备名称
		equipmentCode?: string; // 卡片编号
		materialCode?: string; // 设备编码
		assetClassification?: string; // 资产分类
		departmentName?: string; // 所属部门
		equipmentStoragePlace?: string; // 设备存放地点
		getTime?: number; // 取得时间
		price?: string | number; // 原始价值
	}

	interface EditParams {
		id?: number;
		assetClassification: string;
		departmentName: string;
		equipmentCode: string;
		equipmentName: string;
		equipmentStoragePlace: string;
		price: string | number;
		getTime: number;
	}

	type PageListParams = Pager & Partial<Omit<EditParams, 'id'>>;
}
