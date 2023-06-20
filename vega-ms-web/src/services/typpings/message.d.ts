// message-controller 消息
declare namespace MessageController {
	interface MsgContent {
		departmentId: number;
		custodianId: number;
		supplierId: number;
		authorizingDistributorId: number;
		distributorId: number;
		id: number;
		code: string;
		messageType: number;
		messageTypeStr: string;
		category: string;
		count: number;
		title: string;
		context: string;
		advanceTime: number;
		origin: string;
		handleTime: number;
	}

	interface ListRecord {
		id: number;
		msgId: number;
		userId: number;
		read: boolean;
		timeCreated: number;
		timeRead: number;
		handle: boolean;
		title: string;
		readOnly: boolean;
		status: string;
		msgContent: MsgContent;
	}

	type ListPager = Pager & {
		category?: string;
		keywords?: string;
		start?: number;
		end?: number;
	};

	interface MessageType {
		category: string;
		name: string;
	}

	interface TypeList {
		value: string;
		label: string;
	}

	interface BatchDisposeParams {
		ids: number[];
	}
}
