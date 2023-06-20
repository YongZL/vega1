export type PickingListType = {
	openModal: () => void;
	selectedItemList: {
		'1': PickPendingController.QueryRuleRecord[];
		'3': PickPendingController.QueryRuleRecord[];
	};
	setSelectedItemList: React.Dispatch<
		React.SetStateAction<{
			'1': PickPendingController.QueryRuleRecord[];
			'3': PickPendingController.QueryRuleRecord[];
		}>
	>;
	selectedIDList: {
		'1': number[];
		'3': number[];
	};
	currentIndex: '1' | '3';
	setCurrentIndex: React.Dispatch<React.SetStateAction<'1' | '3'>>;
	setIsBatchPickOpen: React.Dispatch<React.SetStateAction<boolean>>;
	type: 'goods' | 'package_ordinary';
	setType: React.Dispatch<React.SetStateAction<'goods' | 'package_ordinary'>>;
	isBatchPickUpModal: boolean;
	comRef: React.MutableRefObject<
		| {
				getFormList: () => void;
		  }
		| undefined
	>;
	style:
		| {}
		| {
				display: string;
		  };
	totalNumber: number;
	handleSelectItem: (record: PickPendingController.QueryRuleRecord) => void;
	handleSelectAll: (
		selected: boolean,
		_selectedRows: PickPendingController.QueryRuleRecord[],
		changeRows: PickPendingController.QueryRuleRecord[],
	) => void;
	handleRowEvent: (record: PickPendingController.QueryRuleRecord) => {
		onClick: (e: { stopPropagation: () => void }) => void;
	};
	tagsData: {
		value: string | number;
		label: string;
	}[];
	activeKey?: string;
	loading?: boolean;
};
