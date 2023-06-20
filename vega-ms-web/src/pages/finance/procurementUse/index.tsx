import Breadcrumb from '@/components/Breadcrumb';
import ExportFile from '@/components/ExportFile';
import Print from '@/components/print';
import Target from '@/components/print/procurementUse';
import TableBox from '@/components/TableBox';
import api from '@/constants/api';
import { convertPriceWithDecimal } from '@/utils/format';
import { notification } from '@/utils/ui';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Button, Card, Form } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { connect, useModel } from 'umi';
import FormSearch from './formSearch';
import styles from './index.less';
import { queryRule } from './service';

const PrintTarget = Print(Target);
const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');

const InstockConnectionList: React.FC<{}> = ({ global }) => {
	const { fields } = useModel('fieldsMapping');
	const [searchData, setSearchData] = useState({});
	const [form] = Form.useForm();
	const [loading, setLoading] = useState<boolean>(false);
	const [list, setList] = useState([]);
	const [searchParams, setSearchParams] = useState({});
	const [isFirst, setIsFirst] = useState(true);
	const [isExportFile, setIsExportFile] = useState(false);
	//获取搜索
	const getSearchDate = () => {
		const values = form.getFieldsValue();
		let timearray = [];
		let params;
		if (!values.item) {
			notification.warning('请选择结算周期');
			return false;
		}
		timearray = values.item.split('|');
		params = {
			timeFrom: Number(timearray[0]) || undefined,
			timeTo: Number(timearray[1]) || undefined,
		};
		return params;
	};
	useEffect(() => {
		setIsExportFile(list.length > 0);
	}, [list]);
	const getPrice = (data: any) => {
		let startAmount = 0,
			purchaseAmount = 0,
			clinicalShipmentAmount = 0,
			manageShipmentAmount = 0,
			shipmentAmountSum = 0,
			endAmount = 0;
		let pendingPay = 0;
		let pendingPayYest = 0;
		data.forEach((item: any) => {
			startAmount += item.startAmount || 0;
			purchaseAmount += item.purchaseAmount || 0;
			clinicalShipmentAmount += item.clinicalShipmentAmount || 0;
			manageShipmentAmount += item.manageShipmentAmount || 0;
			shipmentAmountSum += item.shipmentAmountSum || 0;
			endAmount += item.endAmount || 0;
			pendingPay += item.pendingPay || 0;
			pendingPayYest += item.pendingPayYest || 0;
		});

		return [
			{
				statisticsType: '合计',
				startAmount: startAmount,
				purchaseAmount: purchaseAmount,
				pendingPay: pendingPay,
				pendingPayYest: pendingPayYest,
				clinicalShipmentAmount: clinicalShipmentAmount,
				manageShipmentAmount: manageShipmentAmount,
				shipmentAmountSum: shipmentAmountSum,
				endAmount: endAmount,
			},
		];
	};

	// 请求列表
	const getFormList = async (param: any) => {
		setIsFirst(false);
		let search = getSearchDate();
		if (!search) return;
		const params = {
			...search,
			...param,
			procurementUseType: 'one',
		};
		setLoading(true);
		const res = await queryRule(params);
		if (res && res.code === 0) {
			setSearchData({ ...param });
			setSearchData(search);
			let result = res.data;
			if (result.length > 0) {
				setList(result.concat(getPrice(result)));
			} else {
				setList(result);
			}
		} else {
			reset();
		}
		setLoading(false);
	};
	const dealPrice = (data: any) => {
		return (
			<span style={{ color: (data || 0) < 0 ? CONFIG_LESS['@c_starus_warning'] : '' }}>
				{convertPriceWithDecimal(data)}
			</span>
		);
	};
	const repColumns = [
		{
			title: '报表统计归类',
			dataIndex: 'statisticsType',
			key: 'statisticsType',
			width: 120,
		},
		{
			title: '起初金额(元)',
			dataIndex: 'startAmount',
			key: 'startAmount',
			width: 160,
			ellipsis: true,
			align: 'right',
			render: (text: any, record: any) => {
				return dealPrice(record.startAmount);
			},
		},
		{
			title: '进货金额(元)',
			dataIndex: 'purchaseAmount',
			key: 'purchaseAmount',
			width: 160,
			align: 'right',
			render: (text: any, record: any) => {
				return dealPrice(record.purchaseAmount);
			},
		},
		{
			title: '待付款(元)',
			dataIndex: 'pendingPay',
			key: 'pendingPay',
			width: 160,
			align: 'right',
			render: (text: any, record: any) => {
				return dealPrice(record.pendingPay);
			},
		},
		{
			title: '往期待付款(元)',
			dataIndex: 'pendingPayYest',
			key: 'pendingPayYest',
			width: 160,
			align: 'right',
			render: (text: any, record: any) => {
				return dealPrice(record.pendingPayYest);
			},
		},
		{
			title: '发货金额(元)',
			children: [
				{
					title: '临床',
					dataIndex: 'clinicalShipmentAmount',
					key: 'clinicalShipmentAmount',
					width: 120,
					align: 'right',
					render: (text: any, record: any) => {
						return dealPrice(record.clinicalShipmentAmount);
					},
				},
				{
					title: '管理',
					dataIndex: 'manageShipmentAmount',
					key: 'manageShipmentAmount',
					width: 120,
					align: 'right',
					render: (text: any, record: any) => {
						return dealPrice(record.manageShipmentAmount);
					},
				},
				{
					title: '小计',
					dataIndex: 'shipmentAmountSum',
					key: 'shipmentAmountSum',
					width: 120,
					align: 'right',
					render: (text: any, record: any) => {
						return dealPrice(record.shipmentAmountSum);
					},
				},
			],
		},
		{
			title: '结存金额(元)',
			dataIndex: 'endAmount',
			key: 'endAmount',
			width: 140,
			align: 'right',
			render: (text: any, record: any) => {
				return dealPrice(record.endAmount);
			},
		},
	];

	const printTip = () => {
		if (!searchParams.timeFrom || !searchParams.timeTo) {
			notification.warning('请选择结算周期');
			return false;
		}
	};
	//重置
	const reset = () => {
		setList([]);
		setSearchData({});
		setSearchParams({});
	};
	const tableColumns = repColumns;
	return (
		<div className={styles.instockConnection}>
			<Breadcrumb config={['', '']} />

			<Card bordered={false}>
				<FormSearch
					searchTabeList={getFormList}
					reset={reset}
					form={form}
					setSearchParams={setSearchParams}
				/>
				<TableBox
					isFirst={isFirst}
					headerTitle={
						<div className='flex flex-between'>
							<div className='tableTitle'>
								{searchData.timeFrom && searchData.timeTo && (
									<div className='tableAlert'>
										<span className='consumeCount'>
											<ExclamationCircleFilled
												style={{
													color: CONFIG_LESS['@c_starus_await'],
													marginRight: '8px',
													fontSize: '12px',
												}}
											/>
											统计范围：
											{searchData
												? moment(Number(searchData.timeFrom)).format('YYYY/MM/DD') +
												  '～' +
												  moment(Number(searchData.timeTo)).format('YYYY/MM/DD')
												: '-'}
											，{fields.goods}大类：材料
										</span>
									</div>
								)}
							</div>
						</div>
					}
					toolBarRender={() => [
						permissions.includes('procurementUsePrint') && (
							<>
								{searchParams.timeFrom && searchParams.timeTo ? (
									<PrintTarget
										url={api.procurementUse.list}
										params={{ ...searchParams, procurementUseType: 'one' }}
										parameters={{ ...searchParams, getPrice: getPrice }}
										printType={true}
									/>
								) : (
									<Button
										type='primary'
										className='btnOperator'
										onClick={() => printTip()}>
										打印
									</Button>
								)}
							</>
						),
						permissions.includes('procurementUseExport') && (
							<>
								{searchParams.timeFrom && searchParams.timeTo ? (
									<ExportFile
										data={{
											filters: { ...searchParams, procurementUseType: 'one' },
											link: api.procurementUse.export,
											getForm: getSearchDate,
										}}
									/>
								) : (
									<Button
										type='primary'
										className='btnOperator'
										disabled={!isExportFile}
										onClick={() => printTip()}>
										导出
									</Button>
								)}
							</>
						),
					]}
					tableInfoId='266'
					rowKey={(record, index) => index + 1}
					scroll={{
						x: '100%',
						y: global.scrollY - 30,
					}}
					dataSource={list}
					loading={loading}
					columns={tableColumns}
					bordered
				/>
			</Card>
		</div>
	);
};

export default connect(({ global }) => ({ global }))(InstockConnectionList);
