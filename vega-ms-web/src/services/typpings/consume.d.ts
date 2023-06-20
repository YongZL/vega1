// ConsumeController
declare namespace ConsumeController {
	interface SearchGoodsInfo {
		id: number;
		barcode: string;
		quantity: number;
		remainQuantity: number; // 剩余数量
		editQuantity: boolean;
		keyItem: boolean; // 重点物资
		serialNo: string;
		isDeleted: boolean;
		timeCreated: number;
		timeModified: number;
		createdBy: number;
		modifiedBy: number;
		goodsName: string;
		model: string;
		specification: string;
		isHighValue: string;
		hospitalId: number;
		purchaseId: number;
		goodsId: number;
		status: string;
		statusUserId: number;
		serialNum: string;
		lotNum: string;
		gs1Code1: string;
		gs1Code2: string;
		gs1Code3: string;
		operatorBarcode: string;
		price: number;
		productionDate: number;
		expirationDate: number;
		sterilizationDate: number;
		storageAreaId: number;
		storageAreaType: string;
		storageCabinetId: number;
		storageLocationId: number;
		remainQuantity: number;
		initQuantity: number;
		warehouseId: number;
		warehouseName: string;
		departmentName: string;
		manufacturerName: string;
		supplierName: string;
		supplierId: number;
		receivingReportItemId: number;
		materialCode: string;
		minGoodsUnit: string;
		minGoodsUnitId: number;
		isBarcodeControlled: boolean;
		custodianName: string;
		custodianId: number;
		purchaseGoodsUnitId: number;
		udiCode: string;
		presenter: boolean;
		printed: boolean;
		distributorName: string;
		distributorId: number;
		distributorBeans: {
			id: number;
			companyName: string;
			distributorId: number; //	配送商业id
			distributorName: string; //配送商业名称
		}[];
		enabled: boolean;
		success?: boolean;
		errorMessage?: string;
		isBatchConsume: boolean;
		maximumConsumable: number;
	}

	interface BatchConsumeParams {
		adviceId?: number;
		operatorBarcode?: string[];
	}

	interface BatchUnConsumeParams {
		reason: string;
		operatorBarcode?: string[];
	}

	interface ConsumeParams {
		adviceId: number;
		barcode: string;
	}

	interface UnConsumeParams {
		reason: string;
		barcode: string;
	}

	interface SearchConsumeParams {
		operatorBarcode: string;
		related: boolean;
	}

	interface SearchDateParams {
		operatorBarcode: string;
		related: boolean;
	}
	// 分页查询商品消耗记录 入参
	type GoodsConsumeList = Pager & {
		departmentIds?: number; //消耗科室
		acceptanceCode?: string; //验收单号
		presenter?: string; //赠送物资
		commonName?: string; //通用名

		sourceDepartmentIds?: number; //消耗科室id

		operatorBarcode?: string; //物资条码

		materialCode?: string; //物资编码

		type?: string; // 消耗方式
		push_consume?: string; //消耗方式：scan_consume（扫码消耗），push_consume（推送消耗）

		goodsName?: string; // 物资名称

		chargeNum?: number; //医保编号

		implantation?: boolean; //植入物，true是，false否

		highValue?: boolean; //物资属性，true高值，false低值

		start?: string; //消耗开始时间

		end?: string; //消耗结束时间
	};
	// 分页查询商品消耗记录 出参
	type QueryGoodsConsumeList = {
		page: ResponseList<QueryGoodsConsumeListpage[]>;
		summary?: {
			totalPrice?: number;
			totalQuantity?: number;
		};
	};
	type QueryGoodsConsumeListpage = {
		acceptanceCode?: string; //验收单号
		approvalById?: number;
		approvalByName?: string; //请领人
		approvalTime?: string; //请领时间
		chargeNum?: string; //本地医保编码
		chargeable?: boolean;
		commonName?: string; //通用名
		consumeBy?: string; //消耗人
		consumeTime?: string; //消耗时间
		consumeType?: string; //消耗方式
		custodianId?: number;
		custodianName?: string;
		departmentId?: number; //消耗科室id
		departmentName?: string; //消耗科室名字
		expirationDate?: string; //有效期至
		goodsId?: number; // 物资id
		goodsItemId?: number;
		goodsName?: string; // 物资名称
		highValue?: boolean; // 物资属性
		hospitalId?: number;
		hospitalName?: string;
		id?: number;
		implantation?: boolean; // 植/介入物
		insideStatement?: boolean;
		lotNum?: string; //批号/序列号
		manufacturerId?: number;
		manufacturerName?: string;
		materialCode?: string; //物资编号
		medicalCharge?: boolean; //开单科室
		model?: string; //规格
		operatorBarcode?: string; //物资条码
		packageBulkItemId?: number;
		price?: number; //单价(元)
		productionDate?: string; //生产日期
		quantity?: number; //数量
		returningGoods?: boolean;
		sourceDepartmentId?: number; //消耗科室
		sourceDepartmentName?: string; //消耗科室
		specification?: string; //型号
		sterilizationDate?: string; // 灭菌日期
		supplierId?: number;
		supplierName?: string;
		surgicalPackageBulkItemId?: number;
		totalPrice?: number; //基础物资消耗总金额
		udiCode?: string; //物资条码
		unitId?: number;
		unitName?: string; //单位
		unitNum?: number;
		warehouseId?: number;
		warehouseName?: string;
		barcodeControlled?: boolean;
		printed?: boolean;
		serialNum?: string;
		keyItem: boolean;
	};
	//QueryordinaryConsumeList  分页查询医耗套包消耗记录 入参
	type OrdinaryConsumeList = Pager & {
		departmentIds?: number; //消耗科室
		operatorBarcode?: string; //物资条码
		acceptanceCode?: string; //验收单号
		consumeType?: string; //消耗方式
		keyword?: string; //套包编号/名
		start?: string; //开始时间
		end?: string; //结束时间
	};
	// 分页查询医耗套包消耗记录 出参
	type QueryordinaryConsumeList = {
		acceptanceCode?: string; //验收单号
		approvalByName?: string; //请领人
		approvalTime?: string; //请领时间
		consumeTime?: string; //消耗时间
		consumeType?: string; // 消耗方式
		custodianName?: string;
		departmentName?: string; //消耗科室
		expirationDate?: string; //有效期至
		goodsId?: number; //物资id
		goodsName?: string; // 物资名称
		hospitalId?: number;
		id?: number;
		manufacturerName?: string;
		name?: string; //医耗套包名称
		operatorBarcode?: string; //套包条码
		ordinaryCode?: string; //套包编号
		ordinaryItemId?: number | string;
		productionDate?: string; //生产日期
		quantity?: string;
		sterilizationDate?: string; //灭菌日期
	};
	// 查询医耗套包记录详情 出参
	type QueryGetOrdinaryConsumeDetails = {
		id?: number;
		operatorBarcode?: string; //物资条码
		goodsName?: string; //商品名称
		lotNum?: number; //批号
		unitNum?: string; //数量
		supplierName?: number; //供应商
		departmentName?: string; //科室名称
		consumeType?: string; //消耗类型
	};
	// 查询基础物资记录详情 出参
	type QueryConsumeDetails = {
		operatorBarcode?: string; //物资条码
		goodsName?: string; //商品名称
		lotNum?: number; //批号
		quantity?: string; //数量
		supplierName?: number; //供应商
		departmentName?: string; //科室名称
		consumeType?: string; //消耗类型
	};

	interface Patient {}

	interface ScanConsumeDataType {}
}
