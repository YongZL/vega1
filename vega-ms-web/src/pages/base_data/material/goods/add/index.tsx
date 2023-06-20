import type { ProFormColumns, ProFormValueType } from '@/components/SchemaForm';
import type { ProFormColumnsType } from '@ant-design/pro-form/es/components/SchemaForm';
import type { DefaultOptionType } from 'antd/es/cascader';
import type { CheckboxOptionType } from 'antd/es/checkbox';
import type { Rule } from 'antd/es/form';
import type { RadioChangeEvent } from 'antd/es/radio';
import type { UploadChangeParam } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import type { FC } from 'react';
import type { match as Match } from 'react-router';

import Breadcrumb from '@/components/Breadcrumb';
import FooterToolbar from '@/components/FooterToolbar';
import SchemaForm from '@/components/SchemaForm';
import BatchUpLoadFile from '@/components/UpLoadFile';
import {
	antiEpidemicType,
	goodsCategoryTypes,
	isHightValue,
	limitType as limitTypeOptions,
	yesOrNo,
} from '@/constants/dictionary';
import { colItem3, searchFormItem6 } from '@/constants/formLayout';
import { getAllCategory12, getAllCategory18 } from '@/services/category';
import { getList as getTermOfValidity } from '@/services/config';
import { addGoods, editGoods } from '@/services/goodsTypes';
import { getAllManufacturers } from '@/services/manufacturer';
import { getDetail as getGoodsDetail } from '@/services/newGoodsTypes';
import { getAllCategory95 } from '@/services/std95GoodsCategory';
import { uploadFileApi } from '@/services/upload';
import { transformSBCtoDBC } from '@/utils';
import { convertImageUrl } from '@/utils/file/image';
import {
	convertPriceWithDecimal,
	formatManySpaceBarToOne,
	formatValuesSpaceToOneOfMap,
	submitPrice,
} from '@/utils/format';
import { notification } from '@/utils/ui';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import ProForm from '@ant-design/pro-form';
import {
	Button,
	Card,
	Cascader,
	Checkbox,
	Col,
	DatePicker,
	Divider,
	Form,
	Input,
	InputNumber,
	Radio,
	Row,
	Select,
	Spin,
} from 'antd';
const { RangePicker } = DatePicker;
import { cloneDeep } from 'lodash';
import moment from 'moment';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { connect, history, useModel } from 'umi';
import { formLayoutItem, formListLayout, validateProcurementPrice } from './config';
import style from './index.less';
import OtherAttachments from '../../../components/OtherAttachments';
import '../../../components/OtherAttachments/style.less';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

type GoodsRecord = NewGoodsTypesController.GoodsRecord;
type TypeData = CategoryController.TypeData & { name?: string };
type ProColumn = ProFormColumnsType<Record<string, any>, ProFormValueType>;

