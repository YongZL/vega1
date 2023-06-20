// distributorGoods-controller
declare namespace DistributorGoodsController {
	interface ListRecord {
		goodsId: string;
		distributorId: string;
		distributorName: string;
		defaultDistributor: string;
		invoiceSync: boolean;
		materialCode: string;
		goodsName: string;
		specification: string;
		model: string;
		highValue: boolean;
		enabled: boolean;
		authorizingDistributorId: number;
		stageType: string;
		minGoodsUnitName: string;
		minGoodsUnitNum: number;
		largeBoxNum: number;
		chargeNum: string;
		price: number;
		manufacturerName: string;
		authorizationStartDate: number;
		authorizationEndDate: number;
	}

	type TableListPager = Pager & {
		chargeNum?: string;
		distributorId?: number;
		enabled?: boolean;
		goodsName?: string;
		hospitalId?: number;
		id?: number;
		invoiceSync?: string;
		manufacturerIds?: number[];
		materialCode?: string;
		registrationNum?: string;
	};
}
