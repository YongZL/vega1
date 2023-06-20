// Print Controller
declare namespace PrintController {
	interface PrintParams {
		id: number;
		type: string;
	}

	interface BatchPrintParams {
		ids: string;
		type: string;
	}
}
