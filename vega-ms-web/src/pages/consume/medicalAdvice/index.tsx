import type { ProColumns, ProTableAction } from '@/components//ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { cloneDeep } from 'lodash';
import Breadcrumb from '@/components/Breadcrumb';
import ProTable from '@/components/ResizableTable';
import { timeType3 } from '@/constants';
import {
	adviceType as adviceTypeOptions,
	adviceTypeTextMap,
	medicalAdviceStatusValueEnum,
	implementStatusValueEnum,
	highValueEnum,
	medicalAdviceHandleStatus,
	medicalAdviceQueryStatus,
	isHighValueStatus,
} from '@/constants/dictionary';
import { useDepartmentList } from '@/hooks/useDepartmentList';
import { getPageList, syncMedicalAdvice } from '@/services/medicalAdvice';
import { Divider, Form, Space, Button } from 'antd';
import moment from 'moment';
import { FC, useEffect, useRef, useState } from 'react';
import { history, useAccess } from 'umi';
import { notification } from '@/utils/ui';
import DetailModal from './components/DetailModal';
type ListRecord = MedicalAdviceController.ListRecord;
const MedicalAdvice: FC<{ typeStatus: string }> = ({ typeStatus }) => {
	const [form] = Form.useForm();
	const access = useAccess();
	const tableRef = useRef<ProTableAction>();
	const [orderInfo, setOrderInfo] = useState<Partial<MedicalAdviceController.ListRecord>>({});
	const [handleType, setHandleType] = useState<string>('');
	const [modalVisible, setModalVisible] = useState<boolean>(false);
	const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const departmentList = (useDepartmentList() || []).map((item: Record<string, any>) => {
		const { name, id, nameAcronym } = item;
		return { value: id, label: name, key: (nameAcronym || '') + '' + name };
	});

	const searchColumns: ProFormColumns = [
		{
			title: '状态',
			dataIndex: 'statuses',
			valueType: 'tagSelect',
			fieldProps: {
				options: typeStatus ? medicalAdviceQueryStatus : medicalAdviceHandleStatus,
			},
		},
		{
			title: '开单时间',
			dataIndex: 'timeCreated',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: timeType3,
			},
		},
		{
			title: '消耗时间',
			dataIndex: 'timeLocked',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: timeType3,
			},
		},
		{
			title: '执行状态',
			dataIndex: 'untreated',
			valueType: 'radioButton',
			initialValue: `${typeStatus ? '' : false}`,
			valueEnum: implementStatusValueEnum,
			fieldProps: {
				className: 'search-radio-button',
			},
		},
		{
			title: '物资属性',
			dataIndex: 'highValue',
			valueType: 'radioButton',
			initialValue: 'true',
			valueEnum: highValueEnum,
			fieldProps: {
				className: 'search-radio-button',
			},
		},
		{
			title: '住院号',
			dataIndex: 'hospitalizationNum',
		},
		{
			title: '病人姓名',
			dataIndex: 'patientName',
		},
		{
			title: '收费项名称',
			dataIndex: 'chargeName',
		},

		{
			title: '收费项编号',
			dataIndex: 'chargeCode',
		},
		{
			title: '开单科室',
			dataIndex: 'departmentIds',
			valueType: 'select',
			fieldProps: {
				showSearch: true,
				showArrow: true,
				options: departmentList,
				filterOption: (input: string, option: { label: string }) => {
					return option['data-item'].key.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '收费序号',
			dataIndex: 'adviceNo',
		},
		{
			title: '医嘱类型',
			dataIndex: 'adviceType',
			valueType: 'select',
			fieldProps: {
				options: adviceTypeOptions,
			},
		},
		{
			title: '病人编号',
			dataIndex: 'patientNo',
		},
		{
			title: '医生编号',
			dataIndex: 'doctorCode',
		},
		{
			title: '医生姓名',
			dataIndex: 'doctorName',
		},
		{
			title: '消耗人',
			dataIndex: 'lockedBy',
		},
		{
			title: '追溯流水号',
			dataIndex: 'implantSerialNumber',
		},
	];

	useEffect(() => {
		let state = history?.location.state as { status: string };
		if (state?.status) {
			form.setFieldsValue({ statuses: state?.status });
			setTimeout(() => form.submit(), 200);
		}
	}, [history?.location.state]);

	// 列表重置
	const getFormList = () => tableRef.current?.reload();

	// 详情弹窗
	const showDetail = (record: MedicalAdviceController.ListRecord, type: string) => {
		setModalVisible(true);
		setHandleType(type);
		setOrderInfo(record);
	};

	const columns: ProColumns<MedicalAdviceController.ListRecord>[] = [
		{
			width: 'XXXS',
			title: '序号',
			dataIndex: 'id',
			align: 'center',
			renderText: (text: string, record: object, index: number) => index + 1,
		},
		{
			width: 'XS',
			title: '状态',
			dataIndex: 'status',
			filters: false,
			valueEnum: medicalAdviceStatusValueEnum,
		},
		{
			width: 'S',
			title: '执行状态',
			dataIndex: 'untreated',
			filters: false,
			valueEnum: implementStatusValueEnum,
		},
		{
			width: 'XS',
			title: '医嘱类型',
			dataIndex: 'adviceType',
			renderText: (text: string) => <span>{adviceTypeTextMap[text === '0' ? 0 : 1]}</span>,
		},
		{
			width: 'S',
			title: '收费序号',
			dataIndex: 'adviceNo',
		},
		{
			width: 'M',
			title: '收费项编号',
			dataIndex: 'chargeCode',
			ellipsis: true,
			renderText: (text: string) => <span>{text ? text : '-'}</span>,
		},
		{
			width: 'M',
			title: '收费项名称',
			dataIndex: 'chargeName',
			ellipsis: true,
			renderText: (text: string) => <span>{text ? text : '-'}</span>,
		},
		{
			width: 'M',
			title: '物资属性',
			dataIndex: 'highValueArray',
			renderText: (text, record) => {
				return text && text.length ? isHighValueStatus[text.toString()] : '-';
			},
		},
		{
			width: 'S',
			title: '病人姓名',
			dataIndex: 'patientName',
			ellipsis: true,
		},
		{
			width: 'M',
			title: '病人编号',
			dataIndex: 'patientNo',
			ellipsis: true,
		},
		{
			width: 'S',
			title: '住院号',
			dataIndex: 'hospitalizationNum',
			ellipsis: true,
		},
		{
			width: 'L',
			title: '开单科室',
			dataIndex: 'spdDeptName',
			ellipsis: true,
		},
		{
			width: 'S',
			title: '医生编号',
			dataIndex: 'doctorCode',
			ellipsis: true,
		},
		{
			width: 'XXS',
			title: '医生姓名',
			dataIndex: 'doctorName',
		},
		{
			width: 'L',
			title: '开单时间',
			dataIndex: 'timeCreated',
			key: 'hma.time_created',
			sorter: true,
			renderText: (text: number) => (text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-'),
		},
		{
			width: 'L',
			title: '消耗时间',
			dataIndex: 'timeLocked',
			key: 'hma.time_locked',
			sorter: true,
			renderText: (text: number) => (text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-'),
		},
		{
			width: 'XS',
			title: '消耗人',
			dataIndex: 'lockedByName',
		},
		{
			width: 'M',
			title: '追溯流水号',
			dataIndex: 'implantSerialNumber',
			ellipsis: true,
			renderText: (text: string) => (text ? text : ''),
		},
		{
			width: 'L',
			title: '操作',
			dataIndex: 'option',
			fixed: 'right',
			renderText: (text: string, record) => {
				const { type, status } = record;
				return (
					<div className='operation'>
						<Space
							size={0}
							split={<Divider type='vertical' />}
							wrap={true}>
							{access['department_medical_advice_detail'] && (
								<span
									className='handleLink'
									onClick={() => showDetail(record, 'detail')}>
									查看
								</span>
							)}
							{type == '0' &&
								!typeStatus &&
								!['all_consumed', 'returned', 'consuming'].includes(status) &&
								access['department_medical_advice_scan'] && (
									<span
										className='handleLink'
										onClick={() => showDetail(record, 'consume')}>
										消耗
									</span>
								)}
							{type == '1' &&
								!typeStatus &&
								!['all_consumed', 'returned'].includes(status) &&
								access['department_medical_advice_return'] && (
									<span
										className='handleLink'
										onClick={() => showDetail(record, 'refunds')}>
										退费
									</span>
								)}
						</Space>
					</div>
				);
			},
		},
	];

	// 单行点击选中
	const selectRowOnClick = (record: ListRecord) => {
		if (selectedRowKeys.some((item) => item === record.hisId)) {
			selectRow(record, false);
		} else {
			selectRow(record, true);
		}
	};

	// 选择
	const selectRow = (record: ListRecord, status: boolean) => {
		let rowKeys = cloneDeep(selectedRowKeys);
		if (status) {
			rowKeys.push(record.hisId);
		} else {
			rowKeys = rowKeys.filter((item) => item !== record.hisId);
		}
		setSelectedRowKeys(rowKeys);
	};

	// 全选过滤
	const selectRowAll = (status: boolean, rows: ListRecord[], changeRows: ListRecord[]) => {
		let rowKeys = cloneDeep(selectedRowKeys);
		if (status) {
			for (let i = 0; i < changeRows.length; i++) {
				let record = changeRows[i];
				if (!rowKeys.includes(record.hisId)) {
					rowKeys.push(record.hisId);
				}
			}
		} else {
			for (let i = 0; i < changeRows.length; i++) {
				let record = changeRows[i];
				rowKeys = rowKeys.filter((item) => item !== record.hisId);
			}
		}
		setSelectedRowKeys(rowKeys);
	};

	const rowSelection: Record<string, any> = {
		selectedRowKeys: selectedRowKeys,
		onSelect: selectRow,
		onSelectAll: selectRowAll,
		getCheckboxProps: (record: ListRecord) => ({
			disabled: record.untreated === false,
		}),
	};

	//手动执行
	const postData = async () => {
		try {
			setLoading(true);
			let res = await syncMedicalAdvice(selectedRowKeys);
			if (res && res.code === 0) {
				notification.success(res.msg);
				setSelectedRowKeys([]);
				tableRef.current?.reload();
			}
			setLoading(false);
		} catch {
			setLoading(false);
		}
	};
	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<ProTable<MedicalAdviceController.ListRecord>
				tableInfoCode='department_medical_advice_view'
				api={getPageList}
				columns={columns}
				defaultCollapsed
				searchConfig={{
					form,
					columns: searchColumns,
					defaultColsNumber: 10,
				}}
				dateFormat={{
					timeCreated: {
						endKey: 'timeCreatedTo',
						startKey: 'timeCreatedFrom',
					},
					timeLocked: {
						endKey: 'timeLockedTo',
						startKey: 'timeLockedFrom',
					},
				}}
				loadConfig={{
					request: false,
				}}
				rowKey='hisId'
				rowSelection={!typeStatus && rowSelection}
				onRow={(record) => ({
					onClick: () => {
						if (record.untreated === true) {
							selectRowOnClick(record);
						}
					},
				})}
				beforeSearch={(value: Record<string, any>) => {
					const { statuses } = value;
					const params = {
						...value,
						statuses: statuses ? statuses.toString() : undefined,
					};
					return params;
				}}
				params={{
					pageType: typeStatus ? 'query' : 'handle',
				}}
				tableRef={tableRef}
				toolBarRender={() => [
					!typeStatus && access['department_medical_advice_implement'] && (
						<Button
							onClick={postData}
							type='primary'
							loading={loading}
							disabled={!selectedRowKeys.length}>
							手动执行
						</Button>
					),
				]}
			/>
			{/* 详情modal */}
			{modalVisible && (
				<DetailModal
					isOpen={modalVisible}
					setIsOpen={setModalVisible}
					handleType={handleType}
					orderInfo={orderInfo}
					getFormList={getFormList}
				/>
			)}
		</div>
	);
};

export default MedicalAdvice;
