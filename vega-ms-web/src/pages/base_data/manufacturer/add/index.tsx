import Breadcrumb from '@/components/Breadcrumb';
import FooterToolbar from '@/components/FooterToolbar';
import { getAllGoods12, getAllGoods18 } from '@/services/category';
import { add, edit, getDetail } from '@/services/manufacturer';
import { getAllGoods95 } from '@/services/std95GoodsCategory';
import { transformSBCtoDBC } from '@/utils';
import { notification } from '@/utils/ui';
import { Button, Card, Divider, Form, message, Radio } from 'antd';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { connect, history } from 'umi';
import BaseInfo from '../components/BaseInfo';
import BusinessLicense from '../components/BusinessLicense';
// 「经营许可」 有些字段不一样，所以单独拎出来
import PermitLicense from '../components/PermitLicense';
import OtherAttachments from '../../components/OtherAttachments';
import '../../components/OtherAttachments/style.less';
import { SUBMIT_CONFIG } from './config';
const FormItem = Form.Item;

const AddPage: React.FC<{}> = ({ global, match }: Record<string, any>) => {
	const [form] = Form.useForm();
	const { params } = match;
	// 判断当前是add模式还是edit模式
	const isAdd = params.id === undefined;
	// 编辑回显用到的 「公司基本信息」 数据
	const [detail, setDetail] = useState<ManufacturerController.DetailRecord>({});
	// 编辑回显用到的 「营业执照」 数据
	const businessLicense = detail.licenseManufacturerBusiness || {};
	// 编辑回显用到的 「生产许可」 数据
	const permitLicense = detail.licenseManufacturerPermit || {};

	const [loading, setLoading] = useState(false);
	//12版经营范围
	const [goodsCategory12, setGoodsCategory12] = useState<CategoryController.TypeData[]>([]);
	//98版经营范围
	const [goodsCategory18, setGoodsCategory18] = useState<CategoryController.TypeData[]>([]);
	//95版经营范围
	const [goodsCategory95, setGoodsCategory95] = useState<Std95GoodsCategoryController.TypeData[]>(
		[],
	);
	// 判断文件是否上传完成
	const [isSuccessfully, setIsSuccessfully] = useState(true);

	const phildRef = useRef<Record<string, any>>();
	const bhildRef = useRef<Record<string, any>>();
	const attachmentsRef = useRef<Record<string, any>>();
	const [refresh, setRefresh] = useState(false);
	const formatPostData = (
		values: ManufacturerController.BusinessLicense &
			ManufacturerController.Manufacturer &
			ManufacturerController.PermitLicense,
	) => {
		const target: ManufacturerController.AddData & ManufacturerController.Manufacturer = {};

		for (const key in values) {
			let value = values[key];
			const mainKey = key.split('&')[0];
			const subKey = key.split('&')[1];
			if (subKey === 'licenseTime' && value) {
				if (value[0]) {
					target[mainKey]['licenseBeginTime'] = moment(value[0]).valueOf();
				}

				if (value[1]) {
					target[mainKey]['licenseEndTime'] = moment(value[1]).valueOf();
				}
			}
			// 是否长期有效 的判断
			// 如果长期有效，则截止日期重置为null
			// if (key.includes('isLongTimeValid') && value === true) {
			//   const associatedKey = key.split('_')[1];
			//   target[mainKey] = { ...target[mainKey], [associatedKey]: null };
			// }

			// 「上传图片」处理
			if (Array.isArray(value)) {
				// 空数组的处理
				if (value.length === 0) {
					value = undefined;
				} else {
					// 有值的处理
					value = value.map((item) => {
						if (item && item.hasOwnProperty('uid')) {
							return item.response.data ? item.response.data.urlName : item.response;
						} else {
							return item;
						}
					});
				}
			}

			// 「日期」 「下拉框」 的处理
			if (typeof value === 'object' && value !== null) {
				const isDate = moment.isMoment(value);
				// const isUploadImg = value.hasOwnProperty('file') && value.hasOwnProperty('fileList');
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
		target.manufacturer!.hasPermitLicense = values.hasPermitLicense;
		target.manufacturer!.hasRecordLicense = values.hasRecordLicense;
		return target;
	};
	useEffect(() => {
		refresh && setTimeout(() => setRefresh(false));
	}, [refresh]);
	// 编辑模式下需要先拉取回显用的数据
	useEffect(() => {
		if (params.id) {
			queryPageDetail(params.id);
		}
	}, [params.id]);
	//列表请求
	const queryPageDetail = async (id: number) => {
		setLoading(true);
		try {
			const result = await getDetail(id);
			if (result.code === 0) {
				setDetail(result.data);
				form.resetFields();
			}
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		const getTypeList12 = async () => {
			const res = await getAllGoods12({});
			if (res && res.code == 0) {
				setGoodsCategory12(res.data);
			}
		};
		getTypeList12();
		const getTypeList18 = async () => {
			const res = await getAllGoods18({});
			if (res && res.code == 0) {
				setGoodsCategory18(res.data);
			}
		};
		getTypeList18();
		const getTypeList95 = async () => {
			const res = await getAllGoods95();
			if (res && res.code == 0) {
				setGoodsCategory95(res.data);
			}
		};
		getTypeList95();
	}, []);
	//查询
	const onFinish = async (
		values: ManufacturerController.BusinessLicense &
			ManufacturerController.Manufacturer &
			ManufacturerController.PermitLicense,
	) => {
		if (!isSuccessfully) {
			message.warning('请在文件上传完成后提交');
			return;
		}
		if (
			values['permitLicense&permitEndTime'] &&
			values['permitLicense&permitEndTime'].valueOf() < values['permitLicense&permitBeginTime'] &&
			values['permitLicense&permitBeginTime'].valueOf()
		) {
			notification.error('生产许可证截止日期不可小于生效日期');
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

		const scskFw = values.hasPermitLicense ? phildRef.current?.getVal() : {};
		const jyzzFw = bhildRef.current?.getVal();

		// 经过格式化之后的值
		const licenseImgList = {
			...formatPostData({ ...values, ...scskFw, ...jyzzFw }).businessLicense,
		}?.licenseImgList;
		const permitImgList = {
			...formatPostData({ ...values, ...scskFw, ...jyzzFw }).permitLicense,
		}?.permitImgList;
		let target = transformSBCtoDBC(formatPostData({ ...values, ...scskFw, ...jyzzFw }));
		//otherAttachments 为处理过后的数据
		let otherAttachments = {
			remark: undefined,
			otherAttachments: {
				remark: values.remark,
				attachments: attachmentsRef.current?.getVal(formatPostData({ ...values }).otherAttachments),
			},
		};
		target = {
			...target,
			businessLicense: {
				...target.businessLicense,
				endTimeIsNull:
					!target.businessLicense?.isLongTimeValid_licenseEndTime &&
					!target.businessLicense?.licenseEndTime,
				licenseImgList,
			},
			permitLicense: {
				...target.permitLicense,
				endTimeIsNull:
					!target.permitLicense?.isLongTimeValid_permitEndTime &&
					!target.permitLicense?.permitEndTime,
				permitImgList,
			},
			...otherAttachments,
		};
		// 提交的结果 boolean
		let result;
		setLoading(true);
		try {
			if (isAdd) {
				result = await add(target);
			} else {
				result = await edit(params.id, target);
			}
		} finally {
			setLoading(false);
		}
		if (result.code == 0) {
			history.push({ pathname: `/base_data/manufacturer`, state: 'manufacturer' });
		} else {
			notification.error(result.msg);
		}
	};

	return (
		<div className='handle-page'>
			<div className='handle-page-breadcrumb'>
				<Breadcrumb config={['', ['', '/base_data/manufacturer'], ``]} />
			</div>
			<div className='form_add'>
				<Form
					form={form}
					onFinish={onFinish}
					scrollToFirstError={true}
					layout={'vertical'}
					initialValues={{ layout: 'vertical' }}>
					<Card
						bordered={false}
						className='mb6 handle-page-card'>
						<div className='row row-1 '>
							<h3>公司基本信息</h3>
							<BaseInfo
								form={form}
								data={detail}
								submitPrefix={SUBMIT_CONFIG.BASE_INFO}
								type='manufacturer'
							/>
						</div>

						<div className='row row-1'>
							<h3>营业执照</h3>
							<BusinessLicense
								bRef={bhildRef}
								form={form}
								setIsSuccessfully={setIsSuccessfully}
								data={businessLicense || {}}
								submitPrefix={SUBMIT_CONFIG.BUSINESS_LICENSE}
								goodsCategory12={goodsCategory12}
								goodsCategory18={goodsCategory18}
								goodsCategory95={goodsCategory95}
								gspEnabled={global.gspEnabled}
							/>
						</div>
						<div className='row row-3'>
							<FormItem
								label='是否有生产许可证'
								initialValue={
									global.gspEnabled
										? detail.hasPermitLicense == false
											? false
											: true
										: isAdd
										? undefined
										: detail.hasPermitLicense
								}
								rules={[{ required: global.gspEnabled, message: '请选择是否有生产许可证' }]}
								name={`hasPermitLicense`}>
								<Radio.Group onChange={() => setRefresh(true)}>
									<Radio value={true}>是</Radio>
									<Radio value={false}>否</Radio>
								</Radio.Group>
							</FormItem>
							{form.getFieldValue('hasPermitLicense') == true && (
								<>
									<h3>生产许可证</h3>
									<PermitLicense
										pRef={phildRef}
										form={form}
										setIsSuccessfully={setIsSuccessfully}
										data={permitLicense}
										submitPrefix={SUBMIT_CONFIG.PERMIT_LICENSE}
										goodsCategory12={goodsCategory12}
										goodsCategory18={goodsCategory18}
										type='manufacturer'
										gspEnabled={global.gspEnabled}
									/>
								</>
							)}
							<>
								<h3>其它附件</h3>
								<OtherAttachments
									form={form}
									data={detail.otherAttachments}
									aRef={attachmentsRef}
									type='otherAttachments'
									setIsSuccessfully={setIsSuccessfully}
								/>
							</>
						</div>
						<Divider />
					</Card>

					<FooterToolbar>
						<Button
							onClick={() => {
								history.push({ pathname: '/base_data/manufacturer', state: 'manufacturer' });
							}}
							className='returnButton'>
							返回
						</Button>
						<Button
							onClick={() => {
								form.submit();
							}}
							loading={loading}
							type='primary'
							className='verifyButton'>
							确认操作
						</Button>
					</FooterToolbar>
				</Form>
			</div>
		</div>
	);
};

export default connect(({ global }: { global: Record<string, any> }) => ({ global }))(AddPage);
