import { Card, Tabs, Button, Form } from 'antd';
import React, { useState, useEffect } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import TableBox from '@/components/TableBox';
import PaginationBox from '@/components/Pagination';
import { getUrlParam, getDay } from '@/utils';
import { notification } from '@/utils/ui';
import { convertPriceWithDecimal } from '@/utils/format';
import FormSearch from './formSearch';
import { connect } from 'umi';
import { cloneDeep } from 'lodash';
import { UploadOutlined } from '@ant-design/icons';
import {
	approveColumns,
	checkColumns,
	payColumns,
	finishedColumns,
	rejectColumns,
} from './columns';
import DetailModal from './modal/detail';
import PayModal from './modal/pay';
import EditModal from './modal/edit';
import PayDetailModal from './modal/payDetail';
import ExportFile from '@/components/ExportFile';

import {
	getApprovePendingList,
	getCheckPendingList,
	getPayFinishedList,
	getPayPendingList,
	getRejectList,
	orderRemove,
} from './service';
import api from '@/constants/api';

const TabPane = Tabs.TabPane;

const InvoiceList: React.FC<{}> = ({ global }) => {
	const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
	const [form] = Form.useForm();
	const [loading, setLoading] = useState<boolean>(false);
	const [list, setList] = useState([]);
	const [tabList, setTabList] = useState([]);
	const [total, setTotal] = useState(0);
	const [pageConfig, setPageConfig] = useState({ pageNum: 0, pageSize: 50 });
	const [activeTab, setActiveTab] = useState('');
	const [visible, setVisible] = useState<boolean>(false);
	const [payVisible, setPayVisible] = useState<boolean>(false);
	const [editVisible, setEditVisible] = useState<boolean>(false);
	const [payDetailVisible, setPayDetailVisible] = useState<boolean>(false);
	const [handleType, setHandleType] = useState('');
	const [detailInfo, setDetailInfo] = useState({});
	const [selectedKeys, setSelectedKeys] = useState([]);
	const [selectedList, setSelectedList] = useState([]);
	const [selectSupplier, setSelectSupplier] = useState('');

	const getSearchDate = () => {
		const formDate = form.getFieldsValue();
		let params = {
			...formDate,
			releaseDateFrom:
				formDate.releaseDate && formDate.releaseDate[0]
					? getDay(formDate.releaseDate[0])
					: undefined,
			releaseDateTo:
				formDate.releaseDate && formDate.releaseDate[1]
					? getDay(formDate.releaseDate[1], 'end')
					: undefined,
			uploadDateFrom:
				formDate.uploadDate && formDate.uploadDate[0] ? getDay(formDate.uploadDate[0]) : undefined,
			uploadDateTo:
				formDate.uploadDate && formDate.uploadDate[1]
					? getDay(formDate.uploadDate[1], 'end')
					: undefined,
			checkDateFrom:
				formDate.checkDate && formDate.checkDate[0] ? getDay(formDate.checkDate[0]) : undefined,
			checkDateTo:
				formDate.checkDate && formDate.checkDate[1]
					? getDay(formDate.checkDate[1], 'end')
					: undefined,
			approveDateFrom:
				formDate.approveDate && formDate.approveDate[0]
					? getDay(formDate.approveDate[0])
					: undefined,
			approveDateTo:
				formDate.approveDate && formDate.approveDate[1]
					? getDay(formDate.approveDate[1], 'end')
					: undefined,
			dueDateFrom:
				formDate.dueDate && formDate.dueDate[0] ? getDay(formDate.dueDate[0]) : undefined,
			dueDateTo:
				formDate.dueDate && formDate.dueDate[1] ? getDay(formDate.dueDate[1], 'end') : undefined,
			paymentDateFrom:
				formDate.paymentDate && formDate.paymentDate[0]
					? getDay(formDate.paymentDate[0])
					: undefined,
			paymentDateTo:
				formDate.paymentDate && formDate.paymentDate[1]
					? getDay(formDate.paymentDate[1], 'end')
					: undefined,
			rejectedDateFrom:
				formDate.rejectedDate && formDate.rejectedDate[0]
					? getDay(formDate.rejectedDate[0])
					: undefined,
			rejectedDateTo:
				formDate.rejectedDate && formDate.rejectedDate[1]
					? getDay(formDate.rejectedDate[1], 'end')
					: undefined,
			enterprises:
				formDate.enterprises && formDate.enterprises.length > 0
					? formDate.enterprises.join(',')
					: undefined,
		};
		delete params.releaseDate;
		delete params.uploadDate;
		delete params.checkDate;
		delete params.approveDate;
		delete params.dueDate;
		delete params.paymentDate;
		delete params.rejectedDate;
		return params;
	};

	// 请求列表
	const getFormList = async (param: any, tab: '') => {
		const newTab = tab || activeTab;
		if (!newTab || loading) {
			return;
		}
		const params = {
			...pageConfig,
			...getSearchDate(),
			...param,
		};
		setLoading(true);
		let query;
		switch (newTab) {
			case 'approve_pending':
				query = getApprovePendingList;
				break;
			case 'check_pending':
				query = getCheckPendingList;
				break;
			case 'pay_pending':
				query = getPayPendingList;
				break;
			case 'finished':
				query = getPayFinishedList;
				break;
			case 'rejected':
				query = getRejectList;
				break;
			default:
				query = getApprovePendingList;
				break;
		}
		const res = await query(params);
		if (res && res.code === 0) {
			setList(res.data.rows);
			setTotal(res.data.totalCount);
			setPageConfig({ pageNum: res.data.pageNum, pageSize: res.data.pageSize });
		}
		setLoading(false);
	};

	// 排序
	const handleChangeTable = (pagination: any, filter: any, sorter: any) => {
		const params = {
			sortList:
				sorter.order == null
					? undefined
					: [{ desc: sorter.order === 'descend', sortName: sorter.columnKey }],
		};
		getFormList({ ...params });
	};

	// 重置
	const resetSerach = () => {
		form.resetFields();
		getFormList({ pageNum: 0 });
	};

	// 作废
	const invoiceRemove = async (record: any) => {
		const res = await orderRemove({ invoiceId: record.id });
		if (res && res.code === 0) {
			notification.success('操作成功！');
			getFormList({}, 'rejected');
		}
	};
	// 上传转账凭证
	const uploadPayment = async (record: any) => {
		if (!record && selectedList.length > 0) {
			let price = 0;
			selectedList.forEach((item) => {
				return (price += item.totalAmount);
			});
			if (price < 0) {
				notification.error(
					`您勾选的金额为${convertPriceWithDecimal(price)}，您无法对负数金额上传转账凭证`,
				);
				return;
			}
		}

		setDetailInfo(record);
		setPayVisible(true);
	};

	const optionModal = (record: any, type: string) => {
		switch (type) {
			case 'detail':
			case 'approve_pending':
			case 'check_pending':
				setHandleType(type);
				setDetailInfo(record);
				setVisible(true);
				return;
			case 'remove':
				invoiceRemove(record);
				return;
			case 'pay':
				uploadPayment(record);
				return;
			case 'edit':
				setDetailInfo(record);
				setEditVisible(true);
				return;
			case 'payDetail':
				setDetailInfo(record);
				setPayDetailVisible(true);
				return;
			default:
				return;
		}
	};

	// 选择
	const selectRow = async (record: any, status: boolean) => {
		let selectedRowKeys = cloneDeep(selectedKeys);
		let submitList = cloneDeep(selectedList);

		if (status) {
			selectedRowKeys.push(record.id);
			submitList.push(record);
		} else {
			selectedRowKeys = selectedRowKeys.filter((item) => item !== record.id);
			submitList = submitList.filter((item) => item.id !== record.id);
		}
		submitList.length > 0 ? setSelectSupplier(submitList[0].enterprise) : setSelectSupplier('');
		setSelectedKeys(selectedRowKeys);
		setSelectedList(submitList);
	};

	// 单行点击选中
	const selectRowOfClick = (record) => {
		if (selectSupplier && record.enterprise !== selectSupplier) {
			return;
		}
		const index = selectedKeys.indexOf(record.id);
		if (index >= 0) {
			selectRow(record, false);
		} else {
			selectRow(record, true);
		}
	};

	// 全选过滤
	const selectRowAll = (status: boolean, selectedRows: any, changeRows: any) => {
		let selectedRowKeys = cloneDeep(selectedKeys);
		let submitList = cloneDeep(selectedList);
		if (status) {
			changeRows.forEach((itemSelect: any) => {
				if (
					!selectedRowKeys.some((item) => item === itemSelect.id) &&
					((submitList.length > 0 && itemSelect.enterprise == submitList[0].enterprise) ||
						itemSelect.enterprise == changeRows[0].enterprise)
				) {
					selectedRowKeys.push(itemSelect.id);
					submitList.push(itemSelect);
				}
			});
		} else {
			changeRows.forEach((itemSelect: any) => {
				selectedRowKeys = selectedRowKeys.filter((item) => item !== itemSelect.id);
				submitList = submitList.filter((item: any) => item.id !== itemSelect.id);
			});
		}
		submitList.length > 0 ? setSelectSupplier(submitList[0].enterprise) : setSelectSupplier('');
		setSelectedKeys(selectedRowKeys);
		setSelectedList(submitList);
	};

	const rowSelection = {
		selectedRowKeys: selectedKeys,
		onSelect: selectRow,
		onSelectAll: selectRowAll,
		getCheckboxProps: (record) => ({
			disabled: selectedKeys.length > 0 && selectSupplier && record.enterprise !== selectSupplier,
		}),
	};

	const clear = () => {
		form.resetFields();
		setSelectSupplier('');
		setSelectedList([]);
		setSelectedKeys([]);
	};

	useEffect(() => {
		let list = [];
		if (permissions.includes('invoice_approve_pending_list')) {
			list.push({
				key: 'approve_pending',
				name: '待审核',
				columns: approveColumns(permissions, optionModal),
				exportPermission: 'export_invoice_approve_pending',
				exportApi: api.invoice_list.exportApprovePending,
				tableInfoId: '66',
			});
		}
		if (permissions.includes('invoice_check_pending_list')) {
			list.push({
				key: 'check_pending',
				name: '待验收',
				columns: checkColumns(permissions, optionModal),
				exportPermission: 'export_invoice_check_pending',
				exportApi: api.invoice_list.exportCheckPending,
				tableInfoId: '67',
			});
		}
		if (permissions.includes('invoice_pay_pending_list')) {
			list.push({
				key: 'pay_pending',
				name: '待支付',
				columns: payColumns(permissions, optionModal),
				exportPermission: 'export_invoice_pay_pending',
				exportApi: api.invoice_list.exportPayPending,
				tableInfoId: '68',
			});
		}
		if (permissions.includes('invoice_pay_finished_list')) {
			list.push({
				key: 'finished',
				name: '支付完成',
				columns: finishedColumns(permissions, optionModal),
				exportPermission: 'export_invoice_pay_finished',
				exportApi: api.invoice_list.exportPayFinished,
				tableInfoId: '69',
			});
		}
		if (permissions.includes('invoice_rejected_list')) {
			list.push({
				key: 'rejected',
				name: '驳回',
				columns: rejectColumns(permissions, optionModal),
				exportPermission: 'export_invoice_rejected',
				exportApi: api.invoice_list.exportRejected,
				tableInfoId: '70',
			});
		}
		setTabList(list);

		if (window.location.search) {
			const search = window.location.search;
			const tab = getUrlParam(search, 'activeTab');
			const id = getUrlParam(search, 'invoiceId');
			setActiveTab(tab);
			if (id) {
				getFormList({}, tab);
				optionModal({ id }, 'detail');
			} else {
				getFormList({ dueDateNotice: true }, tab);
			}
			return;
		}
		if (list[0]) {
			setActiveTab(list[0].key);
			getFormList({}, list[0].key);
		}
	}, []);

	return (
		<div>
			<Breadcrumb config={['', '']} />
			<Card bordered={false}>
				<Tabs
					activeKey={activeTab}
					onChange={(key) => {
						if (loading) {
							return;
						}
						setActiveTab(key);
						clear();
						getFormList({}, key);
					}}>
					{tabList.map((itemTab) => {
						return (
							<TabPane
								key={itemTab.key}
								tab={itemTab.name}>
								<FormSearch
									searchTabeList={getFormList}
									resetSerach={resetSerach}
									form={form}
									activeTab={activeTab}
								/>
								<TableBox
									headerTitle='发票列表'
									toolBarRender={() => [
										itemTab.key == 'pay_pending' && permissions.includes('invoice_pay') && (
											<Button
												icon={<UploadOutlined />}
												type='primary'
												disabled={selectedKeys.length <= 0}
												onClick={() => uploadPayment()}>
												上传转账凭证
											</Button>
										),
										permissions.includes(itemTab.exportPermission) && (
											<ExportFile
												data={{
													filters: { ...getSearchDate() },
													link: itemTab.exportApi,
												}}
												className='ml2'
											/>
										),
									]}
									tableInfoId={itemTab.tableInfoId}
									rowSelection={itemTab.key === 'pay_pending' ? rowSelection : undefined}
									rowKey='id'
									scroll={{
										x: '100%',
										y: global.scrollY - 30,
									}}
									onChange={handleChangeTable}
									dataSource={list}
									loading={loading}
									columns={itemTab.columns}
									onRow={(record) => ({
										onClick: () => {
											itemTab.key === 'pay_pending' && selectRowOfClick(record);
										},
									})}
									tableAlertOptionRender={
										<a
											onClick={() => {
												setSelectedKeys([]);
												setSelectedList([]);
											}}>
											取消选择
										</a>
									}
								/>
							</TabPane>
						);
					})}
				</Tabs>
				{total > 0 && (
					<PaginationBox
						data={{ total, ...pageConfig }}
						pageChange={(pageNum: number, pageSize: number) => getFormList({ pageNum, pageSize })}
					/>
				)}
			</Card>
			{/* 查看/审核/验收 */}
			{visible && (
				<DetailModal
					orderInfo={detailInfo}
					isOpen={visible}
					setIsOpen={setVisible}
					handleType={handleType}
					getFormList={getFormList}
				/>
			)}

			{/* 修改 */}
			{editVisible && (
				<EditModal
					orderInfo={detailInfo}
					isOpen={editVisible}
					setIsOpen={setEditVisible}
					updateList={getFormList}
				/>
			)}

			{/* 上传支付凭证 */}
			{payVisible && (
				<PayModal
					orderInfo={detailInfo}
					isOpen={payVisible}
					setIsOpen={setPayVisible}
					getFormList={getFormList}
					clear={clear}
					selectList={selectedList}
				/>
			)}

			{/* 上传支付凭证-查看 */}
			{payDetailVisible && (
				<PayDetailModal
					orderInfo={detailInfo}
					isOpen={payDetailVisible}
					setIsOpen={setPayDetailVisible}
				/>
			)}
		</div>
	);
};

export default connect(({ global }) => ({ global }))(InvoiceList);
