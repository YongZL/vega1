import InputUnit from '@/components/InputUnit';
import TableBox from '@/components/TableBox';
import { dealPackNum } from '@/utils/dataUtil';
import { formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { Button, Col, Descriptions, Form, Input, Modal, Radio, Row, Statistic, Table } from 'antd';
import moment from 'moment';
import { ChangeEvent, FC, useEffect, useState } from 'react';
import { useModel } from 'umi';
import {
	getDetail,
	manualRequestApproval,
	manualRequestApprovalReview,
	queryDetail,
} from '../list/service';
import styles from './style.less';

const FormItem = Form.Item;
const approvaStatus = {
	withdraw: { text: '撤回', color: CONFIG_LESS['@c_starus_disabled'] },
	approval_pending: { text: '待审核', color: CONFIG_LESS['@c_starus_await'] },
	approval_failure: { text: '审核不通过', color: CONFIG_LESS['@c_starus_warning'] },
	approval_review_pending: { text: '待复核', color: CONFIG_LESS['@c_starus_await'] },
	approval_review_success: { text: '复核通过', color: CONFIG_LESS['@c_starus_done'] },
	approval_part_success: { text: '部分通过', color: CONFIG_LESS['@c_starus_underway'] },
	approval_review_failure: { text: '复核不通过', color: CONFIG_LESS['@c_starus_warning'] },
	purchasing: { text: '采购中', color: CONFIG_LESS['@c_starus_await'] },
	in_delivery: { text: '配送中', color: CONFIG_LESS['@c_starus_warning'] },
	partial_delivery: { text: '部分配送', color: CONFIG_LESS['@c_starus_warning'] },
	all_accept: { text: '全部验收', color: CONFIG_LESS['@c_starus_warning'] },
	partial_accept: { text: '部分通过', color: CONFIG_LESS['@c_starus_warning'] },
	accept_pending: { text: '待验收', color: CONFIG_LESS['@c_starus_await'] },
};
const quantityType = {
	audit: 'approvalQuantity',
	review: 'approvalReviewQuantity',
};
const reasonType = {
	audit: 'approvalReason',
	review: 'approvalReviewReason',
};
const formItemLayout = {
	labelCol: {
		xs: { span: 24 },
		sm: { span: 8 },
	},
	wrapperCol: {
		xs: { span: 24 },
		sm: { span: 16 },
	},
};

const CheckModal: FC<Record<string, any>> = ({
	apply_detail = {},
	visible,
	title,
	onCancel,
	searchTabeList,
	modalType,
}) => {
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const [loading, setLoading] = useState<boolean>(false);
	const [goodsData, setGoodsData] = useState<Record<string, any>[]>([]);
	const [bulksData, setBulksData] = useState<Record<string, any>[]>([]);
	const [ordinary, setOrdinary] = useState<Record<string, any>[]>([]);
	const [ordinaryRequestItem, setOrdinaryRequestItem] = useState<Record<string, any>>({});
	const [ordinaryGoods, setOrdinaryGoods] = useState<Record<string, any>[]>([]);
	const [ordinaryData, setOrdinaryData] = useState<Record<string, any>>({});
	const [goodsxi, setGoodsxi] = useState<Record<string, any>[]>([]);
	const [auditType, setAuditType] = useState<string>('');
	const [activeId, setActiveId] = useState<string | undefined>();
	const [detail, setDetail] = useState<Record<string, any>>({});
	const [issubmt, setIssubmt] = useState<boolean>(false);

	let isApprovalReview = apply_detail?.status == 'approval_review_pending' ? false : true;
	useEffect(() => {
		const getDetail = async (goodsRequestId: number) => {
			let details: Record<string, any> = await queryDetail({
				goodsRequestId,
			});
			if (details.code === 0) {
				let getNewData: Record<string, any>[] = [];
				if (Array.isArray(details.data)) {
					getNewData = (details.data || []).map((item) => {
						if (item.packageBulkId) {
							item.goodsType = 'package_bulk';
						} else {
							item.goodsType = 'goods';
						}
						return item;
					});
				} else {
					setOrdinaryRequestItem(details.data.ordinaryRequestItem);
					setOrdinaryData(details.data);
					setGoodsxi(details.data.ordinaryGoods[0].goods);
					setOrdinaryGoods(details.data.ordinaryGoods);
					setOrdinary(details.data.ordinaryGoods);
					setActiveId(details.data.ordinaryGoods[0].ordinaryId);
				}

				let goodsData, bulksData;
				goodsData = getNewData
					.filter((item) => {
						return item.goodsType === 'goods';
					})
					.map((item) =>
						modalType == 'view'
							? {
									...item,
									quantity: item.quantity / item.conversionRate,
									approvalQuantity: item.approvalQuantity / item.conversionRate,
									approvalReviewQuantity: item.approvalReviewQuantity / item.conversionRate,
									minTotal:
										(item.approvalReviewQuantity == 0 ? '0' : item.approvalReviewQuantity) ||
										(item.approvalQuantity == 0 ? '0' : item.approvalQuantity) ||
										item.quantity,
							  }
							: modalType == 'audit'
							? {
									...item,
									approvalQuantity: item.quantity / item.conversionRate,
									minTotal: item.quantity,
							  }
							: {
									...item,
									approvalReviewQuantity: item.approvalQuantity / item.conversionRate,
									minTotal: item.approvalQuantity,
							  },
					);
				bulksData = getNewData
					.filter((item) => {
						return item.goodsType === 'package_bulk';
					})
					.map((item) =>
						modalType == 'view'
							? { ...item }
							: modalType == 'audit'
							? { ...item, approvalQuantity: item.quantity }
							: { ...item, approvalReviewQuantity: item.approvalQuantity },
					);
				setGoodsData(goodsData);
				setBulksData(bulksData);
			}
			setLoading(false);
		};

		if (apply_detail.id && visible) {
			setLoading(true);
			getDetail(apply_detail.id);
			requestDetail(apply_detail.id);
		}
	}, [visible]);

	const requestDetail = async (id: number) => {
		const res = await getDetail({
			id,
		});
		if (res.code === 0) {
			setDetail(res.data);
		}
	};
	const ayditTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
		setAuditType(e.target.value);
	};

	useEffect(() => {
		if (!visible) {
			form.resetFields();
			setAuditType('Y');
		}
	}, [visible]);

	const handleOk = () => {
		if (issubmt && auditType !== 'N') {
			notification.warning(modalType == 'audit' ? '审核数量不可以为 0' : '复核数量不可以为 0');
			return;
		}
		form.submit();
	};
	const onFinish = (values: Record<string, any>) => {
		postToService(values);
	};
	const postToService = async (values: Record<string, any>) => {
		setLoading(true);
		let newStatus;
		if (modalType == 'audit') {
			newStatus = values.auditType === 'N' ? 'approval_failure' : 'approval_review_pending';
		}
		if (modalType == 'review') {
			newStatus = values.auditType === 'N' ? 'approval_review_failure' : 'approval_review_success';
		}
		const params: Record<string, any> = {
			id: detail.id,
			status: newStatus,
			reason: values.reason,
		};

		params.items = [...goodsData, ...bulksData, ...ordinary].map((item) => ({
			id: item.requestItemId || item.id,
			quantity:
				item[quantityType[modalType]] * (item.conversionRate ? item.conversionRate : 1) ||
				item[quantityType[modalType]] ||
				Number(item.approvalReviewQuantity) ||
				Number(item.approvalQuantity) ||
				item.requestNum,
			reason: item[reasonType[modalType]] || '',
		}));
		try {
			let result;
			if (modalType == 'audit') {
				result = await manualRequestApproval(params);
				if (result.code == 0) {
					// notification.success('请领审核成功，等待资产管理部复核');
				}
			} else if (modalType == 'review') {
				result = await manualRequestApprovalReview(params);
			}
			if (result.code == 0) {
				onCancel();
				searchTabeList({ pageNum: 0, pageSize: 50 });
			}
		} finally {
			setLoading(false);
		}
	};
	const onChangeAddQuantity = (values: number, id: number | string, type: string) => {
		if (values === 0) {
			setIssubmt(true);
			return;
		}
		if (type === 'goods') {
			let newGoods = goodsData.map((item) =>
				id == item.id
					? {
							...item,
							[quantityType[modalType]]: values || 0,
							minTotal: values ? values * item.conversionRate : '',
					  }
					: { ...item },
			);
			setGoodsData(newGoods);
		}
		if (type === 'bulks') {
			let newGoods = bulksData.map((item) =>
				id == item.id ? { ...item, [quantityType[modalType]]: values || 0 } : { ...item },
			);
			setBulksData(newGoods);
		}
		if (type === 'ordinary') {
			let newGoods = ordinaryGoods.map((item) =>
				id == item.ordinaryId ? { ...item, [quantityType[modalType]]: values || 0 } : { ...item },
			);
			setOrdinaryGoods(newGoods);
			setOrdinary(newGoods);
		}
	};
	const inputChange = ({ target: { value } }, id, type) => {
		if (type === 'goods') {
			let newGoods = goodsData.map((item) =>
				id == item.id ? { ...item, [reasonType[modalType]]: value || '' } : { ...item },
			);
			setGoodsData(newGoods);
		}
		if (type === 'bulks') {
			let newGoods = bulksData.map((item) =>
				id == item.id ? { ...item, [reasonType[modalType]]: value || '' } : { ...item },
			);
			setBulksData(newGoods);
		}
		if (type === 'ordinary') {
			let newGoods = ordinaryGoods.map((item) =>
				id == item.ordinaryId ? { ...item, [reasonType[modalType]]: value || '' } : { ...item },
			);
			setOrdinaryGoods(newGoods);
			setOrdinary(newGoods);
		}
	};
	const selectRowOfClick = (id, event) => {
		setActiveId(id);

		ordinary.map((item) => {
			if (item.ordinaryId == id) {
				setGoodsxi(item.goods);
			}
		});
	};

	const goodsColumnsPend = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			width: 80,
			render: (text, recoed, index) => index + 1,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			width: 140,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '通用名称',
			dataIndex: 'commonName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			width: 150,
			ellipsis: true,
			render: (text: any, record: Record<string, any>) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '请领单位',
			dataIndex: 'conversionRate',
			width: 100,
			render: (text, record) => {
				return `${text}${record.minGoodsUnit}/${record.conversionUnitName}`;
			},
		},
		{
			title: '请领数量',
			dataIndex:
				modalType == 'view'
					? 'quantity'
					: modalType == 'audit'
					? 'approvalQuantity'
					: 'approvalReviewQuantity',
			width: 120,
			render: (text, record) => {
				let key = ['approval_review_success', 'approval_part_success'].includes(detail.status)
					? 'approvalReviewQuantity'
					: detail.status == 'approval_review_pending' || detail.status == 'approval_review_failure'
					? 'approvalQuantity'
					: 'quantity';
				return (
					<>
						{modalType === 'view' && (
							<span>{`${record[key] || 0}${record.conversionUnitName}`}</span>
						)}
						{modalType !== 'view' && (
							<InputUnit
								onChange={(value: number) => {
									onChangeAddQuantity(value, record.id, 'goods');
								}}
								unit={record.conversionUnitName}
								value={Number(text)}
								min={0}
								max={999999}
								style={{ width: '100px' }}
							/>
						)}
					</>
				);
			},
		},
		{
			title: '小计',
			dataIndex: 'minTotal',
			width: 100,
			render: (text, record) => {
				return text ? `${text}${record.minGoodsUnit}` : '-';
			},
		},
		{
			title: '全院剩余额度',
			dataIndex: 'limitPerMonth',
			key: 'limitPerMonth',
			width: 120,
			hideInTable: isApprovalReview,
			render: (text, record) => {
				return record.limitType && text ? (
					<span style={{ color: CONFIG_LESS['@c_starus_warning'] }}>
						{parseInt(text - record.inboundPerMonth) + record.minGoodsUnit}
					</span>
				) : (
					'-'
				);
			},
		},
		{
			title: '库存量',
			dataIndex: 'stocks',
			key: 'stocks',
			width: 100,
			hideInTable: isApprovalReview,
		},
		{
			title: '备注',
			dataIndex: 'operationRecords',
			width: 100,
			render: (text, record) => {
				return <span>{record.operationRecords}</span>;
			},
		},
		{
			title: '批注',
			dataIndex: modalType == 'audit' ? 'approvalReason' : 'approvalReviewReason',
			width: 180,
			hideInTable: modalType == 'view' ? true : false,
			renderText: (text, record) => {
				return (
					<>
						{modalType != 'view' && (
							<>
								<Input
									onChange={(e) => inputChange(e, record.id, 'goods')}
									value={text || ''}
									style={{ width: '150px' }}
									maxLength={100}
								/>
							</>
						)}
					</>
				);
			},
		},
	];

	const columnsBulks = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			width: 80,
			render: (text, recoed, index) => index + 1,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			width: 150,
		},
		{
			title: '定数包名称',
			dataIndex: 'packageBulkName',
			width: 150,
			ellipsis: true,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			width: 150,
			ellipsis: true,
			render: (text: any, record: Record<string, any>) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '包装数',
			dataIndex: 'quantityUnit',
			key: 'quantityUnit',
			width: 100,
			render: (text, record) => {
				return (
					<span>
						{record.packageBulkGoodsQuantity +
							(record.minGoodsUnit ? record.minGoodsUnit : record.unit) +
							'/' +
							record.packageBulkUnit}
					</span>
				);
			},
		},
		{
			title: '请领数量',
			dataIndex:
				modalType == 'view'
					? 'quantity'
					: modalType == 'audit'
					? 'approvalQuantity'
					: 'approvalReviewQuantity',
			width: 130,
			render: (text, record) => {
				let key = ['approval_review_success', 'approval_part_success'].includes(detail.status)
					? 'approvalReviewQuantity'
					: detail.status == 'approval_review_pending' || detail.status == 'approval_review_failure'
					? 'approvalQuantity'
					: 'quantity';
				return (
					<>
						{modalType == 'view' && (
							<span>{`${record[key] / record.conversionRate}${record.packageBulkUnit}`}</span>
						)}
						{modalType != 'view' && (
							<>
								<InputUnit
									onChange={(value: number) => {
										onChangeAddQuantity(value, record.id, 'bulks');
									}}
									unit={record.packageBulkUnit}
									value={Number(text)}
									min={0}
									max={999999}
									style={{ width: '100px' }}
								/>
							</>
						)}
					</>
				);
			},
		},
		{
			title: '备注',
			dataIndex: 'operationRecords',
			width: 100,
			render: (text, record) => {
				return <span>{record.operationRecords}</span>;
			},
		},
		{
			title: '批注',
			dataIndex: modalType == 'audit' ? 'approvalReason' : 'approvalReviewReason',
			width: 180,
			hideInTable: modalType == 'view' ? true : false,
			renderText: (text, record) => {
				return (
					<>
						{modalType != 'view' && (
							<>
								<Input
									onChange={(e) => inputChange(e, record.id, 'bulks')}
									value={text || ''}
									style={{ width: '150px' }}
									maxLength={100}
								/>
							</>
						)}
					</>
				);
			},
		},
	];
	const columnsSurgicals = [
		{
			title: '医耗套包编号',
			dataIndex: 'ordinaryCode',
			key: 'ordinaryCode',
			width: 140,
		},
		{
			title: '医耗套包名称',
			dataIndex: 'name',
			key: 'name',
			width: 140,
		},
		// {
		//   title: '请领数量',
		//   dataIndex: 'requestNum',
		//   key: 'requestNum',
		//   width: 140,
		// },

		{
			title: '请领数量',
			dataIndex:
				modalType == 'view'
					? 'quantity'
					: modalType == 'audit'
					? 'approvalQuantity'
					: 'approvalReviewQuantity',
			width: 130,
			render: (text, record) => {
				let key = ['approval_review_success', 'approval_part_success'].includes(detail.status)
					? 'approvalReviewQuantity'
					: detail.status == 'approval_review_pending' || detail.status == 'approval_review_failure'
					? 'approvalQuantity'
					: 'quantity';
				return (
					<>
						{modalType == 'view' && (
							<span>
								{record.approvalReviewQuantity
									? Number(record.approvalReviewQuantity)
									: record.approvalQuantity
									? Number(record.approvalQuantity)
									: Number(record.requestNum)}
							</span>
						)}
						{modalType != 'view' && (
							<>
								<InputUnit
									onChange={(value: number) => {
										onChangeAddQuantity(value, record.ordinaryId, 'ordinary');
									}}
									value={
										record.approvalReviewQuantity
											? Number(record.approvalReviewQuantity)
											: record.approvalQuantity
											? Number(record.approvalQuantity)
											: Number(record.requestNum)
									}
									min={0}
									max={999999}
									style={{ width: '100px' }}
								/>
							</>
						)}
					</>
				);
			},
		},
	];
	const columnsSurgicals2 = [
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 140,
		},
		{
			title: fields.goodsName,
			dataIndex: 'name',
			key: 'name',
			width: 140,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			width: 150,
			ellipsis: true,
			render: (text: any, record: Record<string, any>) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '大/中包装',
			dataIndex: 'minGoodsNum',
			width: 100,
			renderText: (text, record) => dealPackNum(record.largeBoxNum, record.minGoodsNum),
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 140,
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			width: 150,
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			width: 200,
			ellipsis: true,
		},
	];

	return (
		<div>
			<Form
				{...formItemLayout}
				form={form}
				initialValues={{
					auditType: 'Y',
				}}
				onFinish={onFinish}>
				<Modal
					visible={visible}
					width={'80%'}
					title={title}
					onOk={handleOk}
					maskClosable={false}
					onCancel={onCancel}
					footer={
						modalType == 'view'
							? []
							: [
									<Button
										key='back'
										onClick={onCancel}>
										取消
									</Button>,
									<Button
										key='submit'
										type='primary'
										loading={loading}
										onClick={handleOk}>
										提交
									</Button>,
							  ]
					}>
					<div className={styles.detailContent}>
						<div className={styles.detailWrap}>
							<div className={styles.left}>
								<Descriptions
									className={styles.headerList}
									size='small'>
									<Descriptions.Item label='请领单号'>
										{detail.code ? detail.code : '-'}
									</Descriptions.Item>
									<Descriptions.Item label='科室'>
										{detail.departmentName ? detail.departmentName : '-'}
									</Descriptions.Item>
									<Descriptions.Item label='仓库'>
										{detail.warehouseName ? detail.warehouseName : '-'}
									</Descriptions.Item>
									<Descriptions.Item label='请领人员'>
										{detail.createdByName ? detail.createdByName : '-'}
									</Descriptions.Item>
									{Object.keys(ordinaryRequestItem).length > 0 && (
										<>
											<Descriptions.Item label='请领时间'>
												{ordinaryRequestItem.requestTime
													? moment(new Date(Number(ordinaryRequestItem.requestTime))).format(
															'YYYY/MM/DD HH:mm:ss',
													  )
													: '-'}
											</Descriptions.Item>
											<Descriptions.Item label='请领类型'>医耗套包</Descriptions.Item>
										</>
									)}

									<Descriptions.Item label='审核人员'>
										{detail.approvalByName ? detail.approvalByName : '-'}
									</Descriptions.Item>
									<Descriptions.Item label='审核时间'>
										{detail.approvalTime
											? moment(new Date(detail.approvalTime)).format('YYYY/MM/DD HH:mm:ss')
											: '-'}
									</Descriptions.Item>
									<Descriptions.Item label='复核人员'>
										{detail.approvalReviewByName ? detail.approvalReviewByName : '-'}
									</Descriptions.Item>
									<Descriptions.Item label='复核时间'>
										{detail.approvalReviewTime
											? moment(new Date(detail.approvalReviewTime)).format('YYYY/MM/DD HH:mm:ss')
											: '-'}
									</Descriptions.Item>
									{/* {Object.keys(ordinaryRequestItem).length > 0 && (
                    <>
                      <Descriptions.Item label="病人姓名">
                        {ordinaryRequestItem.patientName ? ordinaryRequestItem.patientName : '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="病人性别">
                        {ordinaryRequestItem.patientSex == 'M' ? '男' : '女'}
                      </Descriptions.Item>
                      <Descriptions.Item label="住院号">
                        {ordinaryRequestItem.inpatientId ? ordinaryRequestItem.inpatientId : '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="备注">
                        {ordinaryRequestItem.remark ? ordinaryRequestItem.remark : '-'}
                      </Descriptions.Item>
                    </>
                  )} */}

									{/* 不通过才显示 */}
									{['approval_review_failure', 'approval_failure'].includes(detail.status) && (
										<Descriptions.Item label='不通过原因'>
											{detail.reason ? detail.reason : '-'}
										</Descriptions.Item>
									)}
								</Descriptions>
							</div>
							<div className={styles.right}>
								<div className={styles.moreInfo}>
									<Statistic
										title='当前状态'
										value={detail.status ? approvaStatus[detail.status].text : '-'}
									/>
								</div>
							</div>
						</div>
						<div>
							{goodsData.length > 0 && (
								<>
									<span className='tableTitle1'>{fields.baseGoods}</span>
									<TableBox
										size='middle'
										pagination={false}
										columns={goodsColumnsPend}
										dataSource={goodsData}
										options={{ density: false, fullScreen: false, setting: false }}
										scroll={{ x: '100%', y: 300 }}
										tableInfoId='156'
									/>
								</>
							)}
							{bulksData.length > 0 && (
								<>
									<span className='tableTitle1'>定数包</span>
									<TableBox
										size='middle'
										pagination={false}
										columns={columnsBulks}
										dataSource={bulksData}
										options={{ density: false, fullScreen: false, setting: false }}
										scroll={{ x: '100%', y: 300 }}
										tableInfoId='157'
									/>
								</>
							)}
							{Object.keys(ordinaryRequestItem).length > 0 && (
								<Row>
									<Col
										sm={24}
										md={10}
										style={{ paddingRight: '3px' }}>
										<span className='tableTitle1'>医耗套包</span>
										<Table
											rowClassName={(record: any) => {
												return record.ordinaryId == activeId ? `${styles.rowActived}` : '';
											}}
											columns={columnsSurgicals}
											rowKey='ordinaryId'
											dataSource={ordinaryData.ordinaryGoods}
											pagination={false}
											size='small'
											bordered={false}
											onRow={(record) => ({
												onClick: (event) => {
													selectRowOfClick(record.ordinaryId, event);
												},
											})}
											scroll={{ x: '100%', y: 300 }}
										/>
									</Col>
									<Col
										sm={24}
										md={14}
										style={{ paddingLeft: '3px' }}>
										<span className='tableTitle1'>医耗套包{fields.goods}明细</span>
										<TableBox
											tableInfoId='244'
											columns={columnsSurgicals2}
											rowKey='id'
											options={{ density: false, fullScreen: false, setting: false }}
											dataSource={goodsxi}
											size='small'
											pagination={false}
											scroll={{ x: '100%', y: 300 }}
										/>
									</Col>
								</Row>
							)}
						</div>
						<div style={{ marginTop: '20px' }}>
							{(modalType === 'audit' || modalType === 'review') && (
								<span>
									<h3 className='mt2 mb1'>{modalType == 'audit' ? '审核结果' : '复核结果'}</h3>
									<FormItem
										rules={[
											{
												required: true,
												message: '请选择审核结果',
											},
										]}
										style={{ marginBottom: '0px' }}
										name='auditType'>
										<Radio.Group
											onChange={(value) => {
												ayditTypeChange(value);
											}}>
											<Radio
												value='Y'
												style={{ display: 'block', marginBottom: '10px' }}>
												通过(当前请领审核通过，进入复核阶段)
											</Radio>
											<Radio
												value='N'
												style={{ display: 'block', marginBottom: '10px' }}>
												不通过(审核不通过，将终止该流程)
											</Radio>
										</Radio.Group>
									</FormItem>
									{auditType === 'N' && (
										<FormItem
											style={{ marginLeft: '22px' }}
											rules={[
												{
													required: true,
													message: '请输入不通过的原因',
												},
											]}
											name='reason'>
											<Input.TextArea
												style={{ maxWidth: '500px' }}
												rows={2}
												placeholder='请输入不通过的原因'
												maxLength={50}
											/>
										</FormItem>
									)}
								</span>
							)}
						</div>
					</div>
				</Modal>
			</Form>
		</div>
	);
};
export default CheckModal;
