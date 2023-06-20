// PurchaseNewController
declare namespace PurchaseNewController {
	interface WithPageListRecord {
		id: number;
		timeCreated: number; //创建时间
		timeExpected: number; //期望到货时间
		status: string; // 状态
		reason: string; //审核不通过理由
		timeAudited: number; //审核时间
		auditedBy: number; //审核人员id
		auditedName: string; //审核人员
		goodsId: number; //物资id
		surgicalPackageId: number;
		surgicalPackageRequestItemId: number;
		hospitalName: string; //医院名称
		hospitalId: number; //医院id
		departmentName: string; //请领科室
		departmentId: number; //请领科室id
		planCode: string; //申请单号
		quantity: number;
		pmCode: string;
		planName: string; // 物资名称
		price: number; //价格
		brand: string; //品牌
		unit: string; //单位id
		unitQuantity: number; //单位数量
		purchaseUnit: string; //采购单位
		model: string; // 型号
		specification: string; //规格
		manufacturerName: string; //生产商
		chargeNum: string; //本地医保编码
		isConverted: boolean;
		goodsType: string;
		orderId: number; //订单id
		orderCode: string; // 订单编号
		orderCodes: string;
		materialCode: string; //物资编号
		generateDescription: string;
		diCode: string; // 器械标识
		distributorList: {
			distributorId: number; //	配送商业id
			distributorName: string; //配送商业名称
		};
		nearExpirationDays: number; //期望到货时间
		materialCategory: string; //物资类别
		createdName: string; //请领人
		ogrCreatedTime: number; // 请领时间
		approvalName: string; //审核人
		approvalTime: number; //审核时间
		approvalReviewName: string; //复核人
		approvalReviewTime: number; // 复核时间
		surgicalPackage: boolean; //是否套包
		highValue: boolean; //是否高值
		distributorBeans: {
			id: number;
			companyName: string;
			distributorId: number; //	配送商业id
			distributorName: string; //配送商业名称
		}[]; //配送商业集合
		largeBoxNum: string;
		distributorName: string;
		minGoodsUnit: string;
		isUrgent: boolean;
		selectedRow?: number; // 选择的配送商业id
	}

	type WithPageListPager = Pager & {
		type?: string; //采购类型
		departmentIds?: string; //来源科室
		orderCode?: string; // 订单编号
		planCode?: string; // 申请单号
		materialCod?: string; // 物资编号
		diCode?: string; //器械标识
		planName?: string; //物资名称
		chargeNum?: string; // 本地医保编码
		manufacturerName?: string; // 生产商
		distributoId?: number; // 配送商业id
		materialCategory?: string; //物资类别
		brand?: string; // 品牌
	};

	interface DetailParams {
		id: number;
	}

	interface DetailPlanVo {
		id: number; //采购计划id
		timeCreated: number; //创建时间
		timeExpected: number; //期望到货时间
		status: string; //状态
		reason: string; //审核不通过理由
		timeAudited: number; //审核时间
		auditedBy: number; //审核人id
		auditedName: string; //审核人
		goodsId: number; //物资id
		hospitalName: string; //医院名称
		hospitalId: number; //医院id
		departmentName: string; //请领科室
		departmentId: number; //请领科室id
		planCode: string; //申请单号
		type: string; //类型
		quantity: number; //申请数量
		planName: string; //物资名称
		price: number; //价格
		brand: string; //品牌
		unit: string; //单位id
		unitQuantity: number; //单位数量
		model: string; //规格
		specification: string; //型号
		manufacturerName: string; //生产商
		chargeNum: string; //本地医保编码
		isConverted: boolean; //是否已转订单
		goodsType: string; //物资类型
		orderId: number; //订单id
		orderCode: number; //订单编号
		orderCodes: number; //订单号
		materialCode: string; //物资编号
		generateDescription: string;
		diCode: string; //器械标识
		supplierName: string;
		nearExpirationDays: number; //期望到货时间
		materialCategory: string; //物资类别
		createdName: string; //请领人
		ogrCreatedTime: string; //请领时间
		approvalName: string; //审核人
		approvalTime: number; //审核时间
		approvalReviewName: string; //复核人
		approvalReviewTime: number; //复核时间
		highValue: boolean; //是否高值
	}

	interface DetailListRecord {
		goodsCode: string;
		goodsName: string; //物资名称
		model: string; //型号
		specification: string; //规格
		manufacturerName: string; //生产商
		unit: string; //单位id
		quantity: number; //申请数量
		price: number; //单价
		goodsType: string; //物资类型
		goodsId: number; //物资id
		materialCode: string; //物资编号
		diCode: string; //器械标识
		distributorBeans: {
			distributId: number; //配送商业id
			field_10: string; //配送商业名称
		}[]; //配送商业
		nearExpirationDays;
		number; //近效期
		materialCategory: string; //物资类别
	}

	interface DetailData {
		planVo: DetailPlanVo;
		details: DetailListRecord[];
	}

	interface AuditParams {
		status?: boolean; // 通过true，驳回false
		goodsRelationDistributorDtos?: {
			planId: number; //采购计划id
			goodsId: number; //物资id
			distributorId: number; //配送商业id
		}[]; // 勾选采购计划唯一标识集合
		planId?: number; // 采购计划id
		goodsId?: number; // 物资id
		distributorId?: number; // 配送商业id
		reason?: string; //审核不通过原因
	}

	interface AddPlanParams {
		goodsList: {
			goodsId: number; //物资id
			quantity: number; //申请数量
		}[];
	}

	interface ConvertOrderParams {
		planIds: number[]; // 采购计划唯一标识集合
		expectedTime: number; //期望到货时间
		storageAreaId: number; // 库房ID
	}

	interface CommitParams {
		target: number[]; // 勾选采购计划集合(采购计划id)
		status: boolean; // 提交：true
	}

	interface DetailPropsType {
		modalType?: string;
		modalVisible?: boolean;
		setModalVisible?: (state: boolean) => void;
		data?: any[];
		target?: number;
		selectList?: PurchaseNewController.WithPageListRecord[];
		resetData?: () => void;
		detailInfo?: Record<string, any>;
		tableRef?: ProTableAction;
	}

	interface LevelRecord {
		value: number;
		label: string;
		key: string;
	}
}