const AddPage: FC<{
	global: Record<string, any>;
	match: Match<{ id?: string }>;
	handleType: 'copy' | 'edit' | 'add';
}> = (props) => {
	const {
		loading: fieldLoading,
		fieldsMap,
		extendedFields,
		getGoodsFieldList,
	} = useModel('goodsField');
	const { fields } = useModel('fieldsMapping');
	const [handleType] = useState<string>(props.handleType || 'add');
	const [dictionary] = useState<Record<string, Record<string, any>[]>>(
		JSON.parse(sessionStorage.getItem('dictionary') || '{}'),
	);
	const [fieldNames] = useState<string[]>([
		'name',
		'pmCode',
		'specification',
		'materialCategory',
		'commonName',
		'model',
		'manufacturerId',
		'limitType',
		'brand',
		'chargeNum',
		'nationalNo',
		'minGoodsNum',
		'largeBoxNum',
		'antiEpidemic',
		'procurementPrice',
		'isHighValue',
		'isImplantation',
		'stageType',
		'isBarcodeControlled',
		'isConsumableMaterial',
		'category',
		'description',
		'nearExpirationDays',
		'lowTemperature',
		'highTemperature',
		'categoryType',

		'goodsImg',
	]);

	const [requiredFieldNames] = useState<string[]>([
		'name',
		'manufacturerId',
		'specification',
		'procurementPrice',
		'materialCategory',
		// 'isHighValue',
		'stageType',
		'isImplantation',
		'isBarcodeControlled',
		'isConsumableMaterial',
	]);
	const [newDictionary] = useState<Record<string, Record<string, any>[]>>(
		JSON.parse(sessionStorage.getItem('newDictionary') || '{}'),
	);
	const [unitTypeOptions] = useState<CheckboxOptionType[]>(
		(dictionary.unit_type || []).map((item) => ({
			...item,
			label: item.text,
		})) as CheckboxOptionType[],
	);
	const [submitLoading, setSubmitLoading] = useState<boolean>(false);
	const [isConsumableMaterial, setIsConsumableMaterial] = useState<boolean>(false);
	// 用来控制是否显示重点品种，true-显示，false-不显示
	const [isBarcodeControlled, setIsBarcodeControlled] = useState<boolean>(false);
	const [isHighValue, setIsHighValue] = useState<boolean | undefined>();
	const [implantation, setImplantation] = useState<boolean>(false);
	const [requiredLimit, setRequiredLimit] = useState<boolean>(false);
	const [requiredTemperature, setRequiredTemperature] = useState<boolean>(false);
	const [num, setNum] = useState(0);
	const [clickVal, setClickVal] = useState('');
	const [isCopy, setIsCopy] = useState(true);
	const [minGoods, setMinGoods] = useState<boolean>(false);
	const [treeData, setTreeData] = useState<DefaultOptionType[]>([]);
	const [registrationList, setRegistrationList] = useState<GoodsRecord['registrationList']>([
		{
			registrationBeginDate: undefined,
			registrationEndDate: undefined,
			registrationImg: '',
			registrationNum: '',
			registrationDate: false,
			endTimeIsNull: true,
		},
	]);
	const [goodsCategory12, setGoodsCategory12] = useState<TypeData[]>([]);
	const [goodsCategory18, setGoodsCategory18] = useState<TypeData[]>([]);
	const [goodsCategory95, setGoodsCategory95] = useState<TypeData[]>([]);
	const [manufacturers, setManufacturers] = useState<
		ManufacturerAuthorizationsController.GetManufacturer[]
	>([]);
	const [detail, setDetail] = useState<Partial<GoodsRecord>>({});
	const [form] = Form.useForm();
	// 判断文件是否上传完成
	const [isSuccessfully, setIsSuccessfully] = useState(true);
	const [systemType] = useState<string>(sessionStorage.getItem('systemType') || 'Insight_MS'); // 默认为核心
	const gspEnabled = props.global.gspEnabled; // gsp配置
	const [isChoose, setIsChoose] = useState<boolean | undefined>(false);
	const getFieldLabel = useCallback(
		(fieldKey: string, text: string) => {
			const field = fieldsMap[fieldKey];
			return field ? field.displayFieldLabel || text : text;
		},
		[fieldsMap],
	);
	const attachmentsRef = useRef<Record<string, any>>();
	const [attachmentsData, setAttachmentsData] = useState();
	const regList = () => {
		let res = true;
		registrationList.forEach((item) => {
			if (
				item.registrationEndDate &&
				item.registrationEndDate < (item.registrationBeginDate as number)
			) {
				notification.warning(
					`${getFieldLabel('registrationList', '注册证')}${
						item.registrationNum
					}生效时间要小于失效时间`,
				);
				res = false;
			}
		});
		return res;
	};

	const getTermOfValidityData = async () => {
		const params = { module: 'system', feature: 'goods', name: 'near_expiration_days' };
		const res = await getTermOfValidity(params);
		if (res && res.data && res.data.length) {
			form.setFieldsValue({ nearExpirationDays: res.data[0].value || 180 });
		}
	};

	//获取其它附件数据
	const getOtherAttachments = (values: Record<string, any>) => {
		let target = { otherAttachments: '' };
		for (const key in values) {
			let value = values[key];
			const mainKey = key.split('&')[0];
			const subKey = key.split('&')[1];

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
			target[mainKey] = { ...target[mainKey], [subKey]: value };
		}
		return target.otherAttachments;
	};

	// 提交
	const handleSubmit = (val: string) => {
		setClickVal(val);
		if (!isSuccessfully) {
			notification.warning('文件上传中');
			return;
		}
		if (!regList()) return;

		form.validateFields().then(async (values) => {
			// 规格和型号 去除前后空格，中间多个空格合并一个
			values = formatValuesSpaceToOneOfMap(values, ['specification', 'model']);

			let otherAttachments = {
				remark: undefined,
				otherAttachments: {
					attachments: attachmentsRef.current?.getVal(getOtherAttachments(values)),
					remark: values.remark,
				},
			};
			const goodsImgValue = (values.goodsImg || []).map(
				(item: any) => item?.response?.data?.urlName || item?.response,
			);
			values.procurementPrice = submitPrice(values.procurementPrice);
			const registrations =
				!fieldsMap.isConsumableMaterial.enabled || values.isConsumableMaterial
					? registrationList.map((item) => {
							delete item.registrationImg;
							return {
								...item,
								endTimeIsNull: !item.registrationDate && !item.registrationEndDate,
							};
					  })
					: [];
			if (Number(values.lowTemperature) > Number(values.highTemperature)) {
				notification.warning(
					`${getFieldLabel('lowTemperature', '最低温度')}不可大于${getFieldLabel(
						'highTemperature',
						'最高温度',
					)}`,
				);
				return;
			}
			if (!values.limitPerMonth) values.limitType = '';

			// 扩展字段处理
			const goodsExtendedAttrMap: Record<string, any> = {};
			Object.keys(values).forEach((k) => {
				if (k.startsWith('goodsExtendedAttrMap.')) {
					const ck = k.split('.')[1];
					if (fieldsMap[k].displayFieldType === 'Date') {
						goodsExtendedAttrMap[ck] = values[k]
							? moment(values[k], 'YYYY-MM-DD 00:00:00').valueOf()
							: undefined;
					} else if (values[k] !== null) {
						goodsExtendedAttrMap[ck] = values[k];
					}
					delete values[k];
				}
			});

			values.goodsExtendedAttrMap = goodsExtendedAttrMap;

			const key = values.isConsumableMaterial
				? values.categoryType == '18'
					? 'std2018GoodsCategoryId'
					: 'std2012GoodsCategoryId'
				: 'std95GoodsCategoryId';
			values[key] = values.category && values.category[values.category.length - 1];
			for (const k in values) {
				if (k.includes('_')) delete values[k];
			}
			values.minGoodsUnitId = minGoods ? values.moreMinGoodsUnitId : values.minGoodsUnitId;
			// 试剂类型设置默认为非跟台类别和否植/介入物
			if (systemType === 'Insight_RS') {
				values.isImplantation = false;
				values.stageType = false;
			}
			if (values.diCode) {
				values.diCode = values.diCode.trim();
			}
			//药品环境时 跟台类别、条码管控、医疗器械、植/介入物默认为false
			if (systemType === 'Insight_DS') {
				values.stageType = false;
				values.isImplantation = false;
				values.isBarcodeControlled = false;
				values.isConsumableMaterial = false;
			}
			if (handleType === 'edit') {
				const chargeNum = transformSBCtoDBC(values).chargeNum;
				const nationalNo = transformSBCtoDBC(values).nationalNo;
				values.id = props.match.params.id;
				setSubmitLoading(true);
				const params = {
					...transformSBCtoDBC(values),
					chargeNum: !chargeNum ? chargeNum : chargeNum.replace(/(^\s*)|(\s*$)/g, ''),
					nationalNo: !nationalNo ? nationalNo : nationalNo.replace(/(^\s*)|(\s*$)/g, ''),
					imgUrlList: values.goodsImg ? goodsImgValue : '',
					registrationList: registrations,
					lastName: detail.name,
					lastSpecification: detail.specification,
					lastManufacturerId: detail.manufacturerId,
					lastChargeNum: detail.chargeNum,
					lastProcurementPrice: detail.procurementPrice,
					lastMinGoodsNum: detail.minGoodsNum,
					lastMinGoodsUnitId: detail.minGoodsUnitId,
					lastPurchaseGoodsUnitId: detail.purchaseGoodsUnitId,
					lastIsHighValue: detail.isHighValue,
					lastIsBarcodeControlled: detail.isBarcodeControlled,
					lastRegistrationEndDate:
						detail.registrationList && detail.registrationList.length > 0
							? detail.registrationList[0].registrationEndDate
							: '',
					...otherAttachments,
				};
				delete params.goodsImg;
				const res = await editGoods(params);
				if (res && res.code === 0) {
					notification.success('编辑成功！');
					history.push({ pathname: `/base_data/new_goods`, state: 'goods' });
				}
			} else if ((handleType === 'add' || handleType === 'copy') && val === 'save') {
				const registrationList = (registrations || []).map((item) => {
					delete item.id;
					delete item.goodsId;
					return item;
				});
				setSubmitLoading(true);
				const params = {
					...transformSBCtoDBC(values),
					imgUrlList: values.goodsImg ? goodsImgValue : '',
					registrationList,
					chargeNum: !transformSBCtoDBC(values).chargeNum
						? transformSBCtoDBC(values).chargeNum
						: transformSBCtoDBC(values).chargeNum.replace(/(^\s*)|(\s*$)/g, ''),
					nationalNo: !transformSBCtoDBC(values).nationalNo
						? transformSBCtoDBC(values).nationalNo
						: transformSBCtoDBC(values).nationalNo.replace(/(^\s*)|(\s*$)/g, ''),
					...otherAttachments,
				};
				delete params.goodsImg;
				const res = await addGoods(params);
				if (res && res.code === 0) {
					notification.success('新增成功！');
					history.push(`/base_data/new_goods`);
				}
			} else if ((handleType === 'copy' || handleType === 'add') && val === 'copy') {
				const registrationList = (registrations || []).map((item) => {
					delete item.id;
					delete item.goodsId;
					return item;
				});
				setSubmitLoading(true);
				const params = {
					...transformSBCtoDBC(values),
					imgUrlList: values.goodsImg ? goodsImgValue : '',
					registrationList,
					chargeNum: transformSBCtoDBC(values).chargeNum
						? transformSBCtoDBC(values).chargeNum.replace(/(^\s*)|(\s*$)/g, '')
						: transformSBCtoDBC(values).chargeNum,
					nationalNo: transformSBCtoDBC(values).nationalNo
						? transformSBCtoDBC(values).nationalNo.replace(/(^\s*)|(\s*$)/g, '')
						: transformSBCtoDBC(values).nationalNo,
					...otherAttachments,
				};
				delete params.goodsImg;
				const res = await addGoods(params);
				values.copy = true;
				if (res && res.code === 0) {
					notification.success('新增成功！');
					// 由于diCode不允许重复，所在如果是新增或者复制的时候如果是点击保存并复制则重置diCode
					form.resetFields(['diCode']);
					setNum(num + 1);
				}
			}
			setSubmitLoading(false);
		});
	};

	const getCascaderData = (data: TypeData[] = [], type: string): DefaultOptionType[] => {
		return data.map((o) => ({
			label: type == '95' ? o.name : o.code,
			key: o.id,
			value: o.id,
			...(o.children && o.children.length > 0
				? { children: getCascaderData(o.children as TypeData[], type) }
				: {}),
		}));
	};

	// 获取基础物资分类列表
	const getGoodsCategory = async (type: string) => {
		let list: TypeData[] = [];
		if (type === '12') {
			list = cloneDeep(goodsCategory12);
		} else if (type === '18') {
			list = cloneDeep(goodsCategory18);
		} else {
			list = cloneDeep(goodsCategory95);
		}
		if (list.length > 0) {
			const data = getCascaderData(list, type);
			setTreeData(data);
			return;
		}
		const api =
			type === '12' ? getAllCategory12 : type === '18' ? getAllCategory18 : getAllCategory95;
		const res = await api();
		if (res && res.code === 0) {
			const { data } = res;
			const treeData = getCascaderData(data, type);
			setTreeData(treeData);
			// 缓存数据，不用每次切换类型都重新请求
			if (type === '12') {
				setGoodsCategory12(data);
			} else if (type === '18') {
				setGoodsCategory18(data);
			} else {
				setGoodsCategory95(data);
			}
		}
	};

	const resetCategoryList = (val: string) => {
		form.setFieldsValue({
			category: [],
		});
		getGoodsCategory(val);
	};

	// 输入注册证信息
	const handleChange = (index: number, value: any, key: string) => {
		const regList = cloneDeep(registrationList);
		if (key === 'registrationBeginDate') {
			regList[index]['registrationBeginDate'] =
				value[0] && moment(value[0], 'YYYY-MM-DD 00:00:00').valueOf();
			regList[index]['registrationEndDate'] =
				value[1] && moment(value[1], 'YYYY-MM-DD 00:00:00').valueOf();
			setRegistrationList(regList);
			return;
		}
		if (key === 'registrationDate') {
			regList[index][key] = value;
			regList[index].registrationEndDate = undefined;
			setRegistrationList(regList);
			return;
		}
		regList[index][key] = value;
		setRegistrationList(regList);
	};

	/** 上传图片回调 */
	const handleImageChange = (name: string, info: UploadChangeParam<UploadFile>, index: number) => {
		const { file = {}, fileList = [] }: any = info;
		const status = file.status;
		const regList = cloneDeep(registrationList);
		const responseData = (fileList || []).map(
			(item: any) => item?.response?.data?.urlName || item?.response,
		);
		// 上传完成
		if (status === 'done') {
			if (typeof file.response === 'object') {
				if (file.response.code === 0) {
					regList[index]['registrationImgList'] = responseData;
					setRegistrationList(regList);
				}
			} else {
				regList[index]['registrationImgList'] = file.response;
				setRegistrationList(regList);
			}
		}
		// 删除完成
		if (status === 'removed') {
			regList[index]['registrationImgList'] = responseData;
			setRegistrationList(regList);
		}
	};

	// 新增注册证件
	const addRegistration = () => {
		const list = cloneDeep(registrationList);
		list.push({
			registrationBeginDate: undefined,
			registrationEndDate: undefined,
			registrationImg: '',
			registrationNum: '',
			registrationDate: false,
		});
		setRegistrationList(list);
	};

	// 删除注册证
	const deleteRegistration = (index: number) => {
		registrationList.splice(index, 1);
		setRegistrationList([...registrationList]);
	};

	const setDefaultCopyName = () => {
		const name = form.getFieldsValue().name;
		form.setFieldsValue({
			name: handleType === 'copy' || clickVal === 'copy' ? '复制-' + name : name,
		});
	};

	// 详情
	const getDetailInfo = async () => {
		if (isCopy) {
			if (props.match.params.id) {
				const res = await getGoodsDetail(props.match.params.id);
				const copy = '复制-';
				if (res && res.code === 0) {
					const { data } = res;
					setAttachmentsData(data.otherAttachments);
					const { isConsumableMaterial: isConsumable, extendedAttrValues } = data;
					const categoryType = isConsumable ? (data.std2012GoodsCategoryId ? '12' : '18') : '95';
					setIsChoose(data?.stageType);
					const values: Record<string, any> = {};
					fieldNames.forEach((key) => {
						const val = data[key];
						if (key === 'name') {
							values[key] = `${handleType === 'copy' ? copy : ''}${val}`;
						} else if (key === 'procurementPrice') {
							values[key] = val || val === 0 ? convertPriceWithDecimal(val) : '';
						} else if (key === 'category') {
							values[key] =
								data.std2012GoodsCategoryIds ||
								data.std2018GoodsCategoryIds ||
								data.std95GoodsCategoryIds;
						} else if (key === 'categoryType') {
							values[key] = categoryType;
						} else if (key === 'nearExpirationDays') {
							values[key] = `${val || ''}`;
						} else if (key === 'goodsImg') {
							const imgData: any = (data.imgUrlList || []).map((item, index) => {
								const file = convertImageUrl(item || '')[0] || {};
								file.uid = String(Date.now() + index);
								file.key = String(Date.now() + index);
								return file;
							});
							values[key] = imgData;
						} else if (val !== null) {
							values[key] = val;
						}
					});

					if (extendedAttrValues && extendedAttrValues.length > 0) {
						extendedAttrValues.forEach((attr) => {
							const field = fieldsMap[attr.fieldName as string];
							// 处理启用的扩展字段的数据回填
							if (field && field.enabled) {
								if (attr.fieldType === 'Date') {
									const v = attr.fieldValue ? Number(attr.fieldValue) : undefined;
									values[attr.fieldName as string] = v && v > 0 ? moment(v) : undefined;
								} else if (attr.fieldType === 'Boolean') {
									values[attr.fieldName as string] = attr.fieldValue === 'true';
								} else if (attr.fieldValue !== null) {
									values[attr.fieldName as string] = attr.fieldValue;
								}
							}
						});
					}
					// 给布尔类型设置默认值false
					if (extendedFields && extendedFields?.length > 0) {
						extendedFields.forEach((item) => {
							if (item.enabled && item.displayFieldType === 'Boolean') {
								if (typeof values[item.displayFieldKey as string] !== 'boolean') {
									values[item.displayFieldKey as string] = false;
								}
							}
						});
					}
					const unitTypeList = unitTypeOptions.slice(0, 6);
					const minGoodsUnitId = `${data.minGoodsUnitId || ''}`;
					// 计价单位
					const isLeftUnit = unitTypeList.some((item) => item.value === minGoodsUnitId);
					values.minGoodsUnitId = isLeftUnit ? minGoodsUnitId : 'more';
					setMinGoods(!isLeftUnit);
					if (!isLeftUnit) {
						values.moreMinGoodsUnitId = minGoodsUnitId;
					}
					// 中箱包装
					values.purchaseGoodsUnitId = `${data.purchaseGoodsUnitId || ''}`;
					values.largeBoxUnitId = `${data.largeBoxUnitId || ''}`;
					if (fieldsMap.isConsumableMaterial.enabled) {
						setIsConsumableMaterial(isConsumable as boolean);
					} else {
						setIsConsumableMaterial(true);
					}
					handleTemperatureRequired(data.materialCategory);
					// 获取分类
					getGoodsCategory(categoryType);
					if (!fieldsMap.isConsumableMaterial.enabled || isConsumable) {
						const regList = (data.registrationList || []).map((item, index) => {
							const imgData: any = (item.registrationImgList || []).map((item, index) => {
								const file = convertImageUrl(item || '')[0];
								file.uid = String(Date.now() + index);
								file.key = String(Date.now() + index);
								return file;
							});
							values[`registrationNum_${index}`] = item.registrationNum;
							values[`registrationBeginDate_${index}`] = [
								item.registrationBeginDate ? moment(item.registrationBeginDate) : '',
								item.registrationEndDate ? moment(item.registrationEndDate) : '',
							];
							// values[`registrationEndDate_${index}`] = item.registrationEndDate
							//   ? moment(item.registrationEndDate)
							//   : '';
							values[`registrationImg_${index}`] = imgData;
							values[`registrationDate_${index}`] =
								!item.endTimeIsNull && !item.registrationEndDate;
							return {
								...item,
								registrationDate: !item.endTimeIsNull && !item.registrationEndDate,
							};
						});
						setRegistrationList(regList);
					}
					if (fieldsMap.limitPerMonth && fieldsMap.limitPerMonth.enabled) {
						values.limitPerMonth = data.limitPerMonth || '';
					}
					setIsBarcodeControlled(Boolean(res.data.isBarcodeControlled));
					// 如果是条码管控则设置重点品种的值
					if (res.data.isBarcodeControlled && typeof res.data.keyItem === 'boolean') {
						values.keyItem = res.data.keyItem;
					}
					if (typeof res.data.isHighValue === 'boolean') {
						setIsHighValue(res.data.isHighValue);
					}
					// diCode绑定后不允许修改，所以修改的时候设置展示的值。diCode不允许重复，复制的时候不设置
					if (res.data.diCode && handleType === 'edit') {
						values.diCode = res.data.diCode;
					}
					setTimeout(() => {
						form.setFieldsValue(values);
					}, 50);
					setDetail(res.data);
					setImplantation((data.isImplantation || data.stageType) as boolean);
				} else {
					setDefaultCopyName();
				}
			} else {
				setDefaultCopyName();
			}
			setIsCopy(false);
		} else {
			setDefaultCopyName();
		}
	};

	// 生产厂家
	const getManufacturersList = async () => {
		const res = await getAllManufacturers();
		if (res && res.code === 0) {
			setManufacturers(res.data);
		}
	};
	const selectRequired = () => {
		const limit = form.getFieldValue('limitType') || form.getFieldValue('limitPerMonth');
		setRequiredLimit(limit);
		if (!limit) {
			form.resetFields(['limitType', 'limitPerMonth']);
		}
	};
	const handleTemperatureRequired = (val?: string) => {
		if (!val) {
			setRequiredTemperature(false);
			return;
		}
		const result = (newDictionary.reagent_category || []).map((item) => item.value).includes(val);
		setRequiredTemperature(result);
	};

	useEffect(() => {
		if (!fieldLoading) {
			if (handleType === 'add' && !clickVal) {
				form.setFieldsValue({
					isConsumableMaterial: true,
					stageType: false,
					categoryType: '12',
				});
				getTermOfValidityData();
				setIsConsumableMaterial(true);
				resetCategoryList('12');
			}
			if (handleType === 'add' && extendedFields && extendedFields?.length > 0) {
				const values: Record<string, any> = {};
				extendedFields.forEach((item) => {
					if (item.displayFieldType === 'Boolean') {
						values[item.displayFieldKey as string] = false;
					}
				});

				form.setFieldsValue(values);
			}
			if (handleType === 'edit') {
				getDetailInfo();
			}
			if (handleType === 'copy' || num) {
				getDetailInfo();
			}
		}
	}, [handleType, num, fieldLoading]);

	useEffect(() => {
		getManufacturersList();
		getGoodsFieldList();
	}, []);

	useEffect(() => {
		// 如果条码管控值变了之后则重置条码管控的值
		form.resetFields(['keyItem']);
	}, [isBarcodeControlled]);

	const validate = (_rule: any, value: string) => {
		const reg = /^-?\d*(\.\d{1,2})?$/;
		if (value && !reg.test(value)) {
			return Promise.reject('请输入正确数值');
		}
		if (Number(value) > 999.99) {
			return Promise.reject('最大值为999.99');
		}
		if (Number(value) < -273.15) {
			return Promise.reject('最小值为-273.15');
		}
		return Promise.resolve();
	};

	const rules: Record<string, Rule[]> = {
		name: [{ required: true, message: `请输入${getFieldLabel('name', `${fields.goodsName}`)}` }],
		manufacturerId: [
			{ required: true, message: `请选择${getFieldLabel('manufacturerId', '生产厂家')}` },
		],
		specification: [{ required: true, message: `请输入${getFieldLabel('specification', '规格')}` }],
		procurementPrice: [
			{ required: true, message: `请输入${getFieldLabel('name', 'procurementPrice')}` },
			{ validator: validateProcurementPrice },
		],
		limitType: [
			{ required: requiredLimit, message: `请选择${getFieldLabel('limitType', '限制类型')}` },
		],
		limitPerMonth: [
			{ required: requiredLimit, message: `请输入${getFieldLabel('limitPerMonth', '每月限制')}` },
		],
		materialCategory: [
			{
				required: true,
				message: `请选择${getFieldLabel('materialCategory', `${fields.goodsType}`)}`,
			},
		],
		stageType: [
			{
				required: systemType === 'Insight_MS',
				message: `请选择${getFieldLabel('stageType', '跟台类别')}`,
			},
		],
		isImplantation: [
			{
				required: systemType === 'Insight_MS',
				message: `请选择${getFieldLabel('isImplantation', '是否植/介入物')}`,
			},
		],
		isBarcodeControlled: [
			{ required: true, message: `请选择${getFieldLabel('isBarcodeControlled', '是否条码管控')}` },
		],
		keyItem: [
			{ required: isBarcodeControlled, message: `请选择${getFieldLabel('keyItem', '重点品种')}` },
		],
		isConsumableMaterial: [
			{ required: true, message: `请选择${getFieldLabel('isConsumableMaterial', '是否医疗器械')}` },
		],
	};

	const columns: ProFormColumns = [
		{
			title: fields.goodsName,
			dataIndex: 'name',
			colProps: colItem3,
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: '通用名称',
			dataIndex: 'commonName',
			colProps: colItem3,
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: fields.primaryCode,
			dataIndex: 'pmCode',
			colProps: colItem3,
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerId',
			valueType: 'select',
			colProps: colItem3,
			fieldProps: {
				optionFilterProp: 'children',
				filterOption: (input, option) =>
					(option?.companyName as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0,
				options: manufacturers || [],
				showSearch: true,
				fieldNames: {
					label: 'companyName',
					value: 'id',
				},
			},
		},
		{
			title: '品牌',
			dataIndex: 'brand',
			colProps: colItem3,
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			colProps: colItem3,
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: '规格',
			dataIndex: 'specification',
			colProps: colItem3,
			fieldProps: {
				maxLength: 100,
				onChange: (e: any) => {
					const val = formatManySpaceBarToOne(e.target.value);
					form.setFieldsValue({ specification: val });
				},
			},
		},
		{
			title: '型号',
			dataIndex: 'model',
			colProps: colItem3,
			fieldProps: {
				maxLength: 100,
				onChange: (e: any) => {
					const val = formatManySpaceBarToOne(e.target.value);
					form.setFieldsValue({ model: val });
				},
			},
		},
		{
			title: '含税单价',
			dataIndex: 'procurementPrice',
			colProps: colItem3,
			fieldProps: {
				placeholder: `请输入${getFieldLabel('procurementPrice', '单价')}`,
				maxLength: 30,
				style: { width: '100%', marginRight: 10 },
				prefix: '￥',
				suffix: '元',
			},
		},
		{
			title: '限制类型',
			dataIndex: 'limitType',
			valueType: 'select',
			colProps: colItem3,
			fieldProps: {
				optionFilterProp: 'children',
				allowClear: true,
				placeholder: `请选择${getFieldLabel('limitType', '限制类型')}`,
				onChange: selectRequired,
				options: limitTypeOptions,
			},
		},
		{
			title: '每月限制',
			dataIndex: 'limitPerMonth',
			valueType: 'inputUnit',
			colProps: colItem3,
			fieldProps: {
				unit: '计价单位',
				min: 0,
				max: 999999,
				allowClear: true,
				onChange: selectRequired,
			},
		},
		{
			title: '近效期',
			dataIndex: 'nearExpirationDays',
			valueType: 'inputUnit',
			colProps: colItem3,
			fieldProps: {
				unit: '天',
				max: 999999,
				allowClear: true,
			},
		},
		{
			title: fields.antiEpidemic,
			dataIndex: 'antiEpidemic',
			valueType: 'select',
			colProps: colItem3,
			fieldProps: {
				optionFilterProp: 'children',
				allowClear: true,
				placeholder: `请选择${getFieldLabel('antiEpidemic', `${fields.antiEpidemic}`)}`,
				options: antiEpidemicType,
			},
		},
		{
			title: fields.goodsType,
			dataIndex: 'materialCategory',
			valueType: 'select',
			colProps: colItem3,
			fieldProps: {
				allowClear: true,
				placeholder: `请选择${getFieldLabel('materialCategory', `${fields.goodsType}`)}`,
				onChange: handleTemperatureRequired,
				options: newDictionary.material_category || [],
				fieldNames: {
					label: 'name',
					value: 'value',
				},
			},
		},
		{
			title: '国家医保编码',
			dataIndex: 'nationalNo',
			colProps: colItem3,
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: 'DI',
			dataIndex: 'diCode',
			colProps: colItem3,
			fieldProps: {
				// 编辑的时候如果存在diCode则不能修改
				readOnly: !!detail.diCode && handleType !== 'copy',
			},
		},
		{
			title: getFieldLabel('goodsImg', `${fields.goods}图片`),
			colProps: colItem3,
			key: 'goodsImg',
			hideInForm: !fieldsMap.goodsImg || (fieldsMap.goodsImg && !fieldsMap.goodsImg.enabled),
			formItemProps: {
				style: { marginBottom: 0 },
			},
			renderFormItem: () => (
				<>
					<BatchUpLoadFile
						required={false}
						form={form}
						uploadApi={uploadFileApi}
						label=''
						setIsSuccessfully={setIsSuccessfully}
						btnTxt={`上传${getFieldLabel('goodsImg', `${fields.goods}图片`)}`}
						formName='goodsImg'
					/>
				</>
			),
		},
		{
			valueType: 'group',
			key: 'lowTemperature',
			hideInForm: !requiredTemperature,
			columns: [
				{
					title: '存放温度',
					formItemProps: {
						required: true,
						style: { marginBottom: 0 },
					},
					colProps: colItem3,
					renderFormItem: () => (
						<div style={{ display: 'flex' }}>
							<Input.Group compact>
								<FormItem
									name='lowTemperature'
									rules={[{ required: true, message: '请输入' }, { validator: validate }]}
									style={{ width: '45%' }}>
									<Input
										maxLength={7}
										suffix='℃'
										placeholder={getFieldLabel('lowTemperature', '最低温度')}
									/>
								</FormItem>
								<span style={{ width: '10%', textAlign: 'center', lineHeight: '30px' }}>~</span>
								<FormItem
									name='highTemperature'
									rules={[{ required: true, message: '请输入' }, { validator: validate }]}
									style={{ width: '45%' }}>
									<Input
										maxLength={7}
										suffix='℃'
										placeholder={getFieldLabel('highTemperature', '最高温度')}
									/>
								</FormItem>
							</Input.Group>
						</div>
					),
				},
			],
		},
		{
			valueType: 'group',
			key: 'minGoodsUnitId',
			columns: [
				{
					title: getFieldLabel('minGoodsUnitId', '计价单位'),
					formItemProps: {
						required: true,
						style: { marginBottom: 0 },
					},
					renderFormItem: () => (
						<div style={{ display: 'flex' }}>
							<FormItem
								name='minGoodsUnitId'
								rules={[{ required: true, message: '请选择计价单位' }]}
								wrapperCol={{ style: { alignItems: 'center' } }}>
								<RadioGroup
									name='radiogroup'
									onChange={(e) => setMinGoods(e.target.value === 'more')}
									options={unitTypeOptions.slice(0, 6).concat([{ label: '更多', value: 'more' }])}
								/>
							</FormItem>
							{minGoods && (
								<FormItem
									name='moreMinGoodsUnitId'
									rules={[{ required: true, message: '请选择' }]}>
									<Select
										placeholder='更多单位'
										style={{ width: '100px', marginLeft: '10px' }}
										showSearch
										allowClear
										getPopupContainer={(node) => node.parentNode}
										filterOption={(input, option) =>
											option!.text.toLowerCase().indexOf(input.toLowerCase()) >= 0
										}
										options={(dictionary.unit_type || []).filter((_: any, i: number) => i > 5)}
										fieldNames={{ label: 'text' }}
									/>
								</FormItem>
							)}
						</div>
					),
				},
			],
		},
		{
			valueType: 'group',
			key: 'minGoodsNum',
			columns: [
				{
					title: getFieldLabel('minGoodsNum', '中箱包装'),
					colProps: colItem3,
					formItemProps: {
						required: true,
						style: { marginBottom: 0 },
					},
					colSize: 24,
					renderFormItem: () => (
						<div style={{ display: 'flex' }}>
							<FormItem
								name='minGoodsNum'
								rules={[
									{
										required: true,
										message: `请输入${getFieldLabel('minGoodsNum', '中箱包装')}数`,
									},
								]}
								style={{ flex: 1 }}>
								<InputNumber
									precision={0}
									min={1}
									max={9999999}
									style={{ width: '100%' }}
								/>
							</FormItem>
							<span style={{ width: 30, textAlign: 'center', lineHeight: '32px' }}>/</span>
							<FormItem
								name='purchaseGoodsUnitId'
								rules={[
									{
										required: true,
										message: `请选择${getFieldLabel('purchaseGoodsUnitId', '单位')}`,
									},
								]}>
								<Select
									style={{ width: 100 }}
									showSearch
									placeholder='请选择'
									filterOption={(input, option) =>
										option!.text.toLowerCase().indexOf(input.toLowerCase()) >= 0
									}
									options={dictionary.unit_type || []}
									fieldNames={{ label: 'text' }}
								/>
							</FormItem>
						</div>
					),
				},
			],
		},
		{
			valueType: 'group',
			key: 'largeBoxNum',
			columns: [
				{
					title: getFieldLabel('largeBoxNum', '大箱包装'),
					colProps: colItem3,
					formItemProps: {
						required: true,
						style: { marginBottom: 0 },
					},
					colSize: 24,
					renderFormItem: () => (
						<div style={{ display: 'flex' }}>
							<FormItem
								name='largeBoxNum'
								rules={[
									{
										required: true,
										message: `请输入${getFieldLabel('largeBoxNum', '大箱包装')}数`,
									},
								]}
								style={{ flex: 1 }}>
								<InputNumber
									precision={0}
									min={1}
									max={9999999}
									style={{ width: '100%' }}
								/>
							</FormItem>
							<span style={{ width: 30, textAlign: 'center', lineHeight: '32px' }}>/</span>
							<FormItem
								name='largeBoxUnitId'
								rules={[
									{ required: true, message: `请选择${getFieldLabel('largeBoxUnitId', '单位')}` },
								]}>
								<Select
									style={{ width: 100 }}
									showSearch
									placeholder='请选择'
									filterOption={(input, option) =>
										option!.text.toLowerCase().indexOf(input.toLowerCase()) >= 0
									}
									options={dictionary.unit_type || []}
									fieldNames={{ label: 'text' }}
								/>
							</FormItem>
						</div>
					),
				},
			],
		},
		{
			title: fields.baseGoodsProperty,
			dataIndex: 'isHighValue',
			valueType: 'radio',
			fieldProps: {
				name: 'isHighValue',
				onChange: (e: RadioChangeEvent) => {
					if (e.target.value) {
						form.setFieldsValue({
							isBarcodeControlled: true,
						});
						setIsBarcodeControlled(true);
					}
					setTimeout(() => {
						setIsHighValue(e.target.value);
					}, 0);
				},
				options: isHightValue.map((item) => ({
					...item,
					onClick: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
						if (e.target && isHighValue === ((e.target as any).value === 'true')) {
							form.resetFields(['isHighValue']);
							setTimeout(() => {
								setIsHighValue(undefined);
							}, 0);
						}
					},
				})),
			},
			colProps: { span: 24 },
		},
		...(systemType === 'Insight_MS'
			? ([
					{
						title: '跟台类别',
						dataIndex: 'stageType',
						valueType: 'radio',
						fieldProps: {
							name: 'stageType',
							onChange: (e: RadioChangeEvent) => {
								if (e.target.value) {
									form.setFieldsValue({
										isBarcodeControlled: true,
									});
									setIsBarcodeControlled(true);
								} else {
									setIsChoose(false);
								}
								if (!form.getFieldsValue().isImplantation) {
									setImplantation(e.target.value);
								}
							},
							options: [
								{ label: `非跟台类${fields.goods}`, value: false },
								{ label: `跟台类${fields.goods}`, value: true },
							],
							// disabled: handleType === 'edit' ? true : false,
						},
						colProps: { span: 24 },
					},
					{
						title: '植/介入物',
						dataIndex: 'isImplantation',
						valueType: 'radio',
						fieldProps: {
							name: 'isImplantation',
							onChange: (e: RadioChangeEvent) => {
								if (e.target.value) {
									form.setFieldsValue({
										isBarcodeControlled: true,
										isHighValue: true,
									});
									setIsHighValue(true);
									setIsBarcodeControlled(true);
								}
								if (!form.getFieldsValue().stageType) {
									setImplantation(e.target.value);
								}
							},
							options: yesOrNo,
						},
						colProps: { span: 24 },
					},
			  ] as ProFormColumns)
			: []),
		{
			title: '条码管控',
			dataIndex: 'isBarcodeControlled',
			valueType: 'radio',
			hideInForm: systemType === 'Insight_DS',
			fieldProps: {
				name: 'isBarcodeControlled',
				options: yesOrNo,
				disabled: implantation || (handleType === 'edit' && isChoose) ? true : false,
				onChange: (e: RadioChangeEvent) => {
					setIsBarcodeControlled(Boolean(e.target.value));
				},
			},
			colProps: { span: 24 },
			formItemProps:
				systemType === 'Insight_MS'
					? {
							extra: ` * ${getFieldLabel('isImplantation', '植/介入物')}和跟台类${
								fields.goods
							}只可选择${getFieldLabel('isBarcodeControlled', '条码管控')}`,
					  }
					: {},
		},
		{
			title: '重点品种',
			dataIndex: 'keyItem',
			valueType: 'radio',
			hideInForm: !isBarcodeControlled,
			fieldProps: {
				name: 'keyItem',
				options: yesOrNo,
			},
			colProps: { span: 24 },
		},
		{
			title: '医疗器械',
			dataIndex: 'isConsumableMaterial',
			hideInForm: systemType === 'Insight_DS',
			valueType: 'radio',
			fieldProps: {
				name: 'isConsumableMaterial',
				options: yesOrNo,
				onChange: (e: RadioChangeEvent) => {
					if (e.target.value) {
						form.setFieldsValue({
							categoryType: '12',
						});
					}
					setIsConsumableMaterial(e.target.value);
					resetCategoryList(e.target.value ? '12' : '95');
				},
			},
			colProps: { span: 24 },
		},
		{
			valueType: 'group',
			key: 'category',
			columns: [
				{
					title: `${fields.baseGoods}分类`,
					colProps: colItem3,
					formItemProps: {
						required: true,
						style: { marginBottom: 0 },
					},
					renderFormItem: () => (
						<>
							<Input.Group
								compact
								style={{ display: 'flex' }}>
								{isConsumableMaterial && (
									<FormItem
										name='categoryType'
										rules={[{ required: true, message: '请选择版本' }]}
										style={{ width: 72 }}>
										<Select
											onChange={resetCategoryList}
											options={goodsCategoryTypes}
										/>
									</FormItem>
								)}
								<FormItem
									name='category'
									style={{ flex: 1 }}
									rules={[
										{
											required: true,
											message: `请选择${getFieldLabel('category', `${fields.baseGoods}分类`)}`,
										},
									]}>
									<Cascader
										className='cs'
										showSearch
										getPopupContainer={(node) => node.parentNode}
										placeholder={`请选择${getFieldLabel('category', `${fields.baseGoods}分类`)}`}
										options={treeData}
										style={{ width: '100%' }}
									/>
								</FormItem>
							</Input.Group>
						</>
					),
				},
			],
		},
	];

	let finalColumns: ProFormColumns = [];
	const extendedColumns: ProFormColumns = [];

	const loopColumns = (list: ProFormColumns) => {
		const result: ProFormColumns = [];
		list.forEach((col) => {
			const key = (col as ProColumn).dataIndex;
			let cols: ProFormColumns = ((col as ProColumn).columns as ProFormColumns) || [];
			if ((col as ProColumn).valueType === 'group') {
				cols = loopColumns((col as ProColumn).columns as ProFormColumns);
			}
			const field = fieldsMap[key as string];
			// 处理group或者没有dataIndex的必填项或者有renderFormItem或者render的配置
			if (!field && !key) {
				if ((col as any).valueType === 'group') {
					if (cols.length > 0) {
						(col as any).columns = cols;
						result.push({ ...col });
					}
				} else {
					result.push({ ...col });
				}
			} else if (
				(field && (field.enabled || field.required)) ||
				requiredFieldNames.includes(key as string) ||
				(['limitType', 'limitPerMonth'].includes(key as string) && requiredLimit)
			) {
				// 处理启用或者必填项的情况
				if (cols.length > 0) {
					(col as any).columns = cols;
				}
				result.push({
					...col,
					title: field
						? field.displayFieldLabel || (col as ProColumn).title
						: (col as ProColumn).title,
				});
			}
		});
		return result;
	};
	if (!fieldLoading) {
		if (extendedFields && extendedFields?.length > 0) {
			extendedFields?.forEach((item) => {
				const col: Record<string, any> = {
					colProps: colItem3,
					title: item.displayFieldLabel,
					dataIndex: item.displayFieldKey,
				};
				if (
					['Integer', 'Float', 'Long', 'Double', 'String', 'Number'].includes(
						item.displayFieldType as string,
					)
				) {
					if (item.displayFieldType !== 'String') {
						col.valueType = 'inputNumber';
					}
					col.fieldProps = {
						placeholder: '请输入',
					};
					let rs: Rule[] = [];
					if (item.required) {
						rs = [{ required: true, message: `请输入${item.displayFieldLabel}` }];
					}

					if (['Integer', 'Long'].includes(item.displayFieldType as string)) {
						rs.push({
							validator: (_rule: Rule, val: string) => {
								if (!val) {
									return Promise.resolve();
								} else if (!/^\d+$/.test(val)) {
									return Promise.reject('请输入正整数');
								}
								return Promise.resolve();
							},
						});
					}
					if (rs.length) {
						col.formItemProps = {
							rules: rs,
						};
					}
					extendedColumns.push(
						item.lineShow ? col : { valueType: 'group', columns: [col], key: item.displayFieldKey },
					);
				} else if (item.displayFieldType === 'Boolean') {
					col.valueType = 'radio';
					col.fieldProps = {
						options: yesOrNo,
					};
					if (item.required) {
						col.formItemProps = {
							rules: [{ required: true, message: `请选择${item.displayFieldLabel}` }],
						};
					}
					extendedColumns.push(col);
				} else if (item.displayFieldType === 'Date') {
					col.valueType = 'date';
					col.fieldProps = {
						format: 'YYYY/MM/DD',
						style: { width: '100%' },
					};
					if (item.required) {
						col.formItemProps = {
							rules: [{ required: true, message: `请选择${item.displayFieldLabel}` }],
						};
					}
					extendedColumns.push(
						item.lineShow ? col : { valueType: 'group', columns: [col], key: item.displayFieldKey },
					);
				}
			});
		}

		let initSort = 9999;

		finalColumns = loopColumns(columns)
			.concat(extendedColumns)
			.filter((item: any) => {
				let aKey = item.dataIndex || item.key;
				if (aKey === 'manufacturerId') {
					aKey = 'manufacturerName';
				}
				const aField = fieldsMap[aKey] || {};
				return aField.enabled;
			})
			.sort((a: any, b: any) => {
				let aKey = a.dataIndex || a.key;
				let bKey = b.dataIndex || b.key;
				if (aKey === 'manufacturerId') {
					aKey = 'manufacturerName';
				}
				if (bKey === 'manufacturerId') {
					bKey = 'manufacturerName';
				}
				const aField = fieldsMap[aKey] || {};
				const bField = fieldsMap[bKey] || {};
				// 如果没有排序则放到最后
				return (aField.sort || ++initSort) - (bField.sort || ++initSort);
			});
	}

	const otherColumns: ProFormColumns = [
		{
			dataIndex: 'description',
			title: getFieldLabel('description', '备注'),
			fieldProps: {
				maxLength: 100,
			},
			formItemProps: {
				...formLayoutItem,
				labelCol: {
					flex: '120px',
				},
			},
		},
	];

	return (
		<div className='handle-page'>
			<div className='handle-page-breadcrumb'>
				<Breadcrumb
					config={[
						'',
						[
							'',
							handleType === 'add'
								? '/base_data/new_goods'
								: { pathname: '/base_data/new_goods', state: 'goods' },
						],
						[
							'',
							handleType === 'add'
								? '/base_data/new_goods'
								: { pathname: '/base_data/new_goods', state: 'goods' },
						],
						handleType === 'edit' && systemType === 'Insight_DS'
							? ` - ${(history.location.state as { goodsName: string })?.goodsName}`
							: '',
					]}
				/>
			</div>

			<Card
				bordered={false}
				className='mb6 handle-page-card'>
				<Spin
					spinning={fieldLoading}
					tip='Loading...'>
					{fieldLoading ? (
						<div style={{ height: 100 }} />
					) : (
						<ProForm
							form={form}
							layout='horizontal'
							{...searchFormItem6}
							scrollToFirstError
							grid
							submitter={{
								render: () => (
									<FooterToolbar>
										<Button
											onClick={() => history.goBack()}
											className='returnButton'>
											返回
										</Button>
										{handleType === 'add' || handleType === 'copy' ? (
											<Button
												type='primary'
												loading={submitLoading}
												onClick={() => handleSubmit('copy')}
												className='verifyButton'>
												保存并复制
											</Button>
										) : null}
										<Button
											type='primary'
											loading={submitLoading}
											onClick={() => handleSubmit('save')}
											className='verifyButton'>
											保存并返回
										</Button>
									</FooterToolbar>
								),
							}}>
							<Col span={24}>
								<h3 className='ant-descriptions-title'>基本信息</h3>
							</Col>
							<SchemaForm
								rules={rules}
								labelWidth={120}
								layoutType='Embed'
								columns={finalColumns}
							/>
							{isConsumableMaterial && (
								<>
									<Divider />
									<Col span={24}>
										<h3 className='ant-descriptions-title'>
											{getFieldLabel('registrationList', '注册证')}
										</h3>
									</Col>
									{(registrationList || []).map((item, index) => (
										<>
											<Row
												key={index}
												style={{ width: '100%' }}>
												<Col
													{...colItem3}
													style={{ position: 'relative' }}>
													{registrationList.length > 1 && (
														<MinusCircleOutlined
															onClick={() => deleteRegistration(index)}
															className={style.removeIcon}
														/>
													)}
													<FormItem
														{...formListLayout}
														label='注册证号'
														name={`registrationNum_${index}`}
														rules={[{ required: gspEnabled, message: '请输入注册证号' }]}>
														<Input
															maxLength={99}
															onChange={(e) =>
																handleChange(index, e.target.value, 'registrationNum')
															}
															placeholder='请输入注册证号'
														/>
													</FormItem>
												</Col>
												<Col
													{...colItem3}
													style={{ position: 'relative' }}>
													<FormItem
														{...formListLayout}
														label='生效日期'
														name={`registrationBeginDate_${index}`}
														rules={[{ required: gspEnabled, message: '请选择' }]}
														initialValue={
															item.registrationBeginDate
																? [
																		moment(new Date(item.registrationBeginDate)),
																		item.registrationEndDate
																			? moment(new Date(item.registrationEndDate))
																			: undefined,
																  ]
																: undefined
														}>
														<RangePicker
															key={index}
															style={{ width: '100%' }}
															onChange={(e, value) => {
																handleChange(index, value, 'registrationBeginDate');
															}}
															format={['YYYY-MM-DD', 'YYYY/MM/DD']}
															disabled={[false, item.registrationDate ? true : false]}
															placeholder={['生效日期', '截止日期']}
															allowEmpty={[false, item.registrationDate ? true : false]}
														/>
													</FormItem>
												</Col>

												<Col {...colItem3}>
													<FormItem
														{...formListLayout}
														label='长期有效'
														name={`registrationDate_${index}`}>
														<Checkbox
															onChange={(e) => {
																let name = `registrationBeginDate_${index}`;
																let value = form.getFieldValue(name);
																form.setFieldsValue({
																	[name]: value && [value[0], null],
																});
																handleChange(index, e.target.checked, 'registrationDate');
															}}
															checked={item.registrationDate}
														/>
													</FormItem>
												</Col>
												<Col {...colItem3}>
													<BatchUpLoadFile
														formItemCol={formListLayout}
														required={gspEnabled}
														form={form}
														uploadApi={uploadFileApi}
														label='注册证照'
														btnTxt='上传注册证'
														setIsSuccessfully={setIsSuccessfully}
														formName={`registrationImg_${index}`}
														onChange={(value) => handleImageChange('registrationImg', value, index)}
														initialValue={item.registrationImgList || []}
													/>
												</Col>
											</Row>
											<Divider dashed />
										</>
									))}
									<Button
										className={style.addBtn}
										onClick={addRegistration}
										icon={<PlusOutlined />}>
										新增注册证件
									</Button>
								</>
							)}
							{fieldsMap.description && fieldsMap.description.enabled && (
								<>
									<Divider dashed />
									<h3
										style={{ fontWeight: 'bold' }}
										className='ant-descriptions-title'>
										其他
									</h3>
									<SchemaForm
										layoutType='Embed'
										columns={otherColumns}
									/>
								</>
							)}
							<>
								<Col span={24}>
									<h3 className='ant-descriptions-title'>其它附件</h3>
								</Col>
								<OtherAttachments
									form={form}
									data={attachmentsData}
									aRef={attachmentsRef}
									type='otherAttachments'
									horizontal={true}
									setIsSuccessfully={setIsSuccessfully}
								/>
							</>
						</ProForm>
					)}
				</Spin>
			</Card>
		</div>
	);
};

export default connect(({ global }: { global: Record<string, any> }) => ({ global }))(AddPage);
