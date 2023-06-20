import Breadcrumb from '@/components/Breadcrumb';
import FooterToolbar from '@/components/FooterToolbar';
import { getAllGoods12, getAllGoods18 } from '@/services/category';
import { addDistributor, editDistributor, getDistributorDetail } from '@/services/distributor';
import { getAllGoods95 } from '@/services/std95GoodsCategory';
import { transformSBCtoDBC } from '@/utils';
import { notification } from '@/utils/ui';
import ProForm from '@ant-design/pro-form';
import { Button, Card, Divider, Form, message, Radio } from 'antd';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { connect, history, useModel } from 'umi';
import BaseInfo from './components/BaseInfo';
import BusinessLicense from './components/BusinessLicense';
import PermitLicense from './components/PermitLicense';
import RecordVoucher from './components/RecordVoucher';
import './style.less';
import OtherAttachments from '../../components/OtherAttachments';

const SUBMIT_CONFIG = {
	BASE_INFO: 'distributor',
	BUSINESS_LICENSE: 'businessLicense',
	PERMIT_LICENSE: 'permitLicense',
	RECORD_VOUCHER: 'recordVoucher',
};

const FormItem = Form.Item;
const AddOrEditPage: React.FC<{}> = ({ global, match }: Record<string, any>) => {
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const { params } = match;
	// 判断当前是add模式还是edit模式
	const isAdd = params.id === undefined;
	// 编辑回显用到的 「企业基本信息」 数据
	const [detail, setDetail] = useState<Record<string, any>>({});
	// 编辑回显用到的 「营业执照」 数据
	const businessLicense = detail.licenseDistributorBusiness || {};
	// 编辑回显用到的 「生产许可」 数据
	const permitLicense = detail.licenseDistributorPermit || {};
	const recordVoucher = detail.distributorRecordVoucher || {};
	const otherAttachments = detail.otherAttachments || {};

	const [loading, setLoading] = useState(false);
	const [refresh, setRefresh] = useState(false);
	const [goodsCategory12, setGoodsCategory12] = useState<CategoryController.TypeData[]>([]); // 12版经营范围
	const [goodsCategory18, setGoodsCategory18] = useState<CategoryController.TypeData[]>([]); // 98版经营范围
	const [goodsCategory95, setGoodsCategory95] = useState<Std95GoodsCategoryController.TypeData[]>(
		[],
	); // 95版经营范围
	const [goodsCategory12ba, setGoodsCategory12ba] = useState<CategoryController.TypeData[]>([]); // 12备案凭证
	const [goodsCategory18ba, setGoodsCategory18ba] = useState<CategoryController.TypeData[]>([]); // 18备案凭证
	const [isSuccessfully, setIsSuccessfully] = useState(true); // 判断文件是否上传完成
	const [baseInfoFields] = useState<string[]>([
		'companyName',
		'epsDruggistCode',
		'platformCode',
		'companyType',
		'nationality',
		'country',
		// 'province',
		// 'city',
		'provincePlatformCode',
		'address',
		'companyLegalPerson',
		'registrant',
		'principalName',
		'companyNature',
		'depositBank',
		'bankAccount',
		'contactName',
		'contactTelephone',
		'contactMobilePhone',
		'contactDepartment',
		'contactPosition',
		'companyTelephone',
		'postcode',
		'companyEmail',
		'companyFax',
		'shortName',
		'website',
		'remark',
	]);
	const childRef = useRef<Record<string, any> | undefined>();
	const phildRef = useRef<Record<string, any> | undefined>();
	const bhildRef = useRef<Record<string, any> | undefined>();
	const attachmentsRef = useRef<Record<string, any>>();

	useEffect(() => {
		refresh && setTimeout(() => setRefresh(false));
	}, [refresh]);

	// 编辑模式下需要先拉取回显用的数据
	useEffect(() => {
		if (params.id) {
			queryPageDetail(params.id);
		}
	}, [params.id]);

	// 列表请求
	const queryPageDetail = async (id: number) => {
		setLoading(true);
		const result = await getDistributorDetail({ id });
		if (result.code === 0) {
			const { data } = result;
			setDetail(data);
			form.resetFields();
			const values: Record<string, any> = {};
			baseInfoFields.forEach((key) => {
				values[`${SUBMIT_CONFIG.BASE_INFO}&${key}`] = data[key];
			});
			form.setFieldsValue(values);
		}
		setLoading(false);
	};

	// 获取物资分类
	useEffect(() => {
		const getTypeList12 = async () => {
			const res = await getAllGoods12({});
			if (res && res.code == 0) setGoodsCategory12(res.data);
		};
		getTypeList12();

		const getTypeList18 = async () => {
			const res = await getAllGoods18({});
			if (res && res.code == 0) setGoodsCategory18(res.data);
		};
		getTypeList18();

		const getTypeList12ba = async () => {
			const res = await getAllGoods12({ index: 2 });
			if (res && res.code == 0) setGoodsCategory12ba(res.data);
		};
		getTypeList12ba();

		const getTypeList18ba = async () => {
			const res = await getAllGoods18({ index: 2 });
			if (res && res.code == 0) setGoodsCategory18ba(res.data);
		};
		getTypeList18ba();

		const getTypeList95 = async () => {
			const res = await getAllGoods95();
			if (res && res.code == 0) setGoodsCategory95(res.data);
		};
		getTypeList95();
	}, []);

	const formatPostData = (values: Record<string, any>) => {
		const target: Record<string, any> = {};
		let licenseBeginTimeKey;
		let licenseBeginTimeValue;
		for (const key in values) {
			let value = values[key];
			const mainKey = key.split('&')[0];
			const subKey = key.split('&')[1];
			if (key.includes('isLongTimeValid')) {
				licenseBeginTimeKey = key.split('_')[2];
				licenseBeginTimeValue = target[mainKey][licenseBeginTimeKey];
			}
			// 是否长期有效 的判断
			// 如果长期有效，则截止日期重置为null
			if (key.includes('isLongTimeValid') && value === true) {
				const associatedqianKey = key.split('_')[0].split('&')[1];
				const associatedKey = key.split('_')[1];
				const keys = key.split('&')[1];
				delete target[mainKey][keys];
				target[mainKey] = {
					...target[mainKey],
					[associatedqianKey + '_' + associatedKey]: value,
					[licenseBeginTimeKey as string]: (licenseBeginTimeValue || [])[0],
					[associatedKey]: null,
				};
			} else if (key.includes('isLongTimeValid') && value === false) {
				const associatedqianKey = key.split('_')[0].split('&')[1];
				const associatedKey = key.split('_')[1];
				const keys = key.split('&')[1];
				delete target[mainKey][keys];
				target[mainKey] = {
					...target[mainKey],
					[associatedqianKey + '_' + associatedKey]: value,
					[licenseBeginTimeKey as string]: (licenseBeginTimeValue || [])[0],
					[associatedKey]: (licenseBeginTimeValue || [])[1],
				};
			}
			// 「上传图片」处理
			if (Array.isArray(value)) {
				// 空数组的处理
				if (value.length === 0) {
					value = undefined;
				} else {
					const isUploadImg = value[0] && value[0].hasOwnProperty('uid');
					let imgUrlList: any[] = [];
					if (isUploadImg) {
						value.map((item) => {
							imgUrlList.push(item.response.data ? item.response.data.urlName : item.response);
						});
						value = imgUrlList;
					}
				}
			}

			// 「日期」 「下拉框」 的处理
			if (typeof value === 'object' && value !== null) {
				const isDate = moment.isMoment(value);
				const isSelect = value.hasOwnProperty('key') && value.hasOwnProperty('label');

				if (isDate) {
					value = value.valueOf();
				} else if (isSelect) {
					// 下拉框的值是对象 要转成 字符串
					value = value.key;
				}
			}

			target[mainKey] = { ...target[mainKey], [subKey]: value };

			// 注册资金处理
			if (key.includes('registeredCapital') && value) {
				target[mainKey] = { ...target[mainKey], [subKey]: value * 1000000 };
			}
		}
		delete target.hasPermitLicense;
		delete target.hasRecordLicense;
		delete target.permitLicensehasTree;
		delete target.recordVoucherhasTree;
		delete target.businessLicensehasTree;
		// 药品环境默认为false
		target.distributor.hasPermitLicense = WEB_PLATFORM === 'DS' ? false : values.hasPermitLicense;
		target.distributor.hasRecordLicense = WEB_PLATFORM === 'DS' ? false : values.hasRecordLicense;
		target.businessLicense.tree95 = WEB_PLATFORM === 'DS' ? false : target.businessLicense.tree95;
		return target;
	};

	// 查询
	const onFinish = async (values: Record<string, any>) => {
		if (!isSuccessfully) {
			message.warning('请在文件上传完成后提交');
			return;
		}
		if (
			values['businessLicense&licenseEndTime'] &&
			values['businessLicense&licenseEndTime'].valueOf() <
				values['businessLicense&licenseBeginTime'] &&
			values['businessLicense&licenseBeginTime'].valueOf()
		) {
			notification.error('营业执照截止日期不可小于生效日期');
			return;
		}

		if (
			values['permitLicense&permitEndTime'] &&
			values['permitLicense&permitEndTime'].valueOf() < values['permitLicense&permitBeginTime'] &&
			values['permitLicense&permitBeginTime'].valueOf()
		) {
			notification.error('经营许可证截止日期不可小于生效日期');
			return;
		}

		setLoading(true);
		const scskFw = values.hasPermitLicense ? phildRef.current?.getVal() : {};
		const ylpzFw = values.hasRecordLicense ? childRef.current?.getVal() : {};
		const jyzzFw = bhildRef.current?.getVal();
		let otherAttachments = {
			remark: values.remark,
			attachments: attachmentsRef.current?.getVal(formatPostData({ ...values }).otherAttachments),
		};
		// 经过格式化之后的值
		let target = transformSBCtoDBC(formatPostData({ ...values, ...ylpzFw, ...scskFw, ...jyzzFw }));

		target = {
			...target,
			businessLicense: {
				...target.businessLicense,
				endTimeIsNull:
					!target.businessLicense?.isLongTimeValid_licenseEndTime &&
					!target.businessLicense?.licenseEndTime,
				id: businessLicense.id,
				licenseImgList: target.businessLicense?.licenseImgList,
			},
			permitLicense: {
				...target.permitLicense,
				endTimeIsNull:
					!target.permitLicense?.isLongTimeValid_permitEndTime &&
					!target.permitLicense?.permitEndTime,
				id: permitLicense.id,
				permitImgList: target.permitLicense?.permitImgList,
			},
			recordVoucher: { ...target.recordVoucher, id: recordVoucher.id },
			otherAttachments,
		};

		// 提交的结果 boolean
		let result;
		if (isAdd) {
			result = await addDistributor(target);
		} else {
			result = await editDistributor(params.id, target);
		}
		setLoading(false);

		if (result.code == 0) {
			history.push({ pathname: `/base_data/distributor`, state: 'distributor' });
		}
	};

	return (
		<div style={{ margin: '-20px -24px' }}>
			<div style={{ padding: '8px 24px', background: '#fff', marginBottom: 1 }}>
				<Breadcrumb
					config={['', ['', { pathname: '/base_data/distributor', state: 'distributor' }], '']}
				/>
			</div>
			<div className='form_add'>
				<ProForm
					form={form}
					onFinish={onFinish}
					scrollToFirstError={true}
					layout='vertical'
					grid
					dateFormatter='number'
					submitter={{
						render: () => (
							<FooterToolbar>
								<Button
									onClick={() =>
										history.push({ pathname: '/base_data/distributor', state: 'distributor' })
									}
									className='returnButton'>
									返回
								</Button>
								<Button
									onClick={() => form.submit()}
									type='primary'
									loading={loading}
									className='verifyButton'>
									确认操作
								</Button>
							</FooterToolbar>
						),
					}}>
					<Card
						bordered={false}
						className='mb6 distributormiddle'>
						<div className='row row-1'>
							<h3>{fields.distributor}基本信息</h3>
							<BaseInfo
								form={form}
								data={detail}
								submitPrefix={SUBMIT_CONFIG.BASE_INFO}
								// type="distributor"
							/>
						</div>

						<div className='row row-1'>
							<h3>营业执照</h3>
							<BusinessLicense
								bRef={bhildRef}
								form={form}
								setIsSuccessfully={setIsSuccessfully}
								data={businessLicense}
								submitPrefix={SUBMIT_CONFIG.BUSINESS_LICENSE}
								goodsCategory12={goodsCategory12}
								goodsCategory18={goodsCategory18}
								goodsCategory95={goodsCategory95}
								gspEnabled={global.gspEnabled}
							/>
						</div>
						{/* 药品环境不展示 */}
						{WEB_PLATFORM !== 'DS' && (
							<>
								<div className='row row-3'>
									<FormItem
										label='是否有经营许可证'
										initialValue={
											global.gspEnabled
												? detail.hasPermitLicense == false
													? false
													: true
												: isAdd
												? undefined
												: detail.hasPermitLicense
										}
										rules={[
											{ required: global.gspEnabled, message: `请输入${fields.distributor}名称` },
										]}
										name={`hasPermitLicense`}>
										<Radio.Group
											onChange={() => {
												setRefresh(true);
											}}>
											<Radio value={true}>是</Radio>
											<Radio value={false}>否</Radio>
										</Radio.Group>
									</FormItem>
									{form.getFieldValue('hasPermitLicense') == true && (
										<>
											<h3>医疗器械经营许可证</h3>
											<PermitLicense
												pRef={phildRef}
												form={form}
												setIsSuccessfully={setIsSuccessfully}
												data={permitLicense}
												submitPrefix={SUBMIT_CONFIG.PERMIT_LICENSE}
												goodsCategory12={goodsCategory12}
												goodsCategory18={goodsCategory18}
												type='distributor'
												gspEnabled={global.gspEnabled}
											/>
										</>
									)}
								</div>
								<Divider />
								<div className='row row-3'>
									<FormItem
										label='是否有二类备案'
										name='hasRecordLicense'
										initialValue={
											global.gspEnabled
												? detail.hasRecordLicense == false
													? false
													: true
												: isAdd
												? undefined
												: detail.hasRecordLicense
										}>
										<Radio.Group onChange={() => setRefresh(true)}>
											<Radio value={true}>是</Radio>
											<Radio value={false}>否</Radio>
										</Radio.Group>
									</FormItem>
									{form.getFieldValue('hasRecordLicense') === true && (
										<>
											<h3>第二类医疗器械备案凭证</h3>
											<RecordVoucher
												cRef={childRef}
												form={form}
												setIsSuccessfully={setIsSuccessfully}
												data={recordVoucher}
												submitPrefix={SUBMIT_CONFIG.RECORD_VOUCHER}
												goodsCategory12={goodsCategory12ba}
												goodsCategory18={goodsCategory18ba}
												gspEnabled={global.gspEnabled}
											/>
										</>
									)}
								</div>
								<div className='row row-3'>
									<h3>其它附件</h3>
									<OtherAttachments
										form={form}
										data={otherAttachments}
										aRef={attachmentsRef}
										type='otherAttachments'
										setIsSuccessfully={setIsSuccessfully}
									/>
								</div>
							</>
						)}
						<Divider />
					</Card>
				</ProForm>
			</div>
		</div>
	);
};

export default connect(({ global }: { global: Record<string, any> }) => ({ global }))(
	AddOrEditPage,
);
