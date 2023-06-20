import Breadcrumb from '@/components/Breadcrumb';
import FooterToolbar from '@/components/FooterToolbar';
import ProTable from '@/components/ProTable';
import { getDistributorDetailById } from '@/services/distributor';
import {
	addAuth,
	checkBeforeDeletingMaterial,
	editAuth,
	getAuthDetailByAuthId,
	getCustodianList,
} from '@/services/distributorAuthorization';
import { getGoodsList } from '@/services/distributorGoods';
import { convertFormValues, getDay } from '@/utils';
import { dealPackNum, lessThan_30Days } from '@/utils/dataUtil';
import { convertImageUrl } from '@/utils/file/image';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { ProColumns } from '@ant-design/pro-table';
import {
	Button,
	Card,
	Col,
	DatePicker,
	Divider,
	Form,
	Input,
	message,
	Modal,
	Row,
	Select,
} from 'antd';
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

//  新增 、 编辑 授权一级
const DistributorListAuthAdd = ({ match }: Record<string, any>) => {
	const [form] = Form.useForm();
	const { params } = match;
	const isAdd = params.id === undefined; // 判断当前是add模式还是edit模式
	const [custodianList, setCustodianList] = useState<
		DistributorAuthorizationController.DistributorListRecord[]
	>([]);
	const [selectedItemList, setSelectedItemList] = useState<
		DistributorAuthorizationController.GoodsListRecord[]
	>([]); // 选中的基础物资list
	const [selectedItemListCopy, setSelectedItemListCopy] = useState<
		DistributorAuthorizationController.GoodsListRecord[]
	>([]);
	const [selectedIdList, setSelectedIdList] = useState<number[]>([]); // 选中的 itemList 对应的 idList
	const [distributorName, setDistributorName] = useState(''); // 名称回显
	const [creditCode, setCreditCode] = useState('');
	const [timeLicense, setTimeLicense] = useState('');
	const [creditCodeManufacturer, setCreditCodeManufacturer] = useState('');
	const [timeLicenseManufacturer, setTimeLicenseManufacturer] = useState('');
	const [detail, setDetail] = useState<Record<string, any>>({}); // 编辑时候的详情
	const [submitLoading, setSubmitLoading] = useState(false);
	const [custodian, setCustodian] = useState([]);
	const [visible, setVisible] = useState(false);
	const [refresh, setRefresh] = useState(false);
	const [visiblesc, setIsVisiblesc] = useState(false);
	const [dataList, setDataList] = useState([]);
	const [isSuccessfully, setIsSuccessfully] = useState(true); // 判断文件是否上传完成
	const [isShow, setIsShow] = useState(true);
	const [isChange, setIsChange] = useState(false);
	const [isChangeauthorizing, setIsChangeauthorizing] = useState(false);
	const { fields } = useModel('fieldsMapping');

	useEffect(() => {
		refresh && setTimeout(() => setRefresh(false));
	}, [refresh]);

	useEffect(() => {
		const getCustodianLists = async (distributorId: number) => {
			const res = await getCustodianList(distributorId);
			if (res && res.code === 0) {
				const data = res.data;
				const list =
					data && data.length > 0
						? data.map((item) => ({
								...item,
								text: item.companyName,
								value: item.id,
						  }))
						: [];
				setCustodianList(list);
			}
		};
		if (params.distributorId) getCustodianLists(params.distributorId);
	}, [params]);

	useEffect(() => {
		if (params.inner && params.inner != 'false') {
			let b = params.inner.split('_');
			setCustodian(b);
		}
	}, [match.params.inner]);

	useEffect(() => {
		// 名称显示
		getDistributorDetailById(params.distributorId).then(({ data }) => {
			if (data.licenseDistributorBusiness) {
				let { licenseBeginTime, licenseEndTime, creditCode, endTimeIsNull } =
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
		// 一级名称显示
		if (match.params.inner && match.params.inner != 'false') {
			let id =
				match.params.inner.indexOf('_') >= 0
					? match.params.inner.split('_')[0]
					: match.params.inner;
			getDistributorDetailById(id).then(({ data }) => {
				const { licenseBeginTime, licenseEndTime, creditCode, endTimeIsNull } =
					data.licenseDistributorBusiness;
				const timeBegin = licenseBeginTime ? moment(licenseBeginTime).format('YYYY/MM/DD') : '/';
				const endTime = licenseEndTime ? moment(licenseEndTime).format('YYYY/MM/DD') : '/';
				const isLong = !endTimeIsNull && !licenseEndTime ? '长期有效' : '/';
				setCreditCodeManufacturer(creditCode);
				setTimeLicenseManufacturer(timeBegin + '-' + (licenseEndTime ? endTime : isLong));
				if (licenseEndTime) {
					const showRedText = lessThan_30Days(licenseEndTime, licenseBeginTime);
					setIsChangeauthorizing(showRedText);
				}
			});
		}
		if (!isAdd) {
			// 编辑 需要拿授权书详情用来回显
			getAuthDetailByAuthId({ id: params.id }).then(({ data }) => {
				setDetail(data);
				form.resetFields();
				if (data.goodsId && data.goodsId.length > 0) {
					const params = {
						distributorId: data.distributorId,
						isCombined: false,
						id: data.goodsId.join(','),
						pageNum: 0,
						pageSize: 10000,
					};
					getGoodsListData(params);
				}
			});
		}
	}, [params.distributorId]);

	const getGoodsListData = async (params: DistributorAuthorizationController.GoodsListPager) => {
		let res = await getGoodsList(params);
		if (res && res.code == 0) {
			const { rows } = res.data;
			setSelectedItemList(rows);
			setSelectedItemListCopy(rows);
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
			values.authorizationBeginTime = getDay(values.authorizationBeginTime); // 开始日期
		}
		if (values.authorizationBeginTime) {
			values.authorizationEndTime = getDay(values.authorizationEndTime, 'end'); // 结束日期
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
		target.goodsIds = selectedItemList.map((item: Record<string, any>) => item.goodsId);

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
				`/base_data/distributor/distributor_authorization/${params.distributorId}/${match.params.companyName}`,
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
	const handleClick = (record: Record<string, any>) => {
		let ids = cloneDeep(selectedIdList);
		if (ids.includes(record.goodsId)) {
			ids = ids.filter((item) => item != record.goodsId);
		} else {
			ids.push(record.goodsId);
		}
		setSelectedIdList(ids);
	};

	const deleteItem = async () => {
		let goodsIds = [];
		let isDelete = false;
		let newArr = selectedItemListCopy;
		for (let i = 0; i < selectedIdList.length; i++) {
			for (let j = 0; j < newArr.length; j++) {
				if (selectedIdList[i] == newArr[j].goodsId) {
					isDelete = true;
					goodsIds.push(newArr[j].goodsId);
				}
			}
		}

		if (isDelete) {
			const values = {
				id: Number(params.id),
				goodsId: goodsIds,
			};
			const res = await checkBeforeDeletingMaterial(values);
			if (res && res.data.length > 0) {
				setIsVisiblesc(true);
				setDataList(res.data);
			} else {
				let newArr = cloneDeep(selectedItemList);
				selectedIdList.map((itemId) => {
					newArr = newArr.filter((item) => item.goodsId != itemId);
				});
				setSelectedItemList(newArr);
				setSelectedIdList([]);
			}
		} else {
			let newArr = cloneDeep(selectedItemList);
			selectedIdList.map((itemId) => {
				newArr = newArr.filter((item) => item.goodsId != itemId);
			});
			setSelectedItemList(newArr);
			setSelectedIdList([]);
		}
	};

	const deletesc = async (isDelete: boolean, list: [], listFan: [], goodsIds: number[]) => {
		const values = {
			id: Number(params.id),
			goodsId: goodsIds,
		};
		if (isDelete) {
			const res = await checkBeforeDeletingMaterial(values);
			if (res && res.data.length > 0) {
				setIsVisiblesc(true);
				setDataList(res.data);
			} else {
				setSelectedItemList(list);
			}
		} else {
			setSelectedItemList(list);
		}
	};

	const onSelectChange = (label: DistributorAuthorizationController.GoodsListRecord) => {
		let info = custodianList.filter((item) => item.id == label.key)[0];
		if (info.licenseDistributorBusiness) {
			const { licenseBeginTime, licenseEndTime, creditCode, endTimeIsNull } =
				info.licenseDistributorBusiness;
			const timeBegin = licenseBeginTime ? moment(licenseBeginTime).format('YYYY/MM/DD') : '/';
			const endTime = licenseEndTime ? moment(licenseEndTime).format('YYYY/MM/DD') : '/';
			const isLong = !endTimeIsNull && !licenseEndTime ? '长期有效' : '/';
			setCreditCodeManufacturer(creditCode);
			setTimeLicenseManufacturer(timeBegin + '-' + (licenseEndTime ? endTime : isLong));
		}
		setRefresh(true);
	};
	const handleCancel = () => setIsVisiblesc(false);

	const columns: ProColumns<DistributorAuthorizationController.GoodsListRecord>[] = [
		{
			title: fields.goodsName,
			width: 180,
			dataIndex: 'goodsName',
			key: 'goodsName',
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
			render: (largeBoxNum, record) => dealPackNum(record.largeBoxNum, record.minGoodsUnitNum),
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
			dataIndex: 'price',
			key: 'price',
			align: 'right',
			renderText: (text: number) => <span>{text ? convertPriceWithDecimal(text) : '-'}</span>,
		},
		{
			title: '厂家授权期限',
			width: 220,
			dataIndex: 'authorizationStartDate',
			key: 'authorizationStartDate',
			renderText: (text: Date, record) => {
				return (
					text && (
						<span>
							{moment(text).format('YYYY/MM/DD')} ～
							{record.authorizationEndDate
								? moment(record.authorizationEndDate).format('YYYY/MM/DD')
								: '长期有效'}
						</span>
					)
				);
			},
		},
	];

	return (
		<div style={{ margin: ' -20px -28px', padding: ' 0 4px 8px' }}>
			<div style={{ background: CONFIG_LESS['@bgc_table'] }}>
				<Breadcrumb
					config={[
						'',
						[``, '/base_data/distributor'],
						[
							``,
							`/base_data/distributor/distributor_authorization/${match.params.distributorId}/${match.params.companyName}`,
						],
						` - ${
							match.params.inner === 'false'
								? match.params.companyName
								: match.params.inner.split('_')[1]
						}`,
					]}
				/>
			</div>
			<Card
				className='mb6'
				bordered={false}
				style={{ marginTop: 2 }}>
				<div className={Styles['add-auth']}>
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
										<Input
											maxLength={30}
											disabled
										/>
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
										!isAdd || custodian.length > 0 ? 'tableTitle distributorDisabled' : 'tableTitle'
									}>
									<FormItem
										{...formItemLayout}
										label={`授权${fields.distributor}名称`}
										name='authorizingDistributorId'
										initialValue={
											!isAdd
												? match.params.id
													? custodian.length > 0
														? {
																key: custodian[0],
																label: custodian[1],
														  }
														: undefined
													: {
															key: detail.custodianId,
															label: detail.custodianName,
													  }
												: custodian.length > 0
												? {
														key: custodian[0],
														label: custodian[1],
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
													className='consumeCount '
													style={{ border: 0 }}>
													统一社会信用代码：
													<span className='tableNotificationTitleNum'>
														{creditCodeManufacturer || '-'}
													</span>{' '}
													, 营业执照效期：
													<span
														className={
															timeLicenseManufacturer
																? isChangeauthorizing
																	? 'titlehaveexpired tableNotificationTitleNum'
																	: 'tableNotificationTitleNum'
																: 'tableNotificationTitleNum'
														}>
														{timeLicenseManufacturer || '-'}
													</span>
												</span>
											</span>
										}>
										<Select
											labelInValue
											disabled={!isAdd || custodian.length > 0}
											showSearch
											getPopupContainer={(node) => node.parentNode}
											placeholder='请选择'
											onChange={onSelectChange}
											optionFilterProp='title'>
											{custodianList.length > 0 &&
												custodianList.map((item) => (
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
											style={{ width: '100%' }}
											format={['YYYY-MM-DD', 'YYYY/MM/DD']}
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
								rowSelection={rowSelection}
								columns={columns}
								dataSource={selectedItemList}
								rowKey='goodsId'
								onRow={(record: DistributorAuthorizationController.GoodsListRecord) => ({
									onClick: (e: Record<string, any>) => {
										e.stopPropagation();
										handleClick(record);
									},
								})}
								scroll={{
									y: 300,
								}}
								tableAlertOptionRender={<a onClick={() => setSelectedIdList([])}>取消选择</a>}
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
											disabled={
												!form.getFieldValue('authorizingDistributorId') || detail.isEnabled
											}>
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
										`/base_data/distributor/distributor_authorization/${match.params.distributorId}/${match.params.companyName}`,
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

					{visible && (
						<GoodsModal
							selectedItemList={selectedItemList}
							data={{
								visible,
								type: 'custodian',
							}}
							searchId={{
								distributorId: params.distributorId,
							}}
							close={() => setVisible(false)}
							submit={(list: Record<string, any>) => {
								let goodsIds: number[] = [];
								let isDelete = false;
								list.dataListfan &&
									list.dataListfan.map(
										(itemId: DistributorAuthorizationController.GoodsListRecord) => {
											selectedItemListCopy.map((item) => {
												if (itemId.goodsId == item.goodsId) {
													isDelete = true;
													goodsIds.push(itemId.goodsId);
												}
											});
										},
									);
								deletesc(isDelete, list.dataList, list.dataListfan, goodsIds);
							}}
						/>
					)}
					{visiblesc && (
						<Modal
							destroyOnClose
							maskClosable={false}
							visible={visiblesc}
							title={`授权${fields.goods}删除`}
							onCancel={handleCancel}
							width={600}
							footer={[
								<Button
									type='primary'
									onClick={handleCancel}>
									确定
								</Button>,
							]}>
							<p style={{ width: '100%', maxHeight: 300, overflowY: 'scroll' }}>
								{dataList.length &&
									dataList.map((item: DistributorAuthorizationController.GoodsListRecord) => {
										return (
											<span>
												<br />
												<b>{fields.goodsName}</b>：{item.goodsName}
												<br />
												<b>规格/型号</b>：{formatStrConnect(item, ['specification', 'model'])}
												<br />
												<span dangerouslySetInnerHTML={{ __html: item.message }}></span>
												<br />
											</span>
										);
									})}
							</p>
						</Modal>
					)}
				</div>
			</Card>
		</div>
	);
};

export default DistributorListAuthAdd;
