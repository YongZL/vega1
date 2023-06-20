// goods-request-controller 入库业务
declare namespace GoodsRequestController {
	//获取入库详情 出参
	interface DetailRecord {
		approvalBy: number; //审核人员
		approvalByName: string; //请领人
		approvalReviewBy: number;
		approvalReviewByName: string;
		approvalReviewTime: number;
		approvalTime: number;
		code: string;
		createdBy: number; //请领单/调拨单创建人id
		createdByName: string; //创建人名
		departmentId: number; // 科室id
		departmentName: string;
		expectedTime?: number;
		hospitalId: number;
		id: number;
		isDeleted: boolean;
		items: Record<string, any>[];
		modifiedBy: number;
		reason?: string;
		status: string;
		submitTime: number;
		timeCreated: number;
		timeModified: number;
		warehouseId: number;
		warehouseName: string;
	}

	interface GoodsRecord {
		limitType: string;
		amount: number;
		requestItemId: number;
		requestNum: number;
		approvalQuantity: number; //审核数量
		approvalReason?: string; //批注
		approvalReviewQuantity: number; //复核数量
		approvalReviewReason?: string; //批注
		commonName?: string; //通用名称
		conversionRate: number; //转换比
		conversionUnitId: number;
		conversionUnitName: string; //请领单位
		goodsId: number;
		goodsName: string; //物资名称
		goodsRequestId: number;
		id: number;
		inboundPerMonth: number;
		isCombined: boolean;
		isDeleted: boolean;
		largeBoxNum?: number;
		limitPerMonth: number;
		manufacturerName: string; //生产厂家
		materialCode: string; //物资编号
		minGoodUnitNum: number;
		minGoodsNum: number;
		minGoodsUnit: string; //最小单位
		model?: string; // 型号
		omsGoodsRequestId: number;
		operationRecords: string; //备注
		price: number;
		purchaseGoodsUnit: string;
		quantity: number; //请领数量
		requestReason: string;
		specification: string; //规格
		stocks: number; //库存量
		timeCreated: number; //创建时间
		timeModified: number;
	}

	interface OrdinaryRecord {
		approvalQuantity: number;
		approvalReason?: string;
		approvalReviewQuantity: number;
		approvalReviewReason?: string;
		description: null;
		detailGoodsMessage: string;
		goods: OrdinaryGoodsRecord[];
		name: string;
		operationRecords: string;
		ordinaryCode: string;
		ordinaryId: number;
		requestItemId: number;
		requestNum: number;
		requestReason: string;
		status: boolean;
		stocks: number;
	}

	interface OrdinaryGoodsRecord {
		chargeCode?: string;
		chargeName?: string;
		chargeNum: string;
		description?: string;
		detailGoodsMessage?: string;
		goodsId?: number;
		id?: number;
		largeBoxNum: number;
		manufacturerName: string;
		materialCode: string;
		menabled: boolean;
		minGoodsNum: number;
		minGoodsUnit: string;
		model: string;
		name: string;
		ordinaryCode?: string;
		packageBulkCode?: string;
		packageBulkId?: number;
		packageBulkName?: string;
		packageOrdinaryId?: number;
		packageOrdinaryName?: string;
		price?: number;
		purchaseGoodsUnit: string;
		quantity: number;
		specification: string;
		unitNum: number;
	}

	type ApprovalParams = {
		id: number;
		reason?: string;
		status: string;
		items: Record<string, any>[];
	};

	// 发起入库申请 基础物资
	type AddGoodsParams = {
		warehouseId: number; //仓库id
		items: {
			goodsId: number; //物资id
			quantity: number; //数量
			requestReason?: string; //备注
		}[];
	};

	//发起入库申请 医耗套包
	type AddOrdinaryParams = {
		warehouseId: number; //仓库id
		items: {
			ordinaryId: number; //医耗套包id
			quantity: number; //数量
			requestReason?: string; //备注
		}[];
	};

	//编辑入库申请 基础物资
	type EditGoodsParams = AddGoodsParams & {
		id: number;
	};

	//编辑入库申请 医耗套包
	type EditOrdinaryParams = AddOrdinaryParams & {
		id: number;
	};
}
