import type { ConnectState, GlobalModelState } from '@/models/connect';
import type { FC } from 'react';

import Breadcrumb from '@/components/Breadcrumb';
import { notification } from '@/utils/ui';
import { Card, Col, Row, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { connect, history, useAccess } from 'umi';
import LicensesRemind from './components/LicensesRemind';
import SupplierInventory from './components/SupplierInventory';
import ToDoListItem from './components/ToDoListItem';
import WarehouseStock from './components/WarehouseStock';
import styles from './index.less';
import getTodoConfig from './todo.config';

const SUPPLIER_ARRAY = [
	'commit_purchase_plan_pending',
	'plan_approval_pending',
	'plan_to_order',
	'handled_distributor_accept_order',
	'handled_distributor_order',
	'handled_distributor_make',
	'shipping_order_todo_check',
	'receiving_order_view',
	'put_on_shelf_pending',
	'reallocate_pending',
	'pick_pending_generate_pick_order_pending',
	'pick_order_pick_pending',
	'pick_order_list',
	'delivery_order_check_pending',
	'processing_order_pick_pending',
	'processing_order_process_pending',
	'process_list',
	'warehousing_apply_approval',
	'goods_request_review_pending',
	'warehousing_apply_withdraw',
	'warehousing_apply_purchasing',
	'warehousing_apply_in_delivery',
	'warehousing_handle_pending',
	'warehousing_handle_receiving',
	'department_medical_advice_return',
	'department_medical_advice_scan',
	'department_medical_advice_view',
	'stock_count_deal',
	'stock_count_query',
	'return_goods_pending_approve_central',
	'return_goods_pending_confirm_central',
	'return_goods_pending_approve_department',
	'return_goods_pending_confirm_department',
];

const HomePage: FC<{
	todoList: ConnectState['todoList'];
	currentUser?: LoginWebController.User;
	global: GlobalModelState;
}> = ({ todoList, currentUser, global }) => {
	const access = useAccess();
	const [todoListData, setTodoListData] = useState<TodoController.TodoItem[]>([]);
	const [rightLoading, setRightLoading] = useState(false);
	const [screenWidth, setScreenWidth] = useState<number>(0);
	const { name: userName, type: userType } = currentUser || {};

	useEffect(() => {
		setScreenWidth(window.innerWidth || 0);
		window.onresize = () => {
			setScreenWidth(window.innerWidth || 0);
		};
	}, []);

	// 获取表格列表数据
	useEffect(() => {
		setRightLoading(true);
		const newData: TodoController.TodoItem[] = [];
		let todoData = SUPPLIER_ARRAY;
		if (global.config?.purchase_plan_auto_commit === 'false') {
			// 当自动配货配置项开启时，没有待提交状态
			todoData = todoData.filter((item) => item !== 'commit_purchase_plan_pending');
		}
		if (todoList && todoList.length > 0) {
			const keys = todoList.map((item) => item.key);
			for (let i = 0; i < todoData.length; i++) {
				const idx = keys.indexOf(todoData[i]);
				if (idx > -1) {
					newData.push(todoList[idx]);
				}
			}
			setTodoListData(newData);
			setRightLoading(false);
		}
	}, [todoList]);

	// 跳转到对应页面
	const handleClick = (item: TodoController.TodoItem) => {
		if (item.value > 0) {
			const { path, state } = getTodoConfig(item);
			// searchParams 影响跳转查询处理
			sessionStorage.setItem('searchParams', JSON.stringify({}));
			history.push({ pathname: path, state: state });
		} else {
			notification.warning('当前没有该类型待办事项');
		}
	};

	return (
		<div className={styles.wrapContainer}>
			<div className={styles.pageHeader}>
				<div className={styles.homeBreadcrumb}>
					<Breadcrumb
						config={[`您好，${userName}！欢迎您来到Insight医疗供应链平台`]}
						isDynamic={true}
					/>
				</div>
			</div>
			<div className={styles.pageScrollWrapper}>
				<Row>
					{(access.inventory_quantity_list || access.distributor_inventory_status_list) && (
						<Col
							lg={8}
							md={24}
							style={{ paddingRight: '2px' }}>
							<Spin
								spinning={false}
								tip='加载中...'>
								{/* 仓库库存 */}
								{access.inventory_quantity_list && (
									<Row style={{ marginBottom: '2px' }}>
										<WarehouseStock userType={userType} />
									</Row>
								)}
								{/* 配送商业/药商库存 */}
								{access.distributor_inventory_status_list && (
									<Row style={{ marginBottom: '2px' }}>
										<SupplierInventory screenWidth={screenWidth} />
									</Row>
								)}
								{/* 证照提醒 */}
								{access.gsp_notify && (
									<Row style={{ marginBottom: '2px' }}>
										<LicensesRemind />
									</Row>
								)}
							</Spin>
						</Col>
					)}
					{/* 待办事项 */}
					<Col
						lg={16}
						md={24}>
						<div style={{ display: !todoListData.length ? 'none' : '' }}>
							<Spin
								spinning={rightLoading}
								tip='加载中...'>
								<Card
									bordered={false}
									title='待办事项'
									className={`${styles.homeCard} ${styles.todoListCard}`}>
									<Row className={styles['schedule-box']}>
										{todoListData &&
											todoListData.length > 0 &&
											todoListData.map((item, index) => {
												return (
													<Col
														lg={8}
														md={12}
														xs={24}
														key={index}
														style={
															screenWidth > 1600
																? {
																		flex: '0 0 20%',
																		maxWidth: '20%',
																  }
																: screenWidth > 1400
																? {
																		flex: '0 0 25%',
																		maxWidth: '25%',
																  }
																: {}
														}>
														<ToDoListItem
															todoItem={item}
															onClick={() => handleClick(item)}
															handleClickNoPath={() => handleClick(item)}
															key={index}
														/>
													</Col>
												);
											})}
									</Row>
								</Card>
							</Spin>
						</div>
					</Col>
				</Row>
			</div>
		</div>
	);
};

export default connect(({ todoList, user, global }: ConnectState) => ({
	todoList,
	currentUser: user.currentUser,
	global,
}))(HomePage);
