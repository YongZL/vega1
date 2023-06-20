import type { DescriptionsItemProps } from '@/components/Descriptions/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import type { ProFormInstance } from '@ant-design/pro-form';

import Descriptions from '@/components/Descriptions';
import ProTable, { ProColumns } from '@/components/ProTable';
import SchemaForm from '@/components/SchemaForm';
import { purchasePlanStatusCommitTextMap } from '@/constants/dictionary';
import { getWorkdays } from '@/services/expecttime';
import { auditPurchasePlan, createPurchaseOrder } from '@/services/purchasenew';
import { sortListByLevel as getSortListByLevel } from '@/services/storageAreas';
import { accessNameMap } from '@/utils';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { Button, Col, Modal, Row, Statistic } from 'antd';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { history, useAccess, useModel } from 'umi';
import styles from '../index.less';

const DetailModal = ({
	modalVisible,
	setModalVisible,
	data,
	target,
	selectList,
	resetData,
	detailInfo,
	modalType,
}: PurchaseNewController.DetailPropsType) => {
	const access = useAccess();
	const { fields } = useModel('fieldsMapping');
	const formRef = useRef<ProFormInstance>();
	const [auditType, setAuditType] = useState<boolean>(true);
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [sortListByLevel, setSortListByLevel] = useState<PurchaseNewController.LevelRecord[]>([]);
	const accessName = accessNameMap(); // 权限名称

	const modalTitle =
		modalType === 'order'
			? accessName['handled_generate_purchase_order']
			: modalType === 'audit'
			? accessName['handled_approval_purchase_plan']
			: accessName['handled_purchase_plan_view'];
	const status: string = detailInfo ? purchasePlanStatusCommitTextMap[detailInfo.status] : '';
	const price: string = detailInfo
		? `￥${convertPriceWithDecimal(detailInfo.price * detailInfo.quantity)}`
		: '';
	const priceData = convertPriceWithDecimal(
		(selectList || []).reduce((acc, cur) => acc + cur.quantity * cur.price, 0),
	);
	const orderPrice = `￥${priceData}`;

	// 获取第三个工作日
	const getWorkday = async () => {
		const res = await getWorkdays();
		if (res && res.code === 0) {
			formRef.current?.setFieldsValue({
				expectedTime: moment(res.data),
			});
		}
	};

	// 获取库房
	const getSortListByLevels = async () => {
		const res = await getSortListByLevel({ isCenterWarehouse: true });
		if (res && res.code === 0) {
			const result = res.data;
			const arr = result.map((item) => ({
				value: item.id,
				label: item.name,
				key: item.name,
			}));
			setSortListByLevel(arr);
			if (result.length == 1) {
				const storageAreaId = arr[0].value;
				formRef.current?.setFieldsValue({ storageAreaId });
			}
		}
	};

	useEffect(() => {
		if (modalType === 'order') {
			getSortListByLevels();
			getWorkday();
		}
	}, []);

	const modalSubmit = () => {
		setSubmitting(true);
		formRef.current
			?.validateFields()
			.then(async (values) => {
				if (modalType === 'audit') {
					const params: Record<string, any> = {
						status: values['info.auditType'],
						reason: values['info.reason'],
						target: [target],
						goodsRelationDistributorDtos:
							data &&
							data.map((item) => {
								const { goodsId, distributorBeans } = item;
								return {
									planId: target,
									goodsId: goodsId,
									distributorId: distributorBeans && distributorBeans[0].id,
								};
							}),
					};
					if (detailInfo && detailInfo.status !== 'approval_pending') {
						notification.error('该采购计划已审核,不可修改');
						setSubmitting(false);
						return;
					}
					const res = await auditPurchasePlan(params);
					if (res && res.code === 0) {
						notification.success('操作成功');
						resetData && resetData();
					}
				} else {
					if (selectList && selectList.some((item) => item.status !== 'approval_success')) {
						notification.error('有采购计划未审核或审核不通过,请检查');
						setSubmitting(false);
						return;
					}
					let planIds;
					const pathname = history.location.pathname.split('/');
					if (
						(pathname.includes('false') || pathname.includes('true')) &&
						selectList &&
						!selectList.length
					) {
						const pathArray = pathname.filter((item) => item);
						planIds = pathArray[pathArray.length - 2];
					} else {
						planIds = selectList && selectList.map((item) => item.id);
					}
					const params: any = {
						planIds,
						expectedTime: moment(values.expectedTime).startOf('day').valueOf(), // 当天零点
						storageAreaId: values.storageAreaId,
					};
					const res = await createPurchaseOrder(params);
					if (res && res.code === 0) {
						notification.success('操作成功');
						resetData && resetData();
					}
				}
			})
			.catch(() => {
				setSubmitting(false);
				return;
			});
	};

	const formColumns: ProFormColumns = [
		{
			title: '期望到货时间',
			dataIndex: 'expectedTime',
			valueType: 'datePicker',
			fieldProps: {
				placeholder: '',
				options: [],
			},
			formItemProps: {
				rules: [
					{
						required: true,
						message: '请选择',
					},
				],
			},
		},
		{
			title: '库房',
			dataIndex: 'storageAreaId',
			valueType: 'select',
			hideInForm: WEB_PLATFORM === 'DS',
			fieldProps: {
				placeholder: '请选择',
				options: sortListByLevel,
			},
			formItemProps: {
				rules: [
					{
						required: true,
						message: '请选择',
					},
				],
			},
		},
	];

	const auditFormColumn: ProFormColumns = [
		{
			title: '',
			dataIndex: 'info.auditType',
			valueType: 'radio',
			initialValue: true,
			fieldProps: {
				placeholder: '请选择',
				options: [
					{ label: '通过', value: true },
					{ label: '不通过', value: false },
				],
				onChange: (e: any) => setAuditType(e.target.value),
			},
			formItemProps: {
				rules: [
					{
						required: true,
						message: '请选择',
					},
				],
			},
		},
		{
			title: '',
			dataIndex: 'info.reason',
			valueType: 'textarea',
			fieldProps: {
				placeholder: '请输入审核不通过的原因',
			},
			hideInForm: auditType,
			formItemProps: {
				rules: [
					{
						required: true,
						message: '请输入审核不通过的原因',
					},
				],
			},
		},
	];

	let columnsModal: ProColumns<PurchaseNewController.WithPageListRecord>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 120,
		},
		{
			title: 'DI',
			dataIndex: 'diCode',
			key: 'diCode',
			width: 120,
		},
		{
			title: fields.goodsName,
			dataIndex: modalType !== 'order' ? 'goodsName' : 'planName',
			key: 'planName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			renderText: (text: string, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: fields.distributor,
			dataIndex: 'supplierName',
			key: 'supplierName',
			width: 200,
			ellipsis: true,
			renderText: (text: string, record) => {
				return (
					<span>
						{['approval_success', 'finished'].includes(record.status) ? (
							<span>{record.distributorName}</span>
						) : (
							<span>
								{record.distributorBeans && record.distributorBeans.length
									? record.distributorBeans.map((item) => item.companyName).toString()
									: '-'}
							</span>
						)}
					</span>
				);
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 180,
			ellipsis: true,
		},
		{
			title: '配货库房',
			dataIndex: 'storageAreaName',
			key: 'storageAreaName',
			width: 180,
			ellipsis: true,
			hideInTable: WEB_PLATFORM !== 'DS',
		},
		{
			title: '单价(元)',
			dataIndex: 'price',
			key: 'price' + 'id',
			width: 120,
			renderText: (text: number) => <span>{convertPriceWithDecimal(text)}</span>,
		},
		{
			title: '申请数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 120,
			renderText: (text: number, record) => (
				<span>{text + (record.unit ? record.unit : record.surgicalPackageId ? '套' : '包')}</span>
			),
		},
		{
			title: '备注',
			dataIndex: 'remarks',
			width: 130,
			ellipsis: true,
		},
	];

	if (modalType === 'order') {
		columnsModal.splice(4, 0, {
			title: '申请科室',
			dataIndex: 'departmentName',
			key: 'departmentName',
			width: 170,
			ellipsis: true,
		});
	}

	const options: DescriptionsItemProps[] = [
		{
			label: '申请单号',
			dataIndex: 'planCode',
		},
		{
			label: '申请科室',
			dataIndex: 'departmentName',
		},
		{
			label: '期望到货时间',
			dataIndex: 'timeExpected',
			render: (text) => <span>{text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-'}</span>,
		},
		{
			label: '审核人员',
			dataIndex: 'auditedName',
		},
		{
			label: '审核时间',
			dataIndex: 'timeAudited',
			render: (text) => <span>{text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-'}</span>,
		},
		{
			show: detailInfo && detailInfo.reason ? true : false,
			label: '不通过原因',
			dataIndex: 'reason',
		},
	];

	return (
		<Modal
			visible={modalVisible}
			maskClosable={false}
			destroyOnClose={true}
			className='ant-detail-modal'
			title={modalTitle}
			onCancel={() => setModalVisible && setModalVisible(false)}
			onOk={modalSubmit}
			footer={
				modalType !== 'view' ? (
					<Button
						type='primary'
						onClick={modalSubmit}
						loading={submitting}>
						提交
					</Button>
				) : null
			}>
			<>
				{modalType !== 'order' && (
					<Row className='detailsBorderAndMargin four'>
						<Col className='left'>
							<Descriptions
								options={options}
								data={detailInfo || {}}
								optionEmptyText='-'
								defaultColumn={3}
								minColumn={2}
							/>
						</Col>
						<Col className='right'>
							<Statistic
								title='总价(元)'
								value={price}
							/>
							<Statistic
								title='当前状态'
								value={status}
							/>
						</Col>
					</Row>
				)}
				{modalType == 'order' && (
					<Row>
						<Col span={21}>
							<SchemaForm
								formRef={formRef}
								layoutType='QueryFilter'
								columns={formColumns}
								submitter={{
									render: () => false,
								}}
							/>
						</Col>
						<Col
							span={3}
							style={{ textAlign: 'right' }}>
							<div className={styles.priceLabel}>总价(元)</div>
							<div className={styles.price}>{orderPrice}</div>
						</Col>
					</Row>
				)}

				<ProTable<PurchaseNewController.WithPageListRecord>
					columns={columnsModal}
					rowKey='id'
					dataSource={data}
					scroll={{
						y: 300,
					}}
					options={{ density: false, fullScreen: false, setting: false }}
					size='small'
				/>
				<div style={{ marginTop: '20px' }}>
					{access['handled_approval_purchase_plan'] && modalType === 'audit' && (
						<span>
							<h3 className='mt2 mb1'>审核结果</h3>
							<Row>
								<Col span={24}>
									<SchemaForm
										span={13}
										formRef={formRef}
										submitter={{
											render: () => false,
										}}
										columns={auditFormColumn}
									/>
								</Col>
							</Row>
						</span>
					)}
				</div>
			</>
		</Modal>
	);
};

export default DetailModal;
