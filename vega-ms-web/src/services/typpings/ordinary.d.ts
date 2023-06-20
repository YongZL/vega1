// 普耗包接口 ordinary-controller

declare namespace OrdinaryController {
	type GetOrdinary = Pager & {
		isEnabled?: boolean;
		keyword?: number;
		isCombined?: boolean;
		departmentId?: number; //科室id
		departmentAdd?: boolean; //是否为科室绑定请求
		enabled?: boolean;
		menabled?: boolean; //（true,启用；false未启用）
	};

	type OrdinaryParams = Pager & {
		chargeNum?: number; //医保编号
		departmentAdd?: boolean; //是否为科室绑定请求
		departmentId?: number; //科室id
		goodsName?: string; //物资名称
		ordinaryCode?: string; //普耗包编号
		ordinaryName?: string; //普耗包名称
	};

	interface OrdinaryList {
		consumeType?: string;
		createBy?: string;
		description?: string;
		detailGoodsMessage?: string;
		id?: number;
		menabled?: boolean;
		name?: string;
		ordinaryCode?: string;
		stocks?: number;
	}

	//还不知道后端的接口名称叫什么，暂时这么写
	interface Ordinary_List {
		address?: string;
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
		contactName?: string;
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
		isEnabled?: boolean;
		licenseManufacturerBusiness?: string;
		licenseManufacturerPermit?: string;
		manufactureRecordVoucher?: string;
		mergeName?: string;
		modifiedBy?: string;
		nationality?: string;
		postcode?: number;
		principalEmail?: string;
		principalName?: string;
		principalPhone?: number;
		registrant?: string;
		remark?: string;
		shortName?: string;
		timeCreated?: number;
		timeModified?: number;
		type?: string;
		website?: string;
	}
	type OrdinaryQuer = {
		consumeType?: string;
		createBy?: string;
		description?: string;
		detailGoodsMessage?: string;
		id: number;
		menabled?: boolean;
		name?: string;
		ordinaryCode?: string;
		stocks: string;
		quantity?: string | number;
		ordinaryId: number;
		requestNum?: number; //请领数量
		requestReason?: string; //备注
		conversionUnitName?: string;
	};

	interface OrdinaryLimitsParams {
		departmentId?: number; //科室id
		ordinaryId?: number; //谱号包id
	}
	interface AddOrdinaryParams {
		id: string;
		name: string;
		description: string;
		category: string;
		chargeNum: string;
		stockingUp: boolean;
		packageSurgicalGoodsList: any;
	}
	//获取医耗套包返回的数据
	type QuerOrdinary = Pager & {
		id?: string;
		menabled?: string; //状态
		name?: string; //医耗套包名称
		description?: string; //医耗套包说明
		ordinaryCode?: string; //医耗套包编号
		detailGoodsMessage?: string; //医耗套包说明
	};
	type GetDetailQuer = {
		limits?: Array<string, object>;
		ordinaryDepartment?: Array<string, object>;
		ordinaryDto?: object;
		ordinaryGoods?: Array;
		ordinaryResultDto?: string;
	};
	type OrdinaryDto = {
		consumeType?: string;
		createdBy?: string; //创建人
		description?: string;
		detailGoodsMessage?: string; //普耗包描述
		id?: number;
		isEnabled?: boolean;
		lowerLimit?: string;
		menabled?: boolean; //是否启用
		name?: string; //普耗包名字
		ordinaryCode?: string; //普耗包编号
		timeCreated?: string; //创建时间
		upperLimit?: string;
		warehouseId?: string; // 仓库
	};
	type OrdinaryGoods = {
		bind?: string;
		chargeCode?: string; //收费项编号
		chargeName?: string; //收费项名字
		chargeNum?: string; //医保编号
		description?: string;
		detailGoodsMessage?: string; //普耗包描述
		goodsId?: number; //物资id
		id?: number;
		manufacturerName?: string;
		materialCode?: string; //物资编号
		menabled?: boolean; //状态
		minGoodsUnit?: string;
		model?: string; //规格
		name?: string; //物资名称
		ordinaryCode?: string; //医耗套包编号
		packageBulkCode?: string; //定数包包编号
		packageBulkId?: string; //定数包id
		packageBulkName?: string; //定数包名称
		packageOrdinaryId?: string;
		packageOrdinaryName?: string;
		price?: number; //单价(元)
		purchaseGoodsUnit?: string;
		quantity?: number; //数量
		specification?: string; //包装规格
		unitNum?: number;
	};
}
