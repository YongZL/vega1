// user-preference-controller
declare namespace UserPreferenceController {
	interface Config {
		id: number;
		preferenceName: string;
		preferenceCode: string;
		preferenceType: string;
		systemId: number;
		orgId: number; // 医院id
		json: string;
	}
}
