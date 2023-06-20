// Statement Controller
declare namespace StatementController {
	interface TimeListRecord {
		timeFrom: number;
		timeTo: number;
	}

	interface TimeListParams {
		invoiceSync?: boolean;
	}
}
