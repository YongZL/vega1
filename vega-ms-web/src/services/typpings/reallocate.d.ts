// 调拨业务 reallocate-controller
declare namespace ReallocateController {
	//获取调拨详情列表 出参
	type GoodsListRecord = {
		expirationDate?: number;
		goodsId?: number;
		goodsItemId?: number;
		goodsName: string; //物资名称
		id: number;
		lotNum?: string;
		manufacturerId?: number;
		manufacturerName: string; //生产厂家
		materialCode?: string;
		minUnitName: string; //单位
		model?: string; //型号
		operatorBarcode?: string; //物资条码
		productionDate?: number;
		purchaseUnitName?: string;
		registrationNum?: string;
		remarks: string; //调拨事由
		specification: string; //规格
		status: string; //验收状态
		sterilizationDate?: number;
		supplierId?: number;
		supplierName?: string;
		unitNum?: number;
	};
	type OrderRecord = {
		approvedName: string; //审核人员
		code: string; //调拨单号
		createdBy: number;
		createdName: string;
		hospitalId: number;
		id: number;
		sourceDepartmentId: number;
		sourceDepartmentName: string; //发起科室
		sourceWarehouseId: number;
		sourceWarehouseName: string; //发起仓库
		status: string;
		targetDepartmentId: number;
		targetDepartmentName: string; //接收科室
		targetWarehouseId: number;
		targetWarehouseName: string; //接收仓库
		timeApproved: number; //审核时间
		timeCreated: number;
		sumPrice?: number;
	};

	interface ReallocateDetailRecord {
		goodsList: GoodsListRecord[];
		order: OrderRecord;
	}

	type ReallocateApprovalParams = {
		reallocateId: number; //调拨单号
		reason?: string; //原因
		status: boolean; //状态
	};

	type ReallocateParams = {
		reallocateId?: number; //调拨id
	};

	//调拨暂时只有基础物资
	interface ReallocateRecord {
		detail: []; //详情
		goodsList?: GoodsList[]; //基础物资详情
		order: Order;
		packageBulkList: any[]; //定数包
		packageOrdinaryList: any[]; //医耗套包
		sumPrice?: number; // 总金额
		sumQuantity?: number; //总数量
		surgicalPkgBulkList: any[]; //定数包
	}

	interface GoodsList {
		acceptedBy?: string;
		acceptedName?: string;
		expirationDate?: number;
		goodsId?: number; //物资id
		goodsItemId?: number;
		goodsName?: string; //物资名称
		id?: number;
		lotNum?: string;
		manufacturerId?: number;
		manufacturerName?: string;
		materialCode?: string;
		minUnitName?: string; //单位
		model?: string;
		operatorBarcode: string;
		productionDate?: number;
		purchaseUnitName?: string;
		reason?: string; //原因
		registrationNum?: string;
		remarks?: string; //调拨事由
		specification?: string;
		status?: string;
		sterilizationDate?: number;
		supplierId?: number;
		supplierName?: string;
		timeAccepted?: number;
		unitNum?: number;
		isBarcodeControlled?: boolean;
		printed?: boolean;
		udiCode?: string;
	}

	interface Order {
		acceptedBy?: string;
		acceptedName?: string;
		acceptedReason?: string; //验收原因
		approvedBy?: number;
		approvedName?: string; //审核人员
		approvedReason?: string;
		code?: string;
		containedDepartment?: boolean;
		createdBy?: number;
		createdName?: string;
		detail?: string;
		hospitalId?: number;
		id?: number;
		modifiedBy?: string;
		modifiedName?: string;
		reallocateReason?: string; //调拨原因
		sourceDepartmentId?: number;
		sourceDepartmentName?: string; //发起科室
		sourceWarehouseId?: number;
		sourceWarehouseName?: string; //发起仓库
		status?: string;
		targetDepartmentId?: number;
		targetDepartmentName?: string; //接收科室
		targetWarehouseId?: number;
		targetWarehouseName?: string; //接收仓库
		timeAccepted?: string;
		timeApproved?: number; //审核时间
		timeCreated?: number;
		timeModified?: number;
	}

	interface DataItem {
		code?: string;
		sourceDepartmentName?: string; //发起科室
		sourceWarehouseName?: string; //发起仓库
		targetDepartmentName?: string; //接收科室
		targetWarehouseName?: string; //接收仓库
		approvedName?: string; //审核人员
		timeApproved?: number; //审核时间
	}

	type PassParams = {
		operatorBarcode?: any;
		reallocateId?: number;
	};

	type MakingReallocateParams = {
		details: Record<string, any>[];
		sourceWarehouseId: string | number;
		targetWarehouseId: string | number;
	};

	type Approve = {
		status: boolean; //状态
		reason?: string; //原因
		reallocateId?: number; //调拨单id
		operatorBarcodeList: string[]; //条码
	};
}
