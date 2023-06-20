import PaginationBox from '@/components/Pagination';
import TableBox from '@/components/TableBox';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { Button, Descriptions, Form, Input, Modal, Radio, Statistic } from 'antd';
import moment from 'moment';
import { connect, useModel } from 'umi';

import { settlementSupllierReviewTextMap, statementStatusTextMap } from '@/constants/dictionary';

const FormItem = Form.Item;

const DetailModal = ({ loading, settlement, auditLoading, submitLoading, dispatch, ...props }) => {
	const {
		modalVisible,
		setModalVisible,
		handleType,
		singleSettlementInfo,
		fetchList,
		activeTab,
		resetSelected,
	} = props;
	const { detailList, detailTotal, detailPageSize, detailPageNum } = settlement;
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');

	// 提交
	const modalCommit = () => {
		dispatch({
			type: 'settlement/orderCommit',
			payload: {
				statementId: singleSettlementInfo.id,
			},
			callback: (res) => {
				if (res && res.code === 0) {
					resetSelected();
					fetchList();
					setModalVisible(false);
					form.resetFields();
				}
			},
		});
	};

	//审核
	const modalAudit = () => {
		form.validateFields().then((values) => {
			let params = {
				reason: values['info.reason'],
				status: values['info.auditType'],
			};
			let url;
			if (handleType === 'audit') {
				url = 'settlement/orderAudit';
				params.statementList = [singleSettlementInfo.id];
			} else {
				url = 'settlement/orderReview';
				params.statementId = singleSettlementInfo.id;
			}
			dispatch({
				type: url,
				payload: params,
				callback: (res) => {
					if (res && res.code === 0) {
						resetSelected();
						fetchList();
						setModalVisible(false);
						form.resetFields();
					}
				},
			});
		});
	};

	const fetchDetailList = (params?: any) => {
		dispatch({
			type: 'settlement/querySettlementDetails',
			payload: { statementId: singleSettlementInfo.id, ...params },
		});
	};

	const columnsModal = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			align: 'center',
			render: (text, record, index) => {
				return <span>{index + 1}</span>;
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 120,
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 140,
			ellipsis: true,
		},
		{
			title: fields.goodsName,
			dataIndex: 'name',
			key: 'name',
			width: 150,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			render: (text: any, record: any) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 150,
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 210,
		},
		{
			title: '单价(元)',
			dataIndex: 'price',
			key: 'price',
			width: 110,
			align: 'right',
			render: (text, record) => {
				return <span>{convertPriceWithDecimal(record.price)}</span>;
			},
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 110,
		},
		{
			title: '单位',
			dataIndex: 'unitName',
			key: 'unitName',
			width: 110,
		},
	];

	const modal = {
		title: '结算单详情',
		visible: modalVisible,
		maskClosable: false,
		onCancel: () => {
			setModalVisible(false);
			form.resetFields();
		},
		width: '80%',
		footer:
			handleType === 'commit'
				? [
						<Button
							type='primary'
							key='submit'
							onClick={() => modalCommit()}
							loading={submitLoading}>
							确认并发送
						</Button>,
				  ]
				: handleType === 'audit' || handleType === 'review'
				? [
						<Button
							type='primary'
							key='audit'
							onClick={() => modalAudit()}
							loading={auditLoading}>
							提交
						</Button>,
				  ]
				: false,
		destroyOnClose: true,
	};
	console.log(singleSettlementInfo);
	return (
		<Modal
			{...modal}
			className='modalDetails'>
			<div className='modelInfo'>
				<div className='left'>
					<Descriptions
						column={{ xs: 1, sm: 2, lg: 3 }}
						size='small'>
						<Descriptions.Item label='结算单号'>{singleSettlementInfo.no || '-'}</Descriptions.Item>
						<Descriptions.Item label='结算周期'>
							{moment(Number(singleSettlementInfo.timeFrom)).format('YYYY/MM/DD')} ～
							{moment(Number(singleSettlementInfo.timeTo)).format('YYYY/MM/DD')}
						</Descriptions.Item>
						<Descriptions.Item label={`一级${fields.distributor}`}>
							{singleSettlementInfo.custodianId == 1 ? '-' : singleSettlementInfo.custodianName}
						</Descriptions.Item>
						<Descriptions.Item label={fields.distributor}>
							{singleSettlementInfo.supplierName || '-'}
						</Descriptions.Item>
						{/* <Descriptions.Item label="订单来源">
              {shippingOrderTypeTextMap[singleSettlementInfo.type] || '-'}
            </Descriptions.Item> */}
						{singleSettlementInfo.reviewStatus === 'review_failure' ? (
							<Descriptions.Item label='不通过原因'>
								{singleSettlementInfo.reviewReason}
							</Descriptions.Item>
						) : singleSettlementInfo.status === 'approval_failure' ? (
							<Descriptions.Item label='不通过原因'>
								{singleSettlementInfo.approvedReason}
							</Descriptions.Item>
						) : null}
					</Descriptions>
				</div>
				<div className='right'>
					{activeTab === 'suppliers' ? (
						<Statistic
							title='当前状态'
							value={settlementSupllierReviewTextMap[singleSettlementInfo.reviewStatus]}
						/>
					) : (
						<>
							<Statistic
								title='当前状态'
								value={statementStatusTextMap[singleSettlementInfo.status]}
							/>
							<Statistic
								title={`${fields.distributor}状态`}
								value={settlementSupllierReviewTextMap[singleSettlementInfo.reviewStatus]}
							/>
						</>
					)}
					{activeTab === 'custodians' ? (
						<Statistic
							title='结算金额(元)'
							value={convertPriceWithDecimal(singleSettlementInfo.totalPrice)}
						/>
					) : null}
				</div>
			</div>
			<TableBox
				columns={
					activeTab === 'custodians'
						? columnsModal
						: columnsModal.filter((item) => item.key !== 'price')
				}
				rowKey={(record, index) => String(index)}
				dataSource={detailList}
				className='mb2'
				options={{ density: false, fullScreen: false, setting: false }}
				scroll={{ x: '100%', y: 300 }}
				tableInfoId={activeTab === 'custodians' ? '173' : '212'}
				pagination={false}
				loading={loading}
				size='small'
			/>
			{detailTotal ? (
				<PaginationBox
					data={{ total: detailTotal, pageNum: detailPageNum, pageSize: detailPageSize }}
					pageChange={(cur: number, size: number) =>
						fetchDetailList({ pageNum: cur, pageSize: size })
					}
				/>
			) : null}
			{(handleType === 'audit' || handleType === 'review') && (
				<Form
					className='mt2'
					form={form}>
					<FormItem
						label={handleType === 'audit' ? '审核结果' : '复核结果'}
						labelAlign='left'
						style={{ display: 'flex', flexDirection: 'column', marginBottom: '0px' }}
						name='info.auditType'
						rules={[{ required: true, message: '请选择' }]}
						initialValue={handleType === 'audit' ? 'approval_success' : 'review_success'}>
						<Radio.Group>
							<Radio
								value={handleType === 'audit' ? 'approval_success' : 'review_success'}
								style={{ display: 'block', marginLeft: '20px', marginTop: '22px' }}>
								通过
							</Radio>
							<Radio
								value={handleType === 'audit' ? 'approval_failure' : 'review_failure'}
								style={{ display: 'block', marginLeft: '20px', marginTop: '22px' }}>
								不通过
							</Radio>
						</Radio.Group>
					</FormItem>
					<Form.Item
						shouldUpdate={(prevValues, currentValues) =>
							prevValues['info.auditType'] !== currentValues['info.auditType']
						}>
						{({ getFieldValue }) =>
							getFieldValue('info.auditType') === 'approval_failure' ||
							getFieldValue('info.auditType') == 'review_failure' ? (
								<FormItem
									label=''
									style={{ margin: '14px 0 0 44px' }}
									name='info.reason'
									rules={[{ required: true, message: '请输入审核不通过的原因' }]}
									initialValue={''}>
									<Input.TextArea
										style={{
											maxWidth: '500px',
										}}
										rows={4}
										placeholder='请输入审核不通过的原因'
										maxLength={100}
									/>
								</FormItem>
							) : null
						}
					</Form.Item>
				</Form>
			)}
		</Modal>
	);
};

export default connect(
	({ loading, settlement }: { settlement; loading: { effects: { [key: string]: boolean } } }) => ({
		settlement,
		loading: loading.effects['settlement/querySettlementDetails'],
		submitLoading: loading.effects['settlement/orderCommit'],
		auditLoading:
			loading.effects['settlement/orderAudit'] || loading.effects['settlement/orderReview'],
	}),
)(DetailModal);
