const codeMap = {
	//采购处理
	purchase_handle: [
		'commit_purchase_plan_pending', //采购申请——待提交
		'plan_approval_pending', //采购申请——待审核
		'plan_to_order', //采购申请——待转订单
		'handled_distributor_accept_order', //采购订单——待接收
		'handled_distributor_order', //采购订单——已接收
		'handled_distributor_make', //采购订单——配送中
	],

	//验收处理
	receiving_order: [
		'shipping_order_todo_check', //待验收
		'receiving_order_view', //验收中
	],
	//调拨处理
	allocation_handle: [
		'reallocate_pending', //待入库
	],
	// //待上架
	// report_form: [
	//   'put_on_shelf_pending', //待上架
	// ],
	//出库处理
	outbound_handle: [
		'pick_pending_generate_pick_order_pending', //出库处理——配货提示（基础物资+医耗套包）"
		'pick_order_pick_pending', //出库处理——配货——待配货
		'pick_order_list', //出库处理——配货——配货中
		'delivery_order_check_pending', //出库处理——推送——待复核
	],

	//加工组包
	process: [
		'processing_order_pick_pending', //出库业务——加工组包——待生成配货单
		'process_list', //出库业务——加工组包——待配货
		'processing_order_process_pending', //出库业务——加工组包——待加工
	],

	//入库申请
	warehousing_apply: [
		'warehousing_apply_approval', //入库申请——待审核（请领+调拨）
		'goods_request_review_pending', //入库申请——待复核（请领）
		'warehousing_apply_withdraw', //入库申请——撤回（请领）
		'warehousing_apply_purchasing', //入库申请——采购中（请领）
		'warehousing_apply_in_delivery', //入库申请——配送中（请领+调拨）
	],

	//入库处理
	Inbound_processing: [
		'warehousing_handle_pending', //入库处理——待验收（请领+调拨）
		'warehousing_handle_receiving', //入库处理——验收中（请领+调拨）
	],

	//医嘱管理
	department_medical_advice_list: [
		'department_medical_advice_scan', //消耗业务——医嘱管理——未消耗
		'department_medical_advice_return', //消耗业务——医嘱管理——未退货
		'department_medical_advice_view', //消耗业务——医嘱管理——部分消耗
	],

	//盘点处理
	stock_count_deal: [
		'stock_count_deal', //库存业务——盘点处理——待盘库
		'stock_count_query', //库存业务——盘点处理——盘库中
	],

	//退货处理
	return_processing: [
		'return_goods_pending_approve_department', //退货单待审核(科室库)
		'return_goods_pending_confirm_department', //退货单待确认(科室库
		'return_goods_pending_approve_central', //退货单待审核（中心库）
		'return_goods_pending_confirm_central', //退货单待确认（中心库）
	],
};

const getTodoCount = (data: TodoController.TodoItem[]) => {
	const todoDataMap: Record<string, number> = {
		purchase: 0, // 采购业务
		purchase_handle: 0, //  采购处理
		center_warehouse: 0, // 验收业务
		receiving_order: 0, // 验收处理
		allocation_handle: 0, // 调拨处理
		allocation_service: 0, // 调拨业务
		// summary: 0, // 报表业务
		// report_form: 0, // 报表汇总
		outbound_business: 0, // 出库业务
		outbound_handle: 0, // 出库处理
		process: 0, // 加工组包
		department_warehouse: 0, // 入库业务
		warehousing_apply: 0, // 入库申请
		Inbound_processing: 0, // 入库处理
		consumption_business: 0, // 消耗业务
		department_medical_advice_list: 0, // 医嘱管理
		stock_management: 0, // 库存业务
		stock_count_deal: 0, // 盘点处理
		return_business: 0, // 退货业务
		return_processing: 0, // 退货处理
		consumeEdit: 0, // 消耗处理
	};

	for (const { key, value } of data) {
		const count = value || 0;
		for (const j in codeMap) {
			if (codeMap[j].includes(key)) {
				todoDataMap[j] = (todoDataMap[j] || 0) + count;
				break;
			}
		}
	}

	// const {
	//   purchase_handle, // 采购处理
	//   receiving_order, // 验收处理
	//   // report_form, // 报表汇总
	//   outbound_handle, // 出库处理
	//   process, // 加工组包
	//   warehousing_apply, // 入库申请
	//   Inbound_processing, // 入库处理
	//   allocation_handle, // 调拨处理
	//   department_medical_advice_list, // 医嘱管理
	//   stock_count_deal, // 盘点处理
	//   return_processing, // 退货处理
	// } = todoDataMap;
	todoDataMap.purchase = todoDataMap.purchase_handle; // 采购业务
	todoDataMap.center_warehouse = todoDataMap.receiving_order; // 验收业务
	// todoDataMap.summary = todoDataMap.report_form; // 报表业务
	todoDataMap.allocation_service = todoDataMap.allocation_handle; // 调拨业务
	todoDataMap.outbound_business = todoDataMap.outbound_handle + todoDataMap.process; // 出库业务
	todoDataMap.department_warehouse = todoDataMap.warehousing_apply + todoDataMap.Inbound_processing; // 入库业务
	todoDataMap.consumption_business =
		todoDataMap.department_medical_advice_list + todoDataMap.consumeEdit; // 出库业务
	todoDataMap.stock_management = todoDataMap.stock_count_deal; // 库存业务
	todoDataMap.return_business = todoDataMap.return_processing; // 退货业务

	return todoDataMap;
};

export default getTodoCount;
