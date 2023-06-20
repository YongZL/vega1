const messageConfig = (msgType: string, read: boolean) => {
	let color;
	let path;
	let state;
	let searchPath;

	const COLOR = {
		DARK_BLUE: CONFIG_LESS['@c_starus_await'],
		LIGHT_BLUE: CONFIG_LESS['@c_BE6AFF'],
		PURPLE: CONFIG_LESS['@c_BE6AFF'],
		RED: CONFIG_LESS['@c_starus_underway'],
		YELLOW: CONFIG_LESS['@c_starus_early_warning'],
		DEFAULT: CONFIG_LESS['@c_body'],
		READ: CONFIG_LESS['@c_disabled'], // 已读
	};
	switch (msgType) {
		// 普通请领
		case 'goods_request_commit':
		case 'goods_request_refuse':
		case 'goods_request_pass': // 3 普通请领审核通过，通知复核人
		case 'goods_request_pass_notify': // 45   普通请领审核通过，通知请领人
		case 'goods_request_review_refuse':
		case 'goods_request_review_pass':
			color = COLOR.DARK_BLUE;
			path = '/department/warehousing_apply';
			break;

		// 采购申请
		case 'purchase_plan_create':
		case 'purchase_plan_pass':
		case 'purchase_plan_refuse':
		case 'purchase_plan_commit':
			color = COLOR.LIGHT_BLUE;
			path = '/purchase/handle';
			searchPath = '/purchase/query';
			break;

		// 采购订单
		case 'purchase_order_create':
		case 'purchase_order_pass':
		case 'purchase_order_refuse':
		case 'purchase_order_supplier_create':
		case 'purchase_order_supplier_pass':
		case 'purchase_order_supplier_refuse':
			color = COLOR.LIGHT_BLUE;
			path = '/purchase/handle';
			searchPath = '/purchase/query';
			state = { key: '2' };
			break;

		// 配送通知
		case 'shipping_order_message':
			color = COLOR.LIGHT_BLUE;
			path = '/purchase/handle';
			searchPath = '/purchase/query';
			state = { key: '3' };
			break;

		// 手术请领
		case 'surgical_package_request_create': // 只读
		case 'surgical_package_request_refuse':
		case 'surgical_package_request_pass':
		case 'surgical_package_request_review_refuse':
		case 'surgical_package_request_review_pass':
		case 'surgical_package_request_accept': // 可编辑
			color = COLOR.PURPLE;
			path = '/department/operation_request';
			break;

		// 配货通知
		case 'wms_pick_order_message': // wms_pick_order修正
			color = COLOR.DARK_BLUE;
			path = '/repository/pick_up_list';
			break;

		// 验收通知
		case 'acceptance_submit_order':
			color = COLOR.DARK_BLUE;
			path = '/department/Inbound_processing';
			searchPath = '/department/warehouse_queries';
			break;

		// 退货-中心库
		case 'wms_return_goods_by_central_warehouse': // 初步审核
		case 'wms_return_goods_review_refuse_central_warehouse': // 审核拒绝结束
		case 'wms_return_goods_review_pass_central_warehouse': // 审核通过
		case 'wms_return_goods_review_pass_central_warehouse_notify': // 审核通过
		case 'wms_return_goods_refuse_central_warehouse': // 拒绝结束
		case 'wms_return_goods_notify_central_warehouse': // 通过结束
			path = '/department/return_processing';
			searchPath = '/department/return_query';
			color = COLOR.RED;
			break;

		// 退货-科室库
		case 'wms_return_goods_by_department': // 初步审核
		case 'wms_return_goods_review_refuse_department_warehouse': // 审核拒绝结束
		case 'wms_return_goods_review_pass_department_warehouse': // 审核通过
		case 'wms_return_goods_refuse_department_warehouse': // 拒绝结束
		case 'wms_return_goods_notify_department_warehouse': // 通过结束
		case 'wms_return_goods_review_pass_department_warehouse_notify': // 审核通过
			path = '/department/return_processing';
			searchPath = '/department/return_query';
			state = { key: '2' };
			color = COLOR.RED;
			break;

		// 盘库
		case 'wms_stock_taking_created':
			color = COLOR.YELLOW;
			path = '/repository/stock_count_deal';
			searchPath = '/repository/stock_count_query';
			break;

		// 结算单
		case 'fin_statement_audit_failure': // 审核失败
		case 'fin_statement_review_failure': // 复核失败--发给服务商的消息
		case 'fin_statement_review_failure_custodian': // 复核失败--发给托管商的消息
			color = COLOR.YELLOW;
			path = '/finance/settlement';
			break;

		default:
			color = COLOR.DEFAULT;
			path = './';
			break;
	}

	if (read) {
		// 已读
		color = COLOR.READ;
	}

	return { color, path, state, searchPath };
};

export default messageConfig;
