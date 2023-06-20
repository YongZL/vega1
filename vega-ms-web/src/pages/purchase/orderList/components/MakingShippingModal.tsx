import Descriptions, { DescriptionsItemProps } from '@/components/Descriptions';
import ProTable from '@/components/ProTable';
import ScanInput from '@/components/ScanInput/ScanInput';
import { findConfig as UDIParsing } from '@/services/config';
import { getParseUdiCode } from '@/services/gsp';
import { accessNameMap, getStartTime, scrollTable, transformSBCtoDBC, getEndTime } from '@/utils';
import { dealPackNum } from '@/utils/dataUtil';
import { formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { beforeUpload } from '@/utils/file';
import { getUrl } from '@/utils/utils';
import {
	ExclamationCircleFilled,
	MinusCircleOutlined,
	PlusCircleOutlined,
} from '@ant-design/icons';
import { ProColumns } from '@ant-design/pro-table/lib/typing';
import {
	Button,
	Checkbox,
	Col,
	DatePicker,
	Form,
	Input,
	Modal,
	Popover,
	Radio,
	Row,
	Tooltip,
	Upload,
	Select,
} from 'antd';
import { cloneDeep, debounce } from 'lodash';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { connect, useAccess, useModel } from 'umi';
import styles from '../../index.less';
import { dowdownTemplate, importExcelfile } from '@/services/shippingOrder';
import TemplateErrorModal from '@/components/TemplateErrorModal';
import { taxRate } from '@/constants/dictionary';
import { convertPriceWithDecimal } from '@/utils/format';
import { validateInvoiceAmount } from '@/utils/validator';
type ShippingList = PurchaseOrderNewController.ShippingList;
const FormItem = Form.Item;
const { Option } = Select;
const isWX = sessionStorage.getItem('hospital_id') === '107'; //是否为吴兴医院
const MakingShippingOrder = ({
	submitting,
	loading,
	purchaseOrder,
	dispatch,
	...props
}: PurchaseOrderNewController.OrderDetailsProps) => {
	const access = useAccess();
	const { fields } = useModel('fieldsMapping');
	const [form] = Form.useForm();
	const { shippingInfo } = purchaseOrder;
	const tableBodyRef = useRef<Element>();
	const udiObjRef = useRef<Record<string, any>>({});
	const [optionList, setOptionList] = useState([]);
	const [configValue, setConfigValue] = useState([]);
	const [repeatUdi, setRepeatUdi] = useState(''); //设置重复udi
	const [repeatLotNum, setRepeatLotNum] = useState(''); //设置重复批号
	const [popoverVisible, setPopoverVisible] = useState<boolean>(false);
	const [currTotalCountInMin, setCurrTotalCountInMin] = useState(0);
	const [goodDiObj, setGoodDiObj] = useState<Record<string, any>>({});
	const [shippingGoodsList, setShippingGoodsList] = useState<ShippingList[]>([]);
	const { singlePurchaseOrderInfo, visible, setModalVisible, actionType, getList } = props;
	const accessName = accessNameMap(); // 权限名称
	const [uploading, setUploading] = useState<boolean>(false);
	const [templeteVisible, setTempleteVisible] = useState<boolean>(false);
	const [invoiceRequired, setInvoiceRequired] = useState<boolean>(false);

	const errorData = useRef<Record<string, any>>({});
	const errorPath = useRef<string>('');
	useEffect(() => {
		const getUDIParsing = async () => {
			const res = await UDIParsing();
			if (res && res.code === 0) {
				const val = res.data.configValue?.split('&');
				setConfigValue(val);
			}
		};
		getUDIParsing();
	}, []);

	//校验序列号
	const checkSerialNumber = (id: number) => {
		let serialNumberArr = [],
			serialNumberObj = {},
			sameSerialNumber = {};

		let list = cloneDeep(shippingGoodsList);
		for (let i = 0; i < list.length; i++) {
			const { goodsId, serialNumber } = list[i];
			if (id === goodsId && serialNumber) {
				serialNumberArr.push(serialNumber);
			}
		}

		for (let j = 0; j < serialNumberArr.length; j++) {
			let result = serialNumberArr[j];
			if (result) {
				if (serialNumberObj[result]) {
					sameSerialNumber[result] = result;
				} else {
					serialNumberObj[result] = true;
				}
			}
		}
		if (JSON.stringify(sameSerialNumber) !== '{}') {
			for (let k = 0; k < list.length; k++) {
				const { goodsId, serialNumber } = list[k];
				if (id === goodsId && serialNumber) {
					if (sameSerialNumber[serialNumber]) {
						list[k].serialNumberError = true;
					} else {
						list[k].serialNumberError = false;
					}
				}
			}
		} else {
			for (let k = 0; k < list.length; k++) {
				const { goodsId, serialNumberError } = list[k];
				if (id === goodsId && serialNumberError) {
					list[k].serialNumberError = false;
				}
			}
		}
		setShippingGoodsList([...list]);
	};

	//校验批号
	const checkLotNum = (id: number, index: number, value: string, type: string) => {
		let isReapt = false,
			list = cloneDeep(shippingGoodsList);
		const { goodsId, uniqId, barcodeControlled } = list[index];
		let eleName = `${goodsId}${uniqId}`;
		let isNoPass = false;
		if (barcodeControlled) {
			let arr = list.filter((item) => item.lotNum && item.goodsId == id && !item.serialNumber);
			isNoPass = arr.length > 1 ? true : false;
		}
		if (isNoPass || !barcodeControlled) {
			for (let i = 0; i < list.length; i++) {
				const { lotNum } = list[i];
				if (
					id === list[i].goodsId &&
					i !== index &&
					lotNum &&
					lotNum == value &&
					(!barcodeControlled || (barcodeControlled && !list[i].serialNumber))
				) {
					isReapt = true;
					form.resetFields([`lotNum${eleName}`]);
					notification.warning(`批号：${lotNum}已存在！`);
					const { tableBody, trHeight } = getElement();
					clearInfo(index);
					type == 'gs1Value' && form.resetFields([`udiCode${eleName}`]);
					tableBody?.scrollTo(tableBody?.clientWidth < 1000 ? 550 : 350, i * trHeight);
					setTimeout(() => {
						setRepeatLotNum(value);
					}, 10);
					break;
				}
			}
		}

		return isReapt;
	};

	useEffect(() => {
		if (visible && shippingInfo) {
			const list = shippingInfo.details.filter(
				(item: ShippingList) => item.goodsRemainQuantityInMin !== 0,
			);
			let goodDi = {},
				listArr = [];
			for (let i = 0; i < list.length; i++) {
				const { diCode, maDiCode, goodsId, code69 } = list[i];
				listArr.push({ ...list[i], listId: new Date().getTime() + '-' + goodsId + i });
				goodDi[goodsId] = {
					diCode: diCode || '',
					maDiCode: maDiCode || '',
					code69: code69 || '',
				};
			}

			setGoodDiObj(goodDi);
			setShippingGoodsList([...listArr]);
			setTimeout(() => {
				if (form) form.resetFields();
			}, 200);
		}
	}, [purchaseOrder]);

	const parseDate = (time: string) => {
		let arr = [];
		for (let i = 0, len = time.length; i < len / 2; i++) {
			let data = time.slice(2 * i, 2 * (i + 1));
			arr.push(data);
		}
		if (arr.length == 4) {
			const [year, year1, month, day] = arr;
			arr = [year + '' + year1, month, day];
		} else {
			arr[0] = '20' + arr[0];
		}
		const [year, month, day] = arr;
		return day !== '00'
			? new Date(new Date(arr.join('/')).toLocaleDateString()).getTime()
			: moment(year + '-' + month, 'YYYY-MM')
					.endOf('month')
					.startOf('day')
					.valueOf();
	};

	const checkBoxChange = (value: boolean, itemIndex: number) => {
		let listData = shippingGoodsList.map((item, index) => {
			return index == itemIndex ? { ...item, presenter: value } : { ...item };
		});
		setShippingGoodsList(listData);
	};

	/**
	 * @description 根据某些条件控制表单校验规则是否生效
	 */
	const judeRuleOfCondition = (record: ShippingList): boolean => {
		// 配送数量是否为0
		return Number(record.quantityInMin) === 0;
	};

	const columnsShipModal: ProColumns<ShippingList>[] = [
		{
			title: '',
			dataIndex: 'uniqId',
			key: 'uniqId',
			width: 40,
			align: 'right',
			render: (text, record, index) => {
				return record.uniqId ? (
					<MinusCircleOutlined
						className='fz18'
						onClick={() => handleDeleteGoods(index)}
						style={{
							marginLeft: '-16px',
							zIndex: 9999,
							position: 'relative',
							color: CONFIG_LESS['@c_hint'],
						}}
					/>
				) : (
					<Tooltip title={`添加该${fields.baseGoods}的其他批次信息`}>
						<PlusCircleOutlined
							className='fz18'
							style={{
								marginLeft: '-16px',
								zIndex: 9999,
								position: 'relative',
							}}
							onClick={() => handleAddGoods(record, index)}
						/>
					</Tooltip>
				);
			},
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
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			renderText: (text: string, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: () => (
				<>
					<Tooltip title='（例：(00)xxx(10)xxx(21)xxx）'>UDI</Tooltip>
					<Popover
						content={
							<span>
								<ExclamationCircleFilled
									style={{ marginRight: '4px', color: CONFIG_LESS['@c_starus_underway'] }}
								/>
								请切换至英文输入法
							</span>
						}
						visible={popoverVisible}
						placement='top'></Popover>
				</>
			),
			dataIndex: 'udiCode',
			key: 'udiCode',
			className: 'udiCode',
			width: 150,
			render: (text, record, index) => {
				const { goodsId, uniqId, udiCode } = record;
				let eleName = `udiCode${goodsId}${uniqId}`;
				return record.goodsName ? (
					<div style={{ width: '100%' }}>
						<Tooltip title={udiCode}>
							<FormItem
								className='mg0'
								name={eleName}
								initialValue={udiCode}>
								<ScanInput
									onChange={debounce((value) => {
										if (!value) {
											setPopoverVisible(false);
											clearInfo(index);
										}
									}, 100)}
									onSubmit={debounce(
										(value) => handleChangeGoodsDetails(index, value, 'gs1Value'),
										100,
									)}
									onPressEnter={(value) => {
										handleChangeGoodsDetails(index, value, 'gs1Value');
									}}
									onCompositionStart={() => {
										setPopoverVisible(true);
									}}
									value={udiCode}
									style={{ width: '100%' }}
									onMouseOut={() => onGs1MouseOut(record)}
									maxLength={100}
									placeholder='请点击此处扫码输入'
									// disabled={!record.diCode}
								/>
							</FormItem>
						</Tooltip>
						{record.gs1CodeError && !record.gs1Validating ? (
							<div className={styles['explain']}>{record.errorInfo}</div>
						) : null}
					</div>
				) : (
					''
				);
			},
		},
		{
			title: () => (
				<>
					<span className='cl_FF110B'>*</span>批号/序列号
				</>
			),
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 260,
			render: (text, record, index) => {
				if (!record) {
					return;
				}
				const { lotNum, goodsId, uniqId, barcodeControlled, serialNumber } = record;
				let lotRequired = !lotNum;
				let lotName = `lotNum${goodsId}${uniqId}`;
				let serialName = `serialNumber${goodsId}${uniqId}`;
				const handleLotOrSerial = (e: { target: { value: string } }, type: string) => {
					let val = e.target.value;
					let name = type === 'lotNum' ? lotName : serialName;
					handleChangeGoodsDetails(index, val, type, name);
				};
				return record.goodsName ? (
					<div style={{ width: '100%' }}>
						<FormItem
							className='mg0'
							name={[`lotNumSerialNumber${goodsId}${uniqId}`]}>
							<Input.Group
								compact
								className={styles.lotNum}>
								<FormItem
									rules={[{ required: judeRuleOfCondition(record) ? false : lotRequired }]}
									name={[`${lotName}`]}
									initialValue={lotNum}>
									<Input
										maxLength={22}
										placeholder='批号'
										className='site-input-left'
										onChange={(e) => {
											form.validateFields([`${lotName}`]);
											barcodeControlled && handleLotOrSerial(e, 'lotNum');
										}}
										onBlur={(e) =>
											!barcodeControlled
												? handleLotOrSerial(e, 'lotNum')
												: lotNum && checkLotNum(goodsId, index, lotNum, 'lotNum')
										}
										onPressEnter={(e) =>
											!barcodeControlled
												? handleLotOrSerial(e, 'lotNum')
												: lotNum && checkLotNum(goodsId, index, lotNum, 'lotNum')
										}
									/>
								</FormItem>
								<Input
									placeholder='/'
									className={`site-input-split`}
									readOnly={true}
									disabled={!barcodeControlled}
								/>
								<FormItem
									name={[`${serialName}`]}
									initialValue={serialNumber}>
									<Input
										maxLength={22}
										placeholder='序列号'
										className='site-input-right'
										onChange={(e) => handleLotOrSerial(e, 'serialNumber')}
										disabled={!barcodeControlled}
									/>
								</FormItem>
							</Input.Group>
						</FormItem>
						{record.serialNumberError ? (
							<div className={styles['explain']}>序列号重复,请重新输入</div>
						) : null}
					</div>
				) : (
					''
				);
			},
		},
		{
			title: () => (
				<>
					<span className='cl_FF110B'>*</span>生产日期
				</>
			),
			dataIndex: 'productionDate',
			key: 'productionDate',
			width: 150,
			renderText: (text: Date, record, index) => {
				const { goodsId, uniqId, goodsName } = record;
				let eleName = `${goodsId}${uniqId}`;
				return goodsName ? (
					<FormItem
						className='mg0'
						name={`productionDate${eleName}`}
						rules={[
							{
								required: judeRuleOfCondition(record) ? false : record.required || false,
								message: '  ',
							},
						]}
						initialValue={text ? moment(text) : null}>
						<DatePicker
							format={['YYYY-MM-DD', 'YYYY/MM/DD']}
							onChange={(moment, dateString) =>
								onDateChange(moment, dateString, index, 'productionDate')
							}
						/>
					</FormItem>
				) : (
					''
				);
			},
		},
		{
			title: '灭菌日期',
			dataIndex: 'sterilizationDate',
			key: 'sterilizationDate',
			width: 150,
			renderText: (text: Date, record, index) => {
				const { goodsId, uniqId, goodsName } = record;
				let eleName = `${goodsId}${uniqId}`;
				return goodsName ? (
					<FormItem
						className='mg0'
						name={`sterilizationDate${eleName}`}
						// 控制灭菌日期是否必填
						// rules={[{ required: record.required || false, message: '  ' }]}
						initialValue={text ? moment(text) : null}>
						<DatePicker
							format={['YYYY-MM-DD', 'YYYY/MM/DD']}
							onChange={(moment, dateString) => {
								onDateChange(moment, dateString, index, 'sterilizationDate');
							}}
						/>
					</FormItem>
				) : (
					''
				);
			},
		},
		{
			title: () => (
				<>
					<span className='cl_FF110B'>*</span>有效期至
				</>
			),
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width: 150,
			renderText: (text: Date, record, index) => {
				const { goodsId, uniqId, goodsName } = record;
				let eleName = `${goodsId}${uniqId}`;
				return goodsName ? (
					<FormItem
						className='mg0'
						name={`expirationDate${eleName}`}
						rules={[
							{
								required: judeRuleOfCondition(record) ? false : record.required || false,
								message: ' ',
							},
						]}
						initialValue={text ? moment(text) : undefined}>
						<DatePicker
							format={['YYYY-MM-DD', 'YYYY/MM/DD']}
							onChange={(moment, dateString) =>
								onDateChange(moment, dateString, index, 'expirationDate')
							}
						/>
					</FormItem>
				) : (
					''
				);
			},
		},
		{
			title: '大/中包装',
			dataIndex: 'unitNum',
			key: 'unitNum',
			width: 100,
			hideInSearch: true,
			renderText: (text: string, record) => {
				const { largeBoxNum, unitNum } = record;
				return dealPackNum(largeBoxNum, unitNum);
			},
		},
		{
			title: () => (
				<>
					<span className='cl_FF110B'>*</span>配送数量
				</>
			),
			dataIndex: 'quantityInMin',
			key: 'quantityInMin',
			width: 150,
			className: 'quantityInMin',
			render: (text, record, index) => {
				// 单位转换
				let countTotal = 0;
				const { goodsId, uniqId, subtotalQuantity } = record;
				let eleName = `${goodsId}${uniqId}`;
				const { goodsQuantityInPurchase, orderQuantity, unitNum, minUnitName } = record;
				countTotal = record.goodsRemainQuantityInMin * unitNum;

				let needNum = currTotalCountInMin ? countTotal - currTotalCountInMin : countTotal; // 需要填入的数据
				let numInPurchase = parseInt((Math.abs(needNum) / unitNum).toString());
				let toolTipTitle = '';
				let total = subtotalQuantity || (goodsQuantityInPurchase || orderQuantity || 0) * unitNum;
				// 数量格式化显示
				let formatedTotalCount = `总数${total}${minUnitName}`;
				let formatedNeedCount = `${numInPurchase > 0 ? numInPurchase + minUnitName : ''}`;
				if (needNum == 0) {
					// 数量达标
					toolTipTitle = `${formatedTotalCount},已经配足`;
				} else if (needNum > 0) {
					// 数量不足
					toolTipTitle = `${formatedTotalCount},还需配${formatedNeedCount}`;
				} else {
					// 数量超出
					toolTipTitle = `${formatedTotalCount},已超出${formatedNeedCount}`;
				}
				return record.goodsName ? (
					<Tooltip title={toolTipTitle}>
						<FormItem
							className='mg0'
							name={`quantityInMin${eleName}`}
							rules={[
								{
									required: record.required || false,
									message: ' ',
								},
								{ validator: validateQuantity },
							]}
							initialValue={record.quantityInMinFixed}>
							<Input
								className='psNumber'
								maxLength={6}
								onChange={(e) =>
									handleChangeGoodsDetails(
										index,
										e.target.value,
										'quantityInMin',
										`quantityInMin${eleName}`,
										record.goodsId,
										record,
									)
								}
								onMouseOver={(e: any) =>
									handleChangeGoodsDetails(
										index,
										e.target.value,
										'quantityInMin',
										`quantityInMin${eleName}`,
										record.goodsId,
										record,
									)
								}
								suffix={record.minUnitName}
								placeholder='散包装'
							/>
						</FormItem>
					</Tooltip>
				) : (
					''
				);
			},
		},
		// {
		//   title: '配送数量小计',
		//   dataIndex: 'quantityInMin',
		//   key: 'quantityInMin',
		//   width: 120,
		//   ellipsis: true,
		//   renderText: (text: number, record) => <span>{text ? text + record.minUnitName : '-'}</span>,
		// },
		{
			title: '产品注册证',
			dataIndex: 'registrationNum',
			key: 'registrationNum',
			width: 120,
			ellipsis: true,
		},
		{
			title: '赠送',
			dataIndex: 'presenter',
			key: 'presenter',
			width: 120,
			ellipsis: true,
			render: (text, record, index) => (
				<Checkbox
					checked={record?.presenter}
					onChange={(e) => checkBoxChange(e.target.checked, index)}>
					赠送
				</Checkbox>
			),
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '操作',
			dataIndex: 'operator',
			key: 'operator',
			width: 62,
			fixed: 'right',
			render: (text, record, index) => (
				<div className='operation'>
					<span
						onClick={() => clearInfo(index)}
						className='handleLink'>
						清空
					</span>
				</div>
			),
		},
	];

	const onGs1MouseOut = (record: ShippingList) => {
		if (record.gs1CodeError && !record.gs1Value) record.gs1Validating = true;
	};

	const upDataSelectValue = (id: number) => {
		const oldShipList = [...optionList];
		const newShipList: any = oldShipList.map((item: ShippingOrderController.ShippingGoods) =>
			item.goodsId == id ? { ...item, disabled: false } : { ...item },
		);
		setOptionList(newShipList);
	};

	// 校验数量
	const validateQuantity = (rule: any, value: string, callback: (value?: string) => void) => {
		if (!value) {
			callback();
			return;
		}
		const reg = /^[0-9]\d*$/;
		if (!reg.test(value)) callback(' ');
		callback();
	};

	const shipModalSubmit = (surgicalPackageSelected?: boolean) => {
		setShippingGoodsList([...shippingGoodsList]);
		// // 过滤未配置数据
		let shippingGoodsItems = shippingGoodsList.filter(
			(item) =>
				item.lotNum ||
				item.serialNumber ||
				item.productionDate ||
				item.expirationDate ||
				// 控制灭菌日期是否必填（前端校验）
				// item.sterilizationDate ||
				item.quantityInMin ||
				item.udiCode ||
				item.gs1Value,
		);

		if (!shippingGoodsItems.length && !surgicalPackageSelected) {
			notification.warning(`请配置${fields.baseGoods}再提交！`);
			return;
		}

		let flag = false;

		form
			.validateFields()
			.then(async (values) => {
				if (shippingGoodsItems.some((item) => isNaN(Number(item.quantityInMin)))) {
					notification.warning(`请检查基础配送数量！`);
					flag = true;
				}
				shippingGoodsItems.forEach((goods) => {
					// 如果有gs1code且包含21码，基础物资数量为1

					// if (goods.udiCode && !goods.lotNum && goods.serialNumber) {
					//   goods.quantityInMin = 1;
					// }
					// 转换小单位
					goods.selectNum = goods.quantityInMin;
					// 检查基础物资数量和提交数量是否超出
					let detailsItem =
						shippingInfo.details.filter((item: ShippingList) => item.goodsId == goods.goodsId)[0] ||
						{};

					let needAll = 0;
					needAll = detailsItem.goodsRemainQuantityInMin;
					if (needAll < goods.selectNum) {
						notification.warning(
							`${fields.baseGoods}[${detailsItem.goodsName}]
            可配送数量: [${needAll}${detailsItem.minUnitName}],
            实际配送数量:[${goods.selectNum}${goods.minUnitName}],数量超出！`,
						);
						flag = true;
					}
				});
				// 检查必填字段是否填写
				for (let i = 0; i < shippingGoodsItems.length; i++) {
					const goodProductionDate = shippingGoodsItems[i]['productionDate'];
					const goodExpirationDate = shippingGoodsItems[i]['expirationDate'];
					const goodSterilizationDate = shippingGoodsItems[i]['sterilizationDate'];
					if (shippingGoodsItems[i]['serialNumberError']) {
						notification.warning(`有${fields.goods}序列号重复，请检查`);
						flag = true;
						break;
					}

					if (goodProductionDate && goodExpirationDate && goodProductionDate > goodExpirationDate) {
						notification.warning(
							`${fields.baseGoods}[${shippingGoodsItems[i].goodsName}]
            生产日期: ${moment(goodProductionDate).format('YYYY-MM-DD')}
            大于过期日期:${moment(goodExpirationDate).format('YYYY-MM-DD')}`,
						);
						flag = true;
						break;
					}
					if (
						goodProductionDate &&
						goodSterilizationDate &&
						goodProductionDate > goodSterilizationDate
					) {
						notification.warning(
							`${fields.baseGoods}[${shippingGoodsItems[i].goodsName}]
            生产日期: ${moment(goodProductionDate).format('YYYY-MM-DD')}
            大于灭菌日期:${moment(goodSterilizationDate).format('YYYY-MM-DD')}`,
						);
						flag = true;
						break;
					}
					if (
						goodSterilizationDate &&
						goodExpirationDate &&
						goodSterilizationDate > goodExpirationDate
					) {
						notification.warning(
							`${fields.baseGoods}[${shippingGoodsItems[i].goodsName}]
            灭菌日期: ${moment(goodSterilizationDate).format('YYYY-MM-DD')}
            大于过期日期:${moment(goodExpirationDate).format('YYYY-MM-DD')}`,
						);
						flag = true;
						break;
					}
					if (goodProductionDate && goodProductionDate > Date.now()) {
						notification.warning(
							`${fields.baseGoods}[${shippingGoodsItems[i].goodsName}]
            生产日期: ${moment(goodProductionDate).format('YYYY-MM-DD')}大于当前时间`,
						);
						flag = true;
						break;
					}
					/* 无当日生产即过期的基础物资 */
					// 获取当天零点的时间戳
					if (goodExpirationDate && goodExpirationDate < Date.now()) {
						notification.warning(
							`${fields.baseGoods}[${shippingGoodsItems[i].goodsName}]
            有效期至：${moment(goodExpirationDate).format('YYYY-MM-DD')}必须大于当前时间`,
						);
						flag = true;
						break;
					}
				}

				if (flag) return;
				// 配送时间
				if (values.expectedDeliveryDate) {
					values.expectedDeliveryDate = values.expectedDeliveryDate.valueOf();
				}
				if (values.invoicingDate) {
					values.invoicingDate = values.invoicingDate && values.invoicingDate.valueOf();
				}
				if (values.taxRate === 0) {
					values.taxRate = '0';
				}
				for (let key in values) {
					if (!values[key]) delete values[key];
				}
				let params: Record<string, any> = {};
				let {
					deliveryUserName,
					expectedDeliveryDate,
					expressNo,
					deliveryUserPhone,
					invoiceCode,
					ambivalentPlatformOrder,
					invoiceNo,
					invoicingDate,
					taxRate,
					invoiceAmount,
				} = values;
				if (isWX) {
					ambivalentPlatformOrder = ambivalentPlatformOrder === 'true' ? true : false;
				}
				// 类型是新增
				params = {
					items: cloneDeep(shippingGoodsItems).filter((item) => {
						item.diCode = '';
						item.maDiCode = '';
						item.code69 = '';
						item.quantityInMin = item.selectNum;
						if (item.barcodeControlled) {
							item.serialNo = item.serialNumber;
						} else {
							delete item.serialNumber;
						}
						delete item.ais;
						delete item.gs1CodeError;
						delete item.gs1Validating;
						delete item.gs1Value;
						return item.selectNum != 0;
					}),
					orderId: singlePurchaseOrderInfo.id,
					actionType,
					deliveryUserName,
					deliveryUserPhone,
					expectedDeliveryDate,
					expressNo,
					invoiceCode,
					ambivalentPlatformOrder,
					invoiceNo,
					invoicingDate,
					taxRate: Number(taxRate),
					invoiceAmount: invoiceAmount * 10000,
				};
				if (params.items.length <= 0) {
					notification.warning(`请填写配送数量！`);
					return;
				}
				dispatch({
					type: 'purchaseOrder/makeShippingOrder',
					payload: params,
					callback: (res: Record<string, any>) => {
						if (res && res.code === 0) {
							notification.success('操作成功');
							setModalVisible(false);
							setShippingGoodsList([]);
							form.resetFields();
							getList();
						}
					},
				});
			})
			.catch((error) => {
				for (let i = 0; i < shippingGoodsList.length; i++) {
					const { lotNum, productionDate, expirationDate, quantityInMin } = shippingGoodsList[i];
					if (!lotNum || !productionDate || !expirationDate || !quantityInMin) {
						scrollTable(Number(i) + 1, 'tableEle');
						break;
					}
				}
			});
	};

	// 添加基础物资行
	const handleAddGoods = (record: ShippingList, index: number) => {
		shippingGoodsList.splice(index + 1, 0, {
			...record,
			...clearObj(),
			isLoadingData: false,
			diCode: '',
			uniqId: new Date().getTime(),
			listId: new Date().getTime() + '-' + index,
		});
		delete shippingGoodsList[index + 1]['dataVersion'];
		setShippingGoodsList([...shippingGoodsList]);
	};

	// 删除
	const handleDeleteGoods = (index: number) => {
		const { gs1Value } = shippingGoodsList[index];
		if (gs1Value) {
			delete udiObjRef.current[gs1Value];
		}
		shippingGoodsList.splice(index, 1);
		setShippingGoodsList([...shippingGoodsList]);
	};

	const clearObj = () => {
		return {
			udiCode: '',
			gs1Value: undefined,
			lotNum: '',
			serialNumber: '',
			productionDate: undefined,
			sterilizationDate: undefined,
			expirationDate: undefined,
			quantityInMin: 0,
			required: false,
			gs1CodeError: false,
			serialNumberError: false,
		};
	};
	// 清空
	const clearInfo = (index: number, isNoDeleteGs1Value?: boolean) => {
		let list = cloneDeep(shippingGoodsList);
		let arr = [];
		const item = list[index];
		const { udiCode, listId } = list[index];
		if (udiCode && !isNoDeleteGs1Value) {
			delete udiObjRef.current[udiCode];
		}
		let record = { ...item, ...clearObj() };
		form.setFieldsValue({
			[`lotNum${item.goodsId}${item.uniqId}`]: undefined,
			[`serialNumber${item.goodsId}${item.uniqId}`]: undefined,
			[`lotNumSerialNumber${item.goodsId}${item.uniqId}`]: undefined,
			[`productionDate${item.goodsId}${item.uniqId}`]: undefined,
			[`expirationDate${item.goodsId}${item.uniqId}`]: undefined,
			[`sterilizationDate${item.goodsId}${item.uniqId}`]: undefined,
			[`quantityInMin${item.goodsId}${item.uniqId}`]: undefined,
			[`udiCode${item.goodsId}${item.uniqId}`]: undefined,
		});
		for (let i = 0, len = list.length; i < len; i++) {
			arr.push(i == index ? record : list[i]);
		}
		setShippingGoodsList([...arr]);
	};

	/**
	 * 物品数据管理
	 * 职能有点多
	 */
	const handleChangeGoodsDetails = async (
		index: number,
		value: any,
		key: string,
		formKey?: any,
		currGoodsId?: number,
		record?: Record<string, any>,
	) => {
		setRepeatUdi('');
		setRepeatLotNum('');
		let changedItem = shippingGoodsList[index];
		const { goodsId, uniqId, udiCode } = changedItem;
		let chinese = value.match(/[^\x00-\xff]/gi) || value.match(new RegExp('[~#^@%&!?%*]', 'g'));

		if (!chinese?.length) {
			setPopoverVisible(false);
		}

		if (key === 'gs1Value' && (!value || chinese?.length)) {
			clearInfo(index);
			setPopoverVisible(false);
			return;
		}

		if ((!value && !changedItem) || popoverVisible) {
			return;
		}

		value = transformSBCtoDBC(value);

		let reg = /^\d+$/; //以数字开头和结尾的

		if ((!reg.test(value) || value === -0) && key == 'quantityInMin') {
			changedItem[key] = 0;
			changedItem.quantityError = true;
		} else {
			//设置 同种 基础物资条码管控序列号不可以重复，非条码管控批号不可重复
			changedItem[key] = typeof value === 'number' ? value : value.trim();
			if (key === 'lotNum' || key == 'serialNumber') {
				shippingGoodsList[index] = changedItem;
				setShippingGoodsList([...shippingGoodsList]);
				if (key == 'serialNumber') {
					checkSerialNumber(changedItem.goodsId);
				}
			}
			changedItem.quantityError = false;
		}
		if (key === 'quantityInMin') {
			form.setFieldsValue({
				[formKey]: value,
			});
			changedItem.change = true; // 判断数量是否更改
		}

		// gs1
		if (key === 'gs1Value') {
			let udiObj = udiObjRef.current;
			if (udiCode && udiObj[udiCode] && udiCode !== value) {
				delete udiObjRef.current[udiCode];
			}
			parseGs1(index);
			changedItem.gs1Value = value;
		}
		isRequired(changedItem);
		if (currGoodsId) {
			let currTotalCountInMin = getCurrTotalCountInMin(currGoodsId);
			setCurrTotalCountInMin(currTotalCountInMin);
			upDataSelectValue(currGoodsId);
		}
		if (key !== 'gs1Value') {
			let listArr = [];
			for (let i = 0, len = shippingGoodsList.length; i < len; i++) {
				listArr.push(i == index ? changedItem : shippingGoodsList[i]);
			}
			setShippingGoodsList(listArr);
		}

		setTimeout(() => {
			if (changedItem.barcodeControlled) {
				checkSerialNumber(changedItem.goodsId);
			} else {
				checkLotNum(changedItem.goodsId, index, changedItem.lotNum as string, key);
			}
		}, 200);
	};

	// 获取当前对应goodsId数量
	const getCurrTotalCountInMin = (currGoodsId: number) => {
		let totalCount = 0;
		shippingGoodsList.forEach((item) => {
			const quantityInMin = parseInt((item.quantityInMin || '0').toString());
			if (item.goodsId == currGoodsId) {
				let count = 0;
				if (item.selectName == 'minUnitName') {
					// 小单位
					count = quantityInMin || 0;
				} else {
					// 大单位
					count = (quantityInMin || 0) * item.unitNum;
				}
				totalCount = totalCount + count;
			}
		});
		return totalCount;
	};

	//获取元素
	const getElement = () => {
		let tableBody =
			tableBodyRef.current ||
			document?.getElementById('tableEle')?.querySelector('.ant-table-body');
		let trHeight = tableBody?.querySelector('.ant-table-row')?.clientHeight || 47;
		if (!tableBodyRef.current && tableBody) {
			tableBodyRef.current = tableBody;
		}
		return { tableBody, trHeight };
	};

	// 检验gs1
	const parseGs1 = async (index: number) => {
		let record = shippingGoodsList[index];
		const { gs1Value, goodsId, uniqId, listId } = record;
		const cover =
			configValue.length &&
			configValue.map((item: string | RegExp) => gs1Value && gs1Value.replaceAll(item, ''));
		let eleName = `${goodsId}${uniqId}`;
		record.gs1Validating = false;
		if (!record['gs1Value']) {
			record.gs1CodeError = false;
			setShippingGoodsList([...shippingGoodsList]);
			return;
		}

		let udiCode = cover[0],
			udiObj = udiObjRef.current,
			gs1Obj: Record<string, any> = {};
		if (udiObj[udiCode] && udiCode !== record?.udiCode) {
			form.resetFields([`udiCode${eleName}`]);
			notification.warning(`当前UDI ${udiCode} 已被使用,请确认`);
			let len = shippingGoodsList.length;
			const { tableBody, trHeight } = getElement();
			for (let i = 0; i < len; i++) {
				if (shippingGoodsList[i].udiCode == udiCode) {
					let top = i * trHeight;
					tableBody?.scrollTo(0, top);
					break;
				}
			}
			if (record.udiCode) {
				delete udiObjRef.current[record.udiCode];
			}
			clearInfo(index, true);
			setRepeatUdi(udiCode);
			return;
		}

		record.gs1Value = cover[0];
		try {
			let res = await getParseUdiCode({ udiCode });
			if (res && res.code == 0) {
				gs1Obj = res.data;
				if (!gs1Obj) {
					clearInfo(index);
					return;
				}
				const { di = '', codeType = '' } = gs1Obj;
				let goodDi = goodDiObj[record.goodsId];

				if (goodDi && di) {
					const { diCode, maDiCode, code69 } = goodDi;
					let isPass = false;
					if (
						(codeType === 'GTIN14' && diCode && diCode !== di) ||
						(codeType == 'CODE69' && code69 && code69 !== di) ||
						(codeType == 'MA' && maDiCode && maDiCode !== di)
					) {
						isPass = true;
					}

					if (
						!record.barcodeControlled &&
						checkLotNum(record.goodsId, index, gs1Obj.lot, 'gs1Value')
					) {
						return;
					}

					if (isPass) {
						form.resetFields([`udiCode${eleName}`]);
						notification.warning(`当前扫描UDI解析的DI 与${fields.goods}绑定的DI 不一致，请确认`);
						clearInfo(index, true);
						return;
					}
				} else {
					record.gs1CodeError = false;
				}
			} else if (res && res.code == 1) {
				form.resetFields([`udiCode${eleName}`]);
				return;
			}
		} finally {
		}

		if (!udiObj[udiCode]) {
			udiObj[udiCode] = udiCode;
			udiObjRef.current = udiObj;
		}

		record.udiCode = cover[0];
		record.lot = gs1Obj.lot;
		record.serial = gs1Obj.serialNumber;
		if (gs1Obj?.lot) {
			record.lotNum = gs1Obj?.lot;
			form.setFieldsValue({
				[`lotNum${eleName}`]: gs1Obj?.lot || '',
				[`lotNumSerialNumber${eleName}`]: '',
			});
		} else {
			form.setFieldsValue({
				[`lotNum${eleName}`]: '',
				[`lotNumSerialNumber${eleName}`]: '',
			});
		}
		if (gs1Obj?.serialNumber) {
			// 包含21码的基础物资数量只能是1，一物一码
			// record.selectName = 'minUnitName';
			record.quantityInMin = 1;
			record.serialNumber = gs1Obj?.serialNumber;
			record.change = true;
		}
		if (record.barcodeControlled) {
			form.setFieldsValue({
				[`lotNumSerialNumber${eleName}`]: '',
				[`serialNumber${eleName}`]: gs1Obj?.serialNumber || '',
			});
		}
		form.setFieldsValue({
			[`quantityInMin${eleName}`]: gs1Obj?.serialNumber ? 1 : '',
		});

		// 过期时间
		if (gs1Obj?.expirationDate) {
			let data = gs1Obj?.expirationDate;
			if (data == 'Invalid Date') {
				record.expirationDate = undefined;
				form.setFieldsValue({ [`expirationDate${eleName}`]: undefined });
				return;
			}
			data = parseDate(gs1Obj?.expirationDate);
			record.expirationDate = data.valueOf();
			form.setFieldsValue({
				[`expirationDate${eleName}`]: moment(data.valueOf()),
			});
		} else {
			form.setFieldsValue({ [`expirationDate${eleName}`]: undefined });
		}

		// 生产时间
		if (gs1Obj?.manufactureDate) {
			let data = gs1Obj?.manufactureDate;
			if (data == 'Invalid Date') {
				record.expirationDate = undefined;
				record.sterilizationDate = undefined;
				form.setFieldsValue({
					[`productionDate${eleName}`]: undefined,
					[`sterilizationDate${eleName}`]: undefined,
				});
				return;
			}
			data = parseDate(gs1Obj?.manufactureDate);
			record.productionDate = data.valueOf();
			record.sterilizationDate = data.valueOf();
			form.setFieldsValue({
				[`productionDate${eleName}`]: moment(data.valueOf()),
				[`sterilizationDate${eleName}`]: moment(data.valueOf()),
			});
		} else {
			form.setFieldsValue({
				[`productionDate${eleName}`]: undefined,
				[`sterilizationDate${eleName}`]: undefined,
			});
		}
		let listArr = [];
		for (let i = 0, len = shippingGoodsList.length; i < len; i++) {
			listArr.push(i == index ? record : shippingGoodsList[i]);
		}
		setShippingGoodsList(listArr);
	};

	// 日期选择
	const onDateChange = (mom: any, dateString: string, index: number, key: string) => {
		let changeItem = shippingGoodsList[index];
		let value = moment(dateString).valueOf();
		changeItem[key] = value || undefined;
		if (key === 'productionDate' && !changeItem['sterilizationDate']) {
			changeItem['sterilizationDate'] = value || undefined;
			form.setFieldsValue({
				[`sterilizationDate${changeItem.goodsId}${changeItem.uniqId}`]: value ? mom : undefined,
			});
		}
		isRequired(changeItem);
		setShippingGoodsList([...shippingGoodsList]);
	};

	// 判断是否必填
	const isRequired = (record: ShippingList) => {
		if (
			record.lotNum ||
			// record.serialNumber ||
			record.productionDate ||
			record.expirationDate ||
			record.sterilizationDate ||
			record.quantityInMin ||
			record.udiCode ||
			record.gs1Value
		) {
			record.required = true;
		} else {
			record.required = false;
		}
		return record;
	};

	const options: DescriptionsItemProps[] = [
		{
			label: '期望到货时间',
			dataIndex: 'expectedTime',
			render: (text) => (text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-'),
		},
		{
			label: '库房',
			dataIndex: 'storageAreaName',
		},
		{
			label: '库房地址',
			dataIndex: 'storageAreaAddress',
		},
	];

	//导入下载
	const downloadTemp = async () => {
		try {
			let res = await dowdownTemplate(singlePurchaseOrderInfo.id);
			if (res && res.code === 0) {
				let result = res.data;
				window.open(`${getUrl()}${result}?filename=${result}`);
			}
		} catch {}
	};

	// 导入上传
	const handleChange = (info: Record<string, any>) => {
		// setUploading(true);
		if (info.file.status === 'done') {
			if (info.file?.response?.code === 1) {
				notification.error(`${info.file?.response?.msg}`);
				setUploading(false);
			} else {
				let result = info.file?.response?.data;
				handleData(result);
				const { errorList } = result;
				if (!errorList) {
					notification.success(`导入成功`);
				}
				setUploading(false);
			}
		} else if (info.file.status === 'error') {
			notification.error(`导入失败`);
			setUploading(false);
		}
	};

	//处理上传返回的数据
	const handleData = (data: Record<string, any>) => {
		const { errorExcel = '', errorList = [], orderResult } = data;
		if (errorList && errorList.length) {
			errorData.current = {
				errorTitle: '配送单',
				errorList,
			};
			setTempleteVisible(true);
			errorPath.current = errorExcel;
		} else if (orderResult) {
			let goodDi = {};
			errorPath.current = '';
			let udiObj = udiObjRef.current;
			let shipGoodsList = (orderResult?.details || []).map(
				(item: Record<string, any>, i: number) => {
					const { udiCode } = item;
					item.presenter = item.keyItem;
					item.gs1Value = udiCode;
					item.isLoadingData = true;
					// 输入框初始值
					item.quantityInMinFixed = item.realQuantity;
					item.quantityInMin = item.realQuantity;
					const { diCode, maDiCode, goodsId, code69 } = item;
					item.listId = new Date().getTime() + '-' + goodsId + i;
					goodDi[goodsId] = {
						diCode: diCode || '',
						maDiCode: maDiCode || '',
						code69: code69 || '',
					};

					if (!udiObj[udiCode]) {
						udiObj[udiCode] = udiCode;
					}
					item.serialNumber = item.serialNo;
					if (i != 0 && item.goodsId === orderResult?.details[i - 1].goodsId) {
						item.uniqId = new Date().getTime() + i;
					}
					return item;
				},
			);

			udiObjRef.current = udiObj;
			setGoodDiObj(goodDi);
			setShippingGoodsList([...shipGoodsList]);
			if (form) form.resetFields();
			form.setFieldsValue({
				expressNo: orderResult.remark,
				invoiceCode: orderResult.invoiceNumber,
				deliveryUserName: orderResult.shippingPerson,
				deliveryUserPhone: orderResult.contactPhone,
				expectedDeliveryDate: orderResult.shippingTime
					? moment(new Date(orderResult.shippingTime))
					: undefined,
				ambivalentPlatformOrder: orderResult.ambivalentPlatformOrder ? 'true' : 'false',
				invoiceNo: orderResult.invoiceNo,
				invoicingDate: orderResult.invoicingDate,
				taxRate: orderResult.taxRate,
				invoiceAmount: orderResult.invoiceAmount
					? convertPriceWithDecimal(orderResult.invoiceAmount)
					: undefined,
			});
		}
	};

	const templeteColumn = [
		{
			width: 'L',
			title: '列表行',
			dataIndex: 'errorLine',
			ellipsis: true,
		},
		{
			width: 'L',
			title: '字段名',
			dataIndex: 'errorColumnName',
			ellipsis: true,
		},
		{
			width: 'L',
			title: '错误原因',
			dataIndex: 'errorReason',
			ellipsis: true,
		},
	];
	return (
		<>
			<Modal
				visible={visible}
				title={`${
					actionType === 'add'
						? accessName['handled_distributor_make']
						: accessName['handled_edit_shipping_order']
				} - 订单编号：${singlePurchaseOrderInfo?.orderCode}`}
				maskClosable={false}
				onCancel={() => {
					setShippingGoodsList([]);
					form.resetFields();
					setModalVisible(false);
				}}
				onOk={(e: any) => shipModalSubmit(e)}
				destroyOnClose={true}
				className='ant-detail-modal shippingModal'
				footer={
					access['handled_distributor_make'] ? (
						<Button
							key='submit'
							type='primary'
							onClick={() => shipModalSubmit()}
							className='modalSubmit'
							loading={submitting}>
							提交
						</Button>
					) : null
				}>
				<Form form={form}>
					<div>
						<Descriptions
							options={options}
							data={singlePurchaseOrderInfo || {}}
							optionEmptyText='-'
						/>
					</div>
					<Row style={{ marginTop: '16px' }}>
						<Col
							lg={6}
							md={8}
							xs={12}>
							<FormItem
								label='配送人员'
								name='deliveryUserName'
								// rules={[{ required: true, message: '请输入' }]}
							>
								<Input
									placeholder='请输入配送人员'
									style={{ width: '80%' }}
									maxLength={20}
								/>
							</FormItem>
						</Col>
						<Col
							lg={6}
							md={8}
							xs={12}>
							<FormItem
								label='联系电话'
								name='deliveryUserPhone'
								// rules={[{ required: true, message: '请输入' }]}
							>
								<Input
									placeholder='请输入配送人员联系电话'
									style={{ width: '80%' }}
									maxLength={15}
								/>
							</FormItem>
						</Col>
						<Col
							lg={6}
							md={8}
							xs={12}>
							<FormItem
								label='配送时间'
								name='expectedDeliveryDate'
								initialValue={moment(getStartTime())}
								rules={[{ required: true, message: '请输入' }]}>
								<DatePicker
									format={['YYYY-MM-DD', 'YYYY/MM/DD']}
									style={{ width: '80%' }}
									disabledDate={(current) => current.valueOf() < Date.now() - 24 * 60 * 60 * 1000}
								/>
							</FormItem>
						</Col>
						<Col
							lg={6}
							md={8}
							xs={12}>
							<FormItem
								label='发票编号'
								name='invoiceCode'
								rules={[{ required: isWX ? invoiceRequired : false, message: '请输入发票编号' }]}>
								<Input
									placeholder='请输入发票编号'
									maxLength={30}
									style={{ width: '80%' }}
									onChange={(e) => {
										const value = e.target.value;
										const invoicingDateValue = form.getFieldValue('invoicingDate');
										const requiredValue = !!value || invoicingDateValue;
										setInvoiceRequired(requiredValue);
										if (!requiredValue) {
											form.validateFields();
										}
									}}
								/>
							</FormItem>
						</Col>
						<Col
							lg={6}
							md={8}
							xs={12}>
							<FormItem
								label='发票代码'
								name='invoiceNo'
								rules={[{ pattern: new RegExp('^[a-zA-Z0-9]*$'), message: '请输入字母或数字' }]}>
								<Input
									placeholder='请输入发票代码'
									maxLength={20}
									style={{ width: '80%' }}
								/>
							</FormItem>
						</Col>
						<Col
							lg={6}
							md={8}
							xs={12}>
							<FormItem
								label='开票日期'
								name='invoicingDate'
								rules={[{ required: isWX ? invoiceRequired : false, message: '请选择开票日期' }]}>
								<DatePicker
									format={['YYYY-MM-DD', 'YYYY/MM/DD']}
									style={{ width: '80%' }}
									onChange={(value) => {
										const invoiceCodeValue = form.getFieldValue('invoiceCode');
										const requiredValue = !!value || invoiceCodeValue;
										setInvoiceRequired(requiredValue);
										if (!requiredValue) {
											form.validateFields();
										}
									}}
									disabledDate={(current) =>
										current && current >= moment(getEndTime()).endOf('day')
									}
								/>
							</FormItem>
						</Col>
						<Col
							lg={6}
							md={8}
							xs={12}>
							<FormItem
								label='税 率'
								name='taxRate'>
								<Select
									style={{ width: 150 }}
									allowClear
									placeholder='请选择税率'
									style={{ width: '80%' }}>
									{taxRate.map((item) => {
										return <Option value={item.value}>{item.label}</Option>;
									})}
								</Select>
							</FormItem>
						</Col>
						<Col
							lg={6}
							md={8}
							xs={12}>
							<FormItem
								label='发票金额'
								name='invoiceAmount'
								rules={[{ validator: validateInvoiceAmount }]}>
								<Input
									placeholder='请输入发票金额'
									style={{ width: '80%' }}
									suffix='元'
								/>
							</FormItem>
						</Col>
					</Row>
					<Row className='detailsBorderAndMargin'>
						<Col
							lg={6}
							md={8}
							xs={12}>
							<FormItem
								label='备注信息'
								name='expressNo'>
								<Input
									placeholder='请输入备注信息'
									style={{ width: '80%' }}
									maxLength={20}
								/>
							</FormItem>
						</Col>
						{isWX &&
							WEB_PLATFORM === 'MS' && ( // 判断是否吴兴耗材
								<Col
									lg={6}
									md={8}
									xs={12}>
									<FormItem
										label='两定平台订单'
										name='ambivalentPlatformOrder'
										rules={[{ required: true, message: '请选择' }]}>
										<Radio.Group className={styles.radioGroup}>
											<Radio.Button value='true'>是</Radio.Button>
											<Radio.Button value='false'>否</Radio.Button>
										</Radio.Group>
									</FormItem>
								</Col>
							)}
					</Row>
					<div id='tableEle'>
						<ProTable
							rowClassName={(record) => {
								const { barcodeControlled, serialNumber, udiCode } = record;
								return repeatUdi && udiCode == repeatUdi
									? `${styles.repeatUdi}`
									: repeatLotNum &&
									  record.lotNum == repeatLotNum &&
									  (!barcodeControlled || (barcodeControlled && !serialNumber))
									? `${styles.repeatLotNum}`
									: '';
							}}
							dataSource={[...shippingGoodsList]}
							columns={columnsShipModal}
							scroll={{ y: 300 }}
							options={{ density: false, fullScreen: false, setting: false }}
							rowKey={(record) => record.goodsId + '' + record.uniqId}
							loading={loading}
							onRow={(record) => ({
								onMouseEnter: () => {
									const currTotalCountInMin = getCurrTotalCountInMin(record.goodsId);
									setCurrTotalCountInMin(currTotalCountInMin);
									upDataSelectValue(record.goodsId);
								}, // 鼠标移入行
							})}
							toolBarRender={() => [
								access.shipping_order_template_export && (
									<a onClick={downloadTemp}>
										<Button type='primary'>导入模板下载</Button>
									</a>
								),
								access.shipping_order_template_import && (
									<Upload
										name='file'
										maxCount={1}
										data={{ orderId: singlePurchaseOrderInfo.id }}
										showUploadList={false}
										action={`${getUrl()}${importExcelfile}`}
										onChange={handleChange}
										beforeUpload={beforeUpload}
										withCredentials={true}
										listType='text'
										headers={{ 'X-AUTH-TOKEN': sessionStorage.getItem('x_auth_token') || '' }}>
										<Button
											loading={uploading}
											type='primary'>
											导入上传
										</Button>
									</Upload>
								),
							]}
						/>
					</div>
				</Form>
			</Modal>
			{templeteVisible && (
				<TemplateErrorModal
					title='导入模板错误'
					footer={[
						<Button
							key='export'
							type='primary'
							onClick={() => window.open(`${getUrl()}${errorPath.current}`)}>
							解析文件下载
						</Button>,
					]}
					data={errorData.current}
					columns={templeteColumn}
					visible={templeteVisible}
					setVisible={setTempleteVisible}
					PromptInformation='* 点击“解析文件下载”下载系统标注错误位置的文件'
				/>
			)}
		</>
	);
};

export default connect(
	({
		loading,
		purchaseOrder,
	}: {
		purchaseOrder: PurchaseOrderNewController.OrderDataType;
		loading: { effects: { [key: string]: boolean } };
	}) => ({
		purchaseOrder,
		submitting: loading.effects['purchaseOrder/makeShippingOrder'],
		loading: loading.effects['purchaseOrder/queryShippingData'],
	}),
)(MakingShippingOrder);
