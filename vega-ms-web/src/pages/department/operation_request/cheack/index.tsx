import { getScrollX } from '@/utils';
import { formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { Button, Col, Descriptions, Form, Input, Modal, Radio, Row, Statistic, Table } from 'antd';
import moment from 'moment';
import { FC, useEffect, useState } from 'react';
import { connect, useModel } from 'umi';
import {
	queryDetail,
	queryDetailApproval,
	queryMedicalAdviceList,
	queryPackageSurgicalDetailList,
	queryPackageSurgicalList,
} from '../service';
import styles from './style.less';

const FormItem = Form.Item;
const hospitalId = sessionStorage.getItem('hospital_id');
const approvaStatus = {
	surgical_request_pending: { text: '待请领', color: CONFIG_LESS['@c_starus_await'] },
	approval_pending: { text: '待审核', color: CONFIG_LESS['@c_starus_await'] },
	approval_review_success: { text: '审核通过', color: CONFIG_LESS['@c_starus_done'] },
	approval_review_failure: { text: '审核不通过', color: CONFIG_LESS['@c_starus_warning'] },
};

const CheckModal: FC<{}> = ({ id, visible, onCancel, modalType, getList, global }) => {
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const [loading, setLoading] = useState<boolean>(false);
	const [details, setDetails] = useState({});
	const [selectId, setSelectId] = useState('');
	const [surgicalItemList, setSurgicalItemList] = useState([]);
	const [doctorList, setDoctorList] = useState([]);
	const [formAgree, setFormAgree] = useState('');
	const [selectList, setSelectList] = useState([]);
	// 获取请领详情
	const getDetail = async (parms) => {
		let res = await queryDetail(parms);
		if (res && res.code === 0) {
			setDetails(res.data);
			if (res.data.items.length > 0) {
				getSurgicalItemList(res.data.items[0].packageSurgicalId);
				setSelectId(res.data.items[0].packageSurgicalId);
			}
			getPackageSurgicalList({ departmentId: res.data.departmentId }, res.data);
			getDoctorSayList(res.data.patientNo);
		}
	};
	const getDetailDoctorSelect = (id) => {
		let list = [];
		list = doctorList.filter((item) => item.adviceId == id);
		setSelectList(list);
	};
	// 请求套包数据
	const getPackageSurgicalList = async (parms, datas) => {
		let res = await queryPackageSurgicalList({
			pageSize: 9999,
			pageNum: 0,
			isEnabled: true,
			...parms,
		});
		if (res && res.code === 0) {
			let data = res.data.rows;
			if (data.length > 0) {
				// 默认第一个套包的基础物资详情
				// getSurgicalItemList(data[0].id);
				// setSelectId(data[0].id);
			} else {
				setSurgicalItemList([]);
			}
			// setModalData(data);
		}
	};
	// 获取手术套包基础物资列表
	const getSurgicalItemList = async (id) => {
		let params = {
			id: id,
			pageSize: 9999,
			pageNum: 0,
		};
		let res = await queryPackageSurgicalDetailList(params);
		if (res && res.code === 0) {
			let detail = res.data;
			setSurgicalItemList(detail.page.rows);
		}
	};
	// 获取对应医嘱信息列表
	const getDoctorSayList = async (patientNo) => {
		let params = {
			patientNo,
			pageSize: 9999,
			pageNum: 0,
		};
		let res = await queryMedicalAdviceList(params);
		if (res && res.code === 0) {
			let detail = res.data;
			setDoctorList(detail.rows);
		}
	};
	useEffect(() => {
		if (doctorList.length > 0) {
			getDetailDoctorSelect(details.medicalAdviceId);
		}
	}, [details, doctorList]);
	// 单行点击选中
	const selectRowOfClick = (id) => {
		getSurgicalItemList(id);
		setSelectId(id);
	};

	useEffect(() => {
		if (visible && id) {
			const params = {
				hospitalId,
				id,
			};
			getDetail(params);
		}
	}, [visible, id]);

	const onFinish = async (values) => {
		let type = values.auditType;
		let status = details.status;
		let newStatus = '';
		if (status == 'approval_pending') {
			newStatus = type === 'N' ? 'approval_review_failure' : 'approval_review_success';
		}
		let params = {
			hospitalId,
			id: id,
			reason: type === 'N' ? values.reason : '',
			status: newStatus,
		};
		setLoading(true);
		let res = await queryDetailApproval(params);
		if (res && res.code === 0) {
			notification.success('提交成功');
			onCancel();
			getList();
		}
		setLoading(false);
	};
	const sureSubmit = () => {
		form.submit();
	};
	const columnsModalYZXX = [
		{
			title: '收费序号',
			dataIndex: 'adviceNo',
			key: 'adviceNo',
			width: 90,
		},
		{
			title: '开单科室',
			dataIndex: 'departmentName',
			key: 'departmentName',
			width: 90,
		},
		{
			title: '医生编码',
			dataIndex: 'doctorCode',
			key: 'doctorCode',
			width: 90,
		},
		{
			title: '医生姓名',
			dataIndex: 'doctorName',
			key: 'doctorName',
			width: 90,
		},
		{
			title: '医嘱内容',
			dataIndex: 'content',
			key: 'content',
			width: 90,
		},
		{
			title: '开单时间',
			dataIndex: 'orderCreatedTime',
			key: 'orderCreatedTime',
			width: 90,
			render: (text) => {
				return <span>{text ? moment(new Date(text)).format('YYYY/MM/DD HH:mm:ss') : '-'}</span>;
			},
		},
	];
	const columnsModalDetail = [
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: '30%',
			ellipsis: true,
		},
		{
			title: '套包名称',
			dataIndex: 'packageName',
			key: 'packageName',
			width: '30%',
			ellipsis: true,
		},
		{
			title: '请领数量',
			dataIndex: 'packageQuantity',
			key: 'packageQuantity',
			width: '20%',
			ellipsis: true,
		},
		{
			title: '',
			dataIndex: 'detail',
			key: 'detail',
			width: 20,
			render: (text, record) => {
				return <span>{record.packageSurgicalId === selectId ? '>' : ''}</span>;
			},
		},
	];
	const surgicalItemsColumns = [
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 120,
			ellipsis: true,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 180,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'goodsSpecification',
			key: 'goodsSpecification',
			ellipsis: true,
			width: 150,
			render: (text: any, record: any) => {
				return <span>{formatStrConnect(record, ['goodsSpecification', 'goodsModel'])}</span>;
			},
		},
		{
			title: '包装规格',
			width: 120,
			dataIndex: 'quantity',
			key: 'quantity',
			render: (quantity, record) => {
				return (
					<span>{`${quantity || ''}  ${record.minUnitName || ''}  ${
						record.minUnitName && quantity && '/'
					}${record.quantityUnitName || ''}`}</span>
				);
			},
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 120,
			render: (text, record) => {
				return <span>{`${record.quantity}${record.quantityUnitName}`}</span>;
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 120,
			ellipsis: true,
		},

		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 220,
			ellipsis: true,
		},
	];
	return (
		<div>
			<Modal
				visible={visible}
				width={'80%'}
				maskClosable={false}
				title={modalType == 'detail' ? '手术请领详情' : '手术请领审核'}
				onCancel={onCancel}
				footer={
					modalType == 'detail'
						? []
						: [
								<Button
									key='submit'
									type='primary'
									loading={loading}
									onClick={sureSubmit}>
									提交
								</Button>,
						  ]
				}>
				<div>
					<div style={{ display: 'flex', width: '100%' }}>
						<div style={{ flex: 'auto' }}>
							<Descriptions
								className={styles.headerList}
								size='small'>
								<Descriptions.Item label='请领单号'>{details.code}</Descriptions.Item>
								<Descriptions.Item label='主治医生'>{details.doctorName}</Descriptions.Item>
								<Descriptions.Item label='申请科室'>{details.departmentName}</Descriptions.Item>

								<Descriptions.Item label='病人姓名'>{details.name}</Descriptions.Item>
								<Descriptions.Item label='病人性别'>
									{details.gender == 'M' ? '男' : '女'}
								</Descriptions.Item>
								<Descriptions.Item label='病人年龄'>
									{details.birth
										? Math.ceil((new Date().getTime() - details.birth) / 31536000000)
										: ''}
								</Descriptions.Item>
								<Descriptions.Item label='拟施手术方案'>{details.surgicalName}</Descriptions.Item>
								<Descriptions.Item label='拟施手术日期'>
									{details.surgicalDate
										? moment(details.surgicalDate).format('YYYY/MM/DD HH:mm')
										: '-'}
								</Descriptions.Item>
							</Descriptions>
							<div style={{ marginBottom: '10px' }}>
								{modalType == 'detail' ? null : <h3 className='mt2 mb1'>请领列表</h3>}
								<Descriptions
									className={styles.headerList}
									size='small'>
									<Descriptions.Item label='仓库'>{details.warehouseName}</Descriptions.Item>
									<Descriptions.Item label='期望到货时间'>
										{details.expectedTime
											? moment(details.expectedTime).format('YYYY/MM/DD HH:mm')
											: '-'}
									</Descriptions.Item>
								</Descriptions>
								<Descriptions
									className={styles.headerList}
									size='small'>
									<Descriptions.Item label='不通过原因'>{details.reason}</Descriptions.Item>
								</Descriptions>
							</div>
						</div>
						<div style={{ minWidth: '142px', marginLeft: '44px', textAlign: 'right' }}>
							<div className={styles.moreInfo}>
								<Statistic
									title='当前状态'
									value={details.status ? approvaStatus[details.status].text : ''}
								/>
							</div>
						</div>
					</div>
					<div>
						{global.config.medical_advice_direction &&
						global.config.medical_advice_direction === 'HIS2SPD' ? null : (
							<>
								<h3 className='mt2 mb1'>对应医嘱信息</h3>
								<Table
									style={{ marginBottom: 16 }}
									rowKey='adviceId'
									pagination={false}
									loading={loading}
									dataSource={selectList}
									columns={columnsModalYZXX}
								/>
							</>
						)}

						<Row>
							<Col
								sm={24}
								md={10}
								style={{ paddingRight: '3px' }}>
								<Table
									columns={columnsModalDetail}
									rowKey='id'
									dataSource={details.items || []}
									pagination={false}
									size='small'
									bordered={false}
									onRow={(record) => ({
										onClick: () => {
											selectRowOfClick(record.packageSurgicalId);
										},
									})}
									scroll={{ y: 400, x: getScrollX(columnsModalDetail) }}
								/>
							</Col>
							<Col
								sm={24}
								md={14}
								style={{ paddingLeft: '3px' }}>
								<Table
									columns={surgicalItemsColumns}
									rowKey='id'
									dataSource={surgicalItemList || []}
									size='small'
									pagination={false}
									scroll={{ y: 400, x: getScrollX(surgicalItemsColumns) }}
								/>
							</Col>
						</Row>
						<Form
							initialValues={{ ['auditType']: 'Y' }}
							onFinish={onFinish}
							form={form}>
							{['audit'].includes(modalType) && (
								<>
									<h3 className='mt2 mb1'>审核结果</h3>
									<FormItem
										name='auditType'
										rules={[{ required: true, message: '请选择' }]}>
										<Radio.Group onChange={(e) => setFormAgree(e.target.value)}>
											<Radio
												value='Y'
												style={{ display: 'block', marginBottom: '10px' }}>
												通过
											</Radio>
											<Radio
												value='N'
												style={{ display: 'block' }}>
												不通过
											</Radio>
										</Radio.Group>
									</FormItem>
									{formAgree === 'N' && (
										<FormItem
											name='reason'
											rules={[{ required: true, message: '请输入不通过理由' }]}
											style={{ marginLeft: '22px' }}>
											<Input.TextArea
												style={{ maxWidth: '500px' }}
												rows={3}
												placeholder='请输入不通过理由'
												maxLength={100}
											/>
										</FormItem>
									)}
								</>
							)}
						</Form>
					</div>
				</div>
			</Modal>
		</div>
	);
};
export default connect(({ global }) => ({ global }))(CheckModal);
