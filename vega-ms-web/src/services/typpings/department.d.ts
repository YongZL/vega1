// 科室资料接口 department-controller

declare namespace DepartmentController {
	// 文档暂无备注
	interface DepartmentTreeList {
		address?: string; //地址
		bind?: boolean; //是否绑定
		children?: object[];
		contactName?: string; //联系人员姓名
		contactPhone?: string; //联系人员电话
		createdBy?: number;
		deptType?: string;
		districtCode?: string;
		districtId?: number;
		hospitalCampusId?: number;
		hospitalCampusName?: string; //所属院区
		hospitalId?: number;
		id?: number;
		isDeleted?: boolean;
		mergeName?: string; //所在区域
		name?: string; //科室名称
		nameAcronym?: null;
		parentId?: number;
		remark?: string; //备注
		timeCreated?: number; //创建时间
		timeModified?: number;
		disabled?: boolean;
		key?: React.Key;
		isCenterWarehouse?: boolean; // 是否是中心库
	}

	interface DepartmentGoodsAdd {
		consumeType?: string;
		name?: ReactNode;
		id?: number;
		isEnabled?: boolean;
		departmentId?: string;
		departmentName?: string;
		goodsId?: number;
		goodsName?: string; //物资名称
		commonName?: string; //通用名
		model?: string;
		specification?: number; // //规格/型号
		price?: number;
		materialCode?: string; //物资编号
		pmCode?: number;
		limitPerMonth?: string;
		limitType?: string;
		conversionRate?: string; //转换比
		conversionUnitId?: string;
		conversionUnitName?: string; //请领单位
		minGoodsUnitName?: string; //计价单位
		minGoodsUnitId?: number;
		barcodeControlled?: boolean;
		highValue?: boolean; //物资属性
		chargeNum?: string; //本地医保编码
		manufacturerId?: number; //生产厂家
		manufacturerName?: string; //生产厂家
		stockingUp?: string;
		barcodeControlled?: boolean;
	}
	interface DepartmentOrdinaryAdd {
		consumeType?: string;
		createBy?: string;
		description?: string;
		detailGoodsMessage?: string; //医耗套包说明
		id?: number;
		menabled?: boolean; //状态
		name?: string; //医耗套包名称
		ordinaryCode?: string; //医耗套包编号
		stocks?: number;
	}

	interface DepartmentOrdinaryList {
		address?: string; //地址
		bankAccount?: string;
		companyEmail?: string;
		companyEstablishedTime?: nulstringl;
		companyFax?: string;
		companyLegalPerson?: string;
		companyName?: string;
		companyNameAcronym?: string;
		companyNature?: string;
		companyTelephone?: number;
		companyType?: string;
		contactDepartment?: string;
		contactMobilePhone?: number;
		contactName?: string; //联系人员姓名
		contactPosition?: string;
		contactTelephone?: number;
		country?: string;
		createdBy?: number;
		depositBank?: string;
		districtCode?: number;
		hasPermitLicense?: string;
		hasRecordLicense?: string;
		hospitalId?: number;
		id?: number;
		isDeleted?: boolean;
		isEnabled?: boolean; //状态
		licenseManufacturerBusiness?: string;
		licenseManufacturerPermit?: string;
		manufactureRecordVoucher?: string;
		mergeName?: string; //所在区域
		modifiedBy?: string;
		nationality?: string;
		postcode?: number;
		principalEmail?: string;
		principalName?: string;
		principalPhone?: number;
		registrant?: string;
		remark?: string; //备注
		shortName?: string;
		timeCreated?: number; //创建时间
		timeModified?: number;
		type?: string;
		website?: string;
	}

	type UnbindTypeParams = Pager & {
		partmentId?: number;
		ordinaryId?: number;
		isCombined?: boolean;
		isCombinedDevelopment?: boolean;
	};
	interface SubmitTypeParams {
		name: string; //医耗套包名称
		hospitalCampusId: number;
		mergeName: string; //所在区域
		address: string; //地址
		contactName: string; //联系人员姓名
		contactPhone: string; //联系人员电话
		remark: string; //备注
		parentId: string;
		id: string;
	}

	interface BatchBindTypeParams {
		departmentIds?: number | string; //科室ids
		goodsId?: number | string; //物资ids
	}

	interface bindGoodsParams {
		conversionRate: number;
		conversionUnitId: number;
		departmentId: number;
		goodsId: number;
		settings: [];
	}

	interface batchBindGoodsParams {
		departmentId?: number;
		departmentIds?: number[];
		goodsIds?: number[];
		ordinaryIds?: number[];
	}

	interface WarehouseGoodsList {
		lowerLimit?: number;
		upperLimit?: number;
		warehouseId?: number;
		warehouseName?: string;
	}
	interface getAllMainDepartments {
		departmentId: number;
		departmentName: string;
		nameAcronym?: boolean
	}

	type SearchType = Pager & {
		departmentId?: string;
		departmentAdd?: string;
	};

	interface DepartmentRecord {
		materialCode?: number; //物资编号
		goodsName?: string; //物资名称
		commonName?: string; //通用名
		specification?: string; //规格/型号
		minGoodsUnitName?: string; //计价单位
		conversionUnitName?: string; //请领单位
		conversionRate?: number; //转换比
		highValue?: string; //物资属性
		isEnabled?: boolean; //状态
		departmentIds?: number[];
	}

	interface TreeList {
		map(arg0: (item: any) => JSX.Element);
		filter(arg0: (item: any) => any);
		children?: [];
		key?: number;
		title?: string;
		type?: any;
		value?: number;
	}

	interface TreeSearch {
		key?: string;
		label?: string;
		value?: number;
	}

	interface submitParams {
		departmentId?: number | string;
		settings: Array<string, number>;
		goodsId?: number;
		conversionRate?: number;
		conversionUnitId?: any;
		ordinaryId?: number;
	}

	interface DepartmentAndWarehouseRecord {
		departmentId: number; // 科室id
		departmentName: string; // 科室名称
		warehouseId: number; // 仓库id
		warehouseName; // 仓库名称
	}
}
