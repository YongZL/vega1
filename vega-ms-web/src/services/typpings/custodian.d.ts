// custodian-controller 配送商业
declare namespace CustodianController {
	interface AccountPeriodParams {
		accountPeriod: number;
		custodianId: number;
	}

	interface CustodiansListParams {
		isEnabled: boolean;
		isIncludeVirtual: boolean;
	}
}
