import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';

import Breadcrumb from '@/components/Breadcrumb';
import ProTable from '@/components/ResizableTable';
import { invoiceSync } from '@/constants';
import { createStatementByTime, getStatementDate, queryStatementList } from '@/services/settlement';
import { getDay } from '@/utils';
import { convertPriceWithDecimal } from '@/utils/format';
import { notification } from '@/utils/ui';
import { Button, Card, Form, Popconfirm } from 'antd';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { connect, history, useAccess, useModel } from 'umi';

const List: React.FC = () => {
	const access = useAccess();
	const { fields } = useModel('fieldsMapping');
	const [form] = Form.useForm();
	const tableRef = useRef<ProTableAction>();
	const [refresh, setRefresh] = useState<boolean>(false);
	const [valuesData, setValuesData] = useState<boolean | undefined>();
	const [isDisabled, setIsDisabled] = useState<boolean>(false);
	const [isRequest, setIsRequest] = useState<boolean>(false);
	const [statementLoading, setStatementLoading] = useState<boolean>(false);

	// 设置禁用日期
	const disabledDate = (current: any) => current > moment().startOf('day');

	const onInvoiceSyncChange = (value: boolean) => {
		if (value == true || value == false) {
			getDate(value);
			setValuesData(value);
		}
		form.resetFields();
		form.setFieldsValue({
			invoiceSync: value,
		});
	};

	const searchColumns: ProFormColumns = [
		{
			title: '是否货票同行',
			dataIndex: 'invoiceSync',
			valueType: 'select',
			formItemProps: {
				rules: [{ required: true, message: '选择是否货票同行' }],
			},
			fieldProps: {
				placeholder: '请选择',
				options: invoiceSync,
				onChange: onInvoiceSyncChange,
			},
		},
		{
			title: '初始日期',
			dataIndex: 'timeFrom',
			valueType: 'datePicker',
			fieldProps: {
				placeholder: '请选择初始日期',
				disabled: isDisabled,
				format: 'YYYY/MM/DD',
				disabledDate: disabledDate,
			},
		},
		{
			title: '截止日期',
			dataIndex: 'timeTo',
			valueType: 'datePicker',
			fieldProps: {
				placeholder: '请选择截止日期',
				format: 'YYYY/MM/DD',
				disabledDate: disabledDate,
			},
		},
	];

	const columns: ProColumns<SettlementController.ListRecord>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			width: 80,
			align: 'center',
			renderText: (text: number, record, index: number) => index + 1,
		},
		{
			title: '结算周期',
			dataIndex: 'timeFrom',
			key: 'state.timeFrom',
			width: 220,
			renderText: (text: number, record) => (
				<span>
					{moment(text).format('YYYY/MM/DD')}～{moment(record.timeTo).format('YYYY/MM/DD')}
				</span>
			),
		},
		{
			title: fields.distributor,
			dataIndex: 'authorizingDistributorName',
			width: 220,
			ellipsis: true,
		},
		{
			title: '结算金额(元)',
			dataIndex: 'totalPrice',
			width: 120,
			ellipsis: true,
			align: 'right',
			renderText: (text: number) => {
				const price = convertPriceWithDecimal(text || 0);
				return text < 0 ? (
					<span style={{ color: CONFIG_LESS['@c_starus_warning'] }}>{price}</span>
				) : (
					price
				);
			},
		},
		{
			title: '操作',
			dataIndex: 'option',
			width: 62,
			fixed: 'right',
			render: (_, record) => {
				return (
					<div className='operation'>
						{access['generate_settlement_fin'] && (
							<a
								onClick={() => {
									history.push({
										pathname: `/finance/fresh_generate_settlement/detail`,
										state: {
											authorizingDistributorId: record.authorizingDistributorId,
											timeFrom: record.timeFrom,
											timeTo: record.timeTo,
											authorizingDistributorName: record.authorizingDistributorName,
											totalPrice: record.totalPrice,
											invoiceSync: record.invoiceSync,
										},
									});
								}}>
								查看
							</a>
						)}
					</div>
				);
			},
		},
	];

	useEffect(() => {
		refresh && setTimeout(() => setRefresh(false));
	}, [refresh]);

	// 获取开始时间
	const getDate = async (invoiceSync?: boolean) => {
		const res = await getStatementDate({ invoiceSync });
		if (res && res.code === 0) {
			setRefresh(false);
			const timeFrom = res.data.timeFrom;
			setIsDisabled(!!timeFrom);
			if (timeFrom) {
				form.setFieldsValue({ timeFrom: moment(timeFrom).add(1, 'd') });
			}
		}
	};

	useEffect(() => {
		if (refresh) getDate(valuesData);
	}, [refresh]);

	useEffect(() => {
		if (history.location && history.location.state) {
			const timeTo = sessionStorage.generate_settlement_timeTo;
			const timeFrom = sessionStorage.generate_settlement_timeFrom;
			const invoiceSync = sessionStorage.generate_settlement_invoiceSync;
			const invoiceSyncVal =
				invoiceSync == 'true' ? true : invoiceSync == 'false' ? false : undefined;
			setValuesData(invoiceSyncVal);
			if (timeTo) {
				form.setFieldsValue({
					invoiceSync: invoiceSyncVal,
					timeTo: moment(Number(timeTo)),
					timeFrom: moment(Number(timeFrom)),
				});
				getDate(invoiceSync);
				sessionStorage.removeItem('generate_settlement_timeTo');
				sessionStorage.removeItem('generate_settlement_timeFrom');
				sessionStorage.removeItem('generate_settlement_invoiceSync');
				setTimeout(() => form.submit(), 100);
			}
		} else {
			sessionStorage.removeItem('generate_settlement_timeTo');
			sessionStorage.removeItem('generate_settlement_timeFrom');
			sessionStorage.removeItem('generate_settlement_invoiceSync');
		}
	}, []);

	// 批量生产结算单
	const generateStatement = async () => {
		if (!isRequest) {
			notification.error('当前检索条件与列表信息不符，请先点击查询按钮');
			return;
		}
		const searchData = tableRef.current?.getParams();
		if (searchData) {
			setStatementLoading(true);
			const params = {
				timeFrom: searchData.timeFrom,
				timeTo: searchData.timeTo,
				invoiceSync: searchData.invoiceSync,
			};
			const res = await createStatementByTime(params);
			if (res && res.code == 0) {
				setRefresh(true);
				notification.success('生成成功');
				form.submit();
			}
			setStatementLoading(false);
		}
	};

	// 查询
	const beforeSearch = (filters: Record<string, any>) => {
		const creatValues = {
			invoiceSync: filters.invoiceSync,
			timeFrom: filters.timeFrom && getDay(filters.timeFrom),
			timeTo: filters.timeTo && getDay(filters.timeTo, 'end'),
		};
		if (
			typeof creatValues.invoiceSync === 'boolean' &&
			creatValues.timeFrom &&
			creatValues.timeTo
		) {
			return { ...filters, ...creatValues };
		}
		return { ...filters };
	};

	// 校验
	const beforeFetch = (filters: Record<string, any>) => {
		setIsRequest(true);
		const timeFrom = filters.timeFrom && getDay(filters.timeFrom);
		const timeTo = filters.timeTo && getDay(filters.timeTo);
		if (!timeFrom) {
			notification.warning('请选择初始日期');
			return;
		}
		if (!timeTo) {
			notification.warning('请选择截止日期');
			return;
		}
		if (timeFrom > timeTo) {
			notification.warning('初始日期不能大于截止日期');
			return;
		}
		const date = new Date(getDay(filters.timeFrom));
		const data = date.setMonth(date.getMonth() + 3) - 1;
		if (timeTo > data) {
			notification.warning('时间区间不能大于3个月');
			return;
		}
		return true;
	};

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<Card>
				<ProTable<SettlementController.ListRecord>
					tableInfoCode='fresh_generate_settlement'
					api={queryStatementList}
					searchConfig={{
						columns: searchColumns,
						form,
					}}
					rowKey={(record, index?: number) => `${index}`}
					loadConfig={{ request: false, reset: false }}
					beforeSearch={beforeSearch}
					beforeFetch={beforeFetch}
					columns={columns}
					onReset={() => {
						setIsDisabled(false);
						setIsRequest(false);
					}}
					tableRef={tableRef}
					toolBarRender={() => [
						<Popconfirm
							title='确定生成结算单吗？'
							okButtonProps={{
								loading: statementLoading,
							}}
							disabled={statementLoading}
							onConfirm={generateStatement}>
							<Button
								type='primary'
								style={{ width: 100, padding: 0 }}>
								生成结算单
							</Button>
						</Popconfirm>,
					]}
				/>
			</Card>
		</div>
	);
};

export default connect(({ global }: Record<string, any>) => ({ global }))(List);
