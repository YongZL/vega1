import Breadcrumb from '@/components/Breadcrumb';
import FooterToolbar from '@/components/FooterToolbar';
import ProTable from '@/components/ProTable';
import { getDistributorDetailById } from '@/services/distributor';
import { getWithoutPriceList } from '@/services/goodsTypes';
import { getDetail, getPageList } from '@/services/manufacturer';
import { addAuth, editAuth, getAuthDetailById } from '@/services/manufacturerAuthorizations';
import { convertFormValues, getDay } from '@/utils';
import { dealPackNum, lessThan_30Days } from '@/utils/dataUtil';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { ProColumns } from '@ant-design/pro-table';
import { Button, Card, Col, DatePicker, Divider, Form, Input, message, Row, Select } from 'antd';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { history, useModel } from 'umi';
import GoodsModal from '../../components/GoodsModalList';
import UpLoadFile from '@/components/UpLoadFile';
import { uploadFileApi } from '@/services/upload';
import Styles from '../../style.less';

const FormItem = Form.Item;
const formItemLayout = {
	labelCol: {
		xs: { span: 24 },
		sm: { span: 8, offset: 1 },
	},
	wrapperCol: {
		xs: { span: 24 },
		sm: { span: 15 },
	},
};

// 新增 、 编辑 授权厂商
const ManufacturerAuthAdd = ({ match }: Record<string, any>) => {
	const [form] = Form.useForm();
	const { params } = match;
	const isAdd = params.id === undefined; // 判断当前是add模式还是edit模式
	const [manufacturerList, setManufacturerList] = useState<
		ManufacturerController.ManufacturerRecord[]
	>([]);
	const [selectedItemList, setSelectedItemList] = useState<
		GoodsTypesController.WithoutPriceListRecord[]
	>([]); // 选中的基础物资list
	const [selectedIdList, setSelectedIdList] = useState<number[]>([]);
	const [distributorName, setDistributorName] = useState<string>(''); // 回显
	const [creditCode, setCreditCode] = useState<string>('');
	const [timeLicense, setTimeLicense] = useState<string>('');
	const [creditCodeManufacturer, setCreditCodeManufacturer] = useState<string>('');
	const [timeLicenseManufacturer, setTimeLicenseManufacturer] = useState<string>('');
	const [detail, setDetail] = useState<Record<string, any>>({}); // 编辑时候的详情
	const [submitLoading, setSubmitLoading] = useState(false);
	const [manufacturer, setManufacturer] = useState([]);
	const [visible, setVisible] = useState(false);
	const [refresh, setRefresh] = useState(false);
	const [isSuccessfully, setIsSuccessfully] = useState(true); // 判断文件是否上传完成
	const [isShow, setIsShow] = useState(true);
	const [isChange, setIsChange] = useState(false);
	const [isChangeauthorizing, setIsChangeauthorizing] = useState(false);
	const { fields } = useModel('fieldsMapping');

	useEffect(() => {
		refresh && setTimeout(() => setRefresh(false));
	}, [refresh]);

	useEffect(() => {
		// 分页获取厂商列表
		const getCustodianLists = async (distributorId: number) => {
			const values = {
				pageSize: 9999,
				pageNum: 0,
				distributorId,
			};
			let res = await getPageList(values);
			if (res && res.code === 0) {
				const { rows } = res.data;
				const list =
					rows && rows.length > 0
						? rows.map((item) => ({
								...item,
								text: item.companyName,
								value: item.id,
						  }))
						: [];
				setManufacturerList(list);
			}
		};
		if (params.distributorId) getCustodianLists(params.distributorId);
	}, [params]);

	useEffect(() => {
		if (match.params.inner && match.params.inner != 'false') {
			let a = match.params.inner;
			let b = a.split('_');
			setManufacturer(b);
		}
	}, [match.params.inner]);

	useEffect(() => {
		// 根据id获取厂商详情
		getDistributorDetailById(params.distributorId).then((res) => {
			const data = res.data;
			if (data.licenseDistributorBusiness) {
				const { licenseBeginTime, licenseEndTime, creditCode, endTimeIsNull } =
					data.licenseDistributorBusiness;
				const timeBegin = licenseBeginTime ? moment(licenseBeginTime).format('YYYY/MM/DD') : '/';
				const endTime = licenseEndTime ? moment(licenseEndTime).format('YYYY/MM/DD') : '/';
				const isLong = !endTimeIsNull && !licenseEndTime ? '长期有效' : '/';
				setCreditCode(creditCode);
				setTimeLicense(timeBegin + '-' + (licenseEndTime ? endTime : isLong));
				if (licenseEndTime) {
					const showRedText = lessThan_30Days(licenseEndTime, licenseBeginTime);
					setIsChange(showRedText);
				}
			}
			setDistributorName(data.companyName);
			form.resetFields();
		});

		if (params.inner != 'false') {
			let id = params.inner.indexOf('_') >= 0 ? params.inner.split('_')[0] : params.inner;
			getDetail(id).then((res) => {
				const data = res.data;
				if (data.licenseManufacturerBusiness) {
					const { licenseBeginTime, licenseEndTime, creditCode, endTimeIsNull } =
						data.licenseManufacturerBusiness;
					const timeBegin = licenseBeginTime ? moment(licenseBeginTime).format('YYYY/MM/DD') : '/';
					const endTime = licenseEndTime ? moment(licenseEndTime).format('YYYY/MM/DD') : '/';
					const isLong = !endTimeIsNull && !licenseEndTime ? '长期有效' : '/';
					setCreditCodeManufacturer(creditCode);
					setTimeLicenseManufacturer(timeBegin + '-' + (licenseEndTime ? endTime : isLong));
					if (licenseEndTime) {
						const showRedText = lessThan_30Days(licenseEndTime, licenseBeginTime);
						setIsChangeauthorizing(showRedText);
					}
				}
			});
		}

		if (!isAdd) {
			// 编辑 需要拿授权书详情用来回显
			getAuthDetailById(params.id).then((res) => {
				const data = res.data;
				setDetail(data);
				form.resetFields();
				if (data.goodsId && data.goodsId.length > 0) {
					getGoodsList({
						id: data.goodsId.join(','),
						pageNum: 0,
						pageSize: 10000,
					});
				}
			});
		}
	}, [params.distributorId]);

	const getGoodsList = async (values: GoodsTypesController.WithoutPricePager) => {
		let res = await getWithoutPriceList(values);
		if (res && res.code === 0) {
			const { rows } = res.data;
			setSelectedItemList(rows);
		}
	};

	const onFinish = async (values: Record<string, any>) => {
		if (!isSuccessfully) {
			message.warning('请在文件上传完成后提交');
			return;
		}
		// 对原始数据进行处理
		const target: Record<string, any> = convertFormValues(values);

		// 对新增授权商授权书开始日期和签发日期处理，保证开始日期不小于签发日期
		if (values.authorizationBeginTime) {
			values.authorizationBeginTime = getDay(values.authorizationBeginTime);
		}

		if (values.authorizationEndTime) {
			values.authorizationEndTime = getDay(values.authorizationEndTime, 'end');
		}

		if (values.authorizationBeginTime > values.authorizationEndTime) {
			notification.error('授权书开始日期不能大于授权书结束日期');
			setSubmitLoading(false);
			return;
		}
		if (values.authorizationImgList.length) {
			const isUploadImg =
				values.authorizationImgList[0] && values.authorizationImgList[0].hasOwnProperty('uid');
			let imgUrlList = [];
			if (isUploadImg) {
				values.authorizationImgList.map((item) => {
					imgUrlList.push(item.response.data ? item.response.data.urlName : item.response);
				});
				target.authorizationImgList = imgUrlList;
			}
		} else {
			values.authorizationImgList = undefined;
		}
		// 因为输入框携带的是distributorName,所以需要重置distributorId
		target.distributorId = params.distributorId;
		// 选中的基础物资id列表
		target.goodsIds = selectedItemList.map(
			(item: GoodsTypesController.WithoutPriceListRecord) => item.id,
		);

		setSubmitLoading(true);
		// 提交的结果 boolean
		let result;

		if (isAdd) {
			result = await addAuth(target);
		} else {
			result = await editAuth({ ...target, id: Number(params.id) });
		}
		setSubmitLoading(false);
		if (result) {
			history.push(
				`/base_data/distributor/manufacturer_authorization/${params.distributorId}/${params.companyName}`,
			);
		}
	};

	// 提交
	const handleSubmit = () => {
		if (selectedItemList.length < 1) {
			notification.error(`请选择${fields.baseGoods}!`);
			return;
		}
		form.submit();
	};

	const changeSelect = (keys: number[]) => setSelectedIdList(keys);

	// 表格行是否可选择的配置项
	const rowSelection: Record<string, any> = {
		selectedRowKeys: selectedIdList,
		onChange: changeSelect,
	};

	// 点击选择
	const handleClick = (record: GoodsTypesController.WithoutPriceListRecord) => {
		let ids = cloneDeep(selectedIdList);
		if (ids.includes(record.id)) {
			ids = ids.filter((item) => item != record.id);
		} else {
			ids.push(record.id);
		}
		setSelectedIdList(ids);
	};

	const deleteItem = () => {
		let newArr = cloneDeep(selectedItemList);
		selectedIdList.map((itemId) => {
			newArr = newArr.filter(
				(item: GoodsTypesController.WithoutPriceListRecord) => item.id != itemId,
			);
		});
		setSelectedItemList(newArr);
		setSelectedIdList([]);
	};

	const onSelectChange = (label: GoodsTypesController.WithoutPriceListRecord) => {
		let info = manufacturerList.filter((item) => item.id == label.key)[0];
		if (info.licenseManufacturerBusiness) {
			const { licenseBeginTime, licenseEndTime, creditCode, endTimeIsNull } =
				info.licenseManufacturerBusiness;
			const timeBegin = licenseBeginTime ? moment(licenseBeginTime).format('YYYY/MM/DD') : '/';
			const endTime = licenseEndTime ? moment(licenseEndTime).format('YYYY/MM/DD') : '/';
			const isLong = !endTimeIsNull && !licenseEndTime ? '长期有效' : '/';
			setCreditCodeManufacturer(creditCode);
			setTimeLicenseManufacturer(timeBegin + '-' + (licenseEndTime ? endTime : isLong));
		}
		setRefresh(true);
	};

	const columns: ProColumns<GoodsTypesController.WithoutPriceListRecord>[] = [
		{
			title: fields.goodsName,
			width: 180,
			dataIndex: 'name',
			key: 'name',
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			width: 150,
			ellipsis: true,
			render: (text, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '大/中包装',
			width: 120,
			dataIndex: 'largeBoxNum',
			key: 'largeBoxNum',
			align: 'left',
			render: (largeBoxNum, record) => dealPackNum(record.largeBoxNum, record.minGoodsNum),
		},
		{
			title: '注册证号',
			width: 150,
			dataIndex: 'registrationNum',
			key: 'registrationNum',
			ellipsis: true,
		},
		{
			title: '生产厂家',
			width: 150,
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			ellipsis: true,
		},
		{
			title: `SPD${fields.goodsCode}`,
			width: 150,
			dataIndex: 'materialCode',
			key: 'materialCode',
			ellipsis: true,
		},
		{
			title: '单价(元)',
			width: 120,
			dataIndex: 'procurementPrice',
			key: 'procurementPrice',
			align: 'right',
			renderText: (text: number) => <span>{text ? convertPriceWithDecimal(text) : '-'}</span>,
		},
	];

	return (
		<div className='detail-page'>
			<div className='detail-breadcrumb'>
				<Breadcrumb
					config={[
						'',
						[``, '/base_data/distributor'],
						[
							``,
							`/base_data/distributor/manufacturer_authorization/${params.distributorId}/${params.companyName}`,
						],
						` - ${params.inner === 'false' ? params.companyName : params.inner.split('_')[1]}`,
					]}
				/>
			</div>

			<div className={Styles['add-auth']}>
				<Card
					bordered={false}
					className='mb6 card-mt2'>
					<Form
						form={form}
						onFinish={onFinish}
						{...formItemLayout}>
						<div className='header'>
							<div className='title mb2'>授权书信息</div>
							<Row>
								<Col
									sm={24}
									md={9}
									lg={9}
									xl={9}
									className='tableTitle distributorDisabled'>
									<FormItem
										label={`${fields.distributor}名称`}
										name='distributorId'
										initialValue={distributorName}
										style={{ marginBottom: '2px' }}
										extra={
											<span
												className='tableAlertAuthorization'
												style={{
													backgroundColor: CONFIG_LESS['@bgc_search'],
													borderRadius: '2px',
													whiteSpace: 'nowrap',
												}}>
												<ExclamationCircleFilled
													style={{
														color: CONFIG_LESS['@c_starus_await'],
														marginRight: '8px',
														fontSize: '12px',
													}}
												/>
												<span
													className='consumeCount'
													style={{ border: 0 }}>
													统一社会信用代码:
													<span className='tableNotificationTitleNum'>{creditCode || '-'}</span>,
													营业执照效期:
													<span
														className={
															creditCode
																? isChange
																	? 'titlehaveexpired tableNotificationTitleNum'
																	: 'tableNotificationTitleNum'
																: 'tableNotificationTitleNum'
														}>
														{timeLicense}
													</span>
												</span>
											</span>
										}>
										<Input disabled />
									</FormItem>
								</Col>
							</Row>
							<Row>
								<Col
									sm={24}
									md={9}
									lg={9}
									xl={9}
									className={
										!isAdd || manufacturer.length > 0
											? 'tableTitle distributorDisabled'
											: 'tableTitle'
									}>
									<FormItem
										{...formItemLayout}
										label='授权生产厂家'
										name='manufacturerId'
										initialValue={
											!isAdd
												? params.id
													? manufacturer.length > 0
														? {
																key: manufacturer[0],
																label: manufacturer[1],
														  }
														: undefined
													: {
															key: detail.manufacturerId,
															label: detail.manufacturerName,
													  }
												: manufacturer.length > 0
												? {
														key: manufacturer[0],
														label: manufacturer[1],
												  }
												: undefined
										}
										style={{ marginBottom: '2px' }}
										extra={
											<span
												className='tableAlertAuthorization'
												style={{
													backgroundColor: CONFIG_LESS['@bgc_search'],
													borderRadius: '5px',
													whiteSpace: 'nowrap',
												}}>
												<ExclamationCircleFilled
													style={{
														color: CONFIG_LESS['@c_starus_await'],
														marginRight: '8px',
														fontSize: '12px',
													}}
												/>
												<span
													className='consumeCount'
													style={{ border: 0 }}>
													统一社会信用代码：
													<span className='titlecollect'>{creditCodeManufacturer || '-'}</span> ,
													营业执照效期：
													<span
														className={
															timeLicenseManufacturer
																? isChangeauthorizing
																	? 'titlehaveexpired'
																	: 'titlecollect'
																: ''
														}>
														{timeLicenseManufacturer || '-'}
													</span>
												</span>
											</span>
										}>
										<Select
											labelInValue
											disabled={!isAdd || manufacturer.length > 0}
											showSearch
											getPopupContainer={(node) => node.parentNode}
											placeholder='请选择'
											onChange={onSelectChange}
											optionFilterProp='title'>
											{manufacturerList.length > 0 &&
												manufacturerList.map((item) => (
													<Select.Option
														title={item.text}
														key={item.value}>
														{item.text}
													</Select.Option>
												))}
										</Select>
									</FormItem>
								</Col>
							</Row>
							<Row>
								<Col
									sm={24}
									md={9}
									lg={9}
									xl={9}>
									<FormItem
										label='授权书生效日期'
										rules={[{ required: true, message: '请输入' }]}
										name={`authorizationBeginTime`}
										initialValue={
											detail.authorizationBeginTime
												? moment(new Date(detail.authorizationBeginTime))
												: undefined
										}>
										<DatePicker
											format={['YYYY-MM-DD', 'YYYY/MM/DD']}
											style={{ width: '100%' }}
										/>
									</FormItem>
								</Col>
								<Col
									sm={24}
									md={9}
									lg={9}
									xl={9}>
									<FormItem
										label='授权书有效期至'
										rules={[{ required: true, message: '请输入' }]}
										name={`authorizationEndTime`}
										initialValue={
											detail.authorizationEndTime
												? moment(new Date(detail.authorizationEndTime))
												: undefined
										}>
										<DatePicker
											format={['YYYY-MM-DD', 'YYYY/MM/DD']}
											style={{ width: '100%' }}
										/>
									</FormItem>
								</Col>
								<Col
									sm={24}
									md={9}
									lg={9}
									xl={9}>
									<UpLoadFile
										setIsshow={setIsShow}
										isleft={true}
										form={form}
										uploadApi={uploadFileApi}
										setIsSuccessfully={setIsSuccessfully}
										label='授权书'
										btnTxt='上传授权书'
										formName='authorizationImgList'
										initialValue={detail.authorizationImgList}
									/>
									{/* {isShow && (
                    <span style={{ marginLeft: '11.5vw' }}>
                      <Images url={detail.authorizationImg} />
                    </span>
                  )} */}
								</Col>
								<Col
									sm={24}
									md={9}
									lg={9}
									xl={9}>
									<FormItem
										{...formItemLayout}
										label='备注'
										name='remark'
										initialValue={detail.remark}>
										<Input.TextArea maxLength={200} />
									</FormItem>
								</Col>
							</Row>
						</div>

						<Divider />

						<div
							className='main'
							style={{ marginTop: -14 }}>
							<ProTable
								headerTitle={<span>授权{fields.baseGoods}列表</span>}
								rowSelection={!detail.isEnabled && rowSelection}
								columns={columns}
								dataSource={selectedItemList}
								rowKey='id'
								onRow={(record: GoodsTypesController.WithoutPriceListRecord) => ({
									onClick: (e: Record<string, any>) => {
										e.stopPropagation();
										!detail.isEnabled && handleClick(record);
									},
								})}
								scroll={{ y: 300 }}
								tableAlertOptionRender={
									<a
										onClick={() => {
											setSelectedIdList([]);
											setSelectedItemList([]);
										}}>
										取消选择
									</a>
								}
								toolBarRender={() => [
									<div>
										{selectedIdList.length > 0 && (
											<Button
												type='primary'
												danger
												className='mr2'
												onClick={() => deleteItem()}>
												删除
											</Button>
										)}
										<Button
											type='primary'
											onClick={() => setVisible(true)}
											disabled={!form.getFieldValue('manufacturerId') || detail.isEnabled}>
											选择{fields.baseGoods} (已选{selectedItemList.length})
										</Button>
									</div>,
								]}
							/>
						</div>
						<FooterToolbar>
							<Button
								className='returnButton'
								onClick={() => {
									history.push(
										`/base_data/distributor/manufacturer_authorization/${params.distributorId}/${params.companyName}`,
									);
								}}>
								返回
							</Button>
							<Button
								type='primary'
								onClick={handleSubmit}
								className='submit-btn verifyButton'
								loading={submitLoading}>
								{submitLoading ? '正在提交...' : '提交'}
							</Button>
						</FooterToolbar>
					</Form>
				</Card>

				{/* 选择基础物资列表 */}
				{visible && (
					<GoodsModal
						isManufacturerAuth={true}
						selectedItemList={selectedItemList}
						data={{
							visible,
							type: 'manufacturer',
						}}
						searchId={{
							manufacturerIds: form.getFieldValue('manufacturerId')
								? form.getFieldValue('manufacturerId').key
								: '',
						}}
						close={() => setVisible(false)}
						submit={(list: Record<string, any>) => setSelectedItemList(list.dataList)}
					/>
				)}
			</div>
		</div>
	);
};

export default ManufacturerAuthAdd;
