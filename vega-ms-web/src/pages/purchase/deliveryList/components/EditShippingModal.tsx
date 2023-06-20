import Descriptions from '@/components/Descriptions';
import { DescriptionsItemProps } from '@/components/Descriptions/typings';
import ProTable from '@/components/ProTable';
import ScanInput from '@/components/ScanInput/ScanInput';
import { findConfig as UDIParsing } from '@/services/config';
import { getParseUdiCode } from '@/services/gsp';
import { accessNameMap, scrollTable, transformSBCtoDBC, getEndTime } from '@/utils';
import { dealPackNum } from '@/utils/dataUtil';
import { formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import {
	ExclamationCircleFilled,
	MinusCircleOutlined,
	PlusCircleOutlined,
} from '@ant-design/icons';
import { ProColumns } from '@ant-design/pro-table/lib/typing';
import {
	Button,
	Col,
	DatePicker,
	Form,
	Input,
	Modal,
	Popover,
	Radio,
	Row,
	Tooltip,
	Select,
} from 'antd';
import { cloneDeep, debounce } from 'lodash';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { connect, useAccess, useModel } from 'umi';
import styles from '../../index.less';
import { taxRate } from '@/constants/dictionary';
import { convertPriceWithDecimal } from '@/utils/format';
import { validateInvoiceAmount } from '@/utils/validator';

type ShippingList = PurchaseOrderNewController.ShippingList;
const FormItem = Form.Item;
const { Option } = Select;
const isWX = sessionStorage.getItem('hospital_id') === '107'; //是否为吴兴医院
const EditShippingOrder = ({
	submitting,
	loading,
	delivery,
	dispatch,
	visible,
	setModalVisible,
	...props
}: ShippingOrderController.DeliveryProps) => {
	const access = useAccess();
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const tableBodyRef = useRef<Element>();
	const udiObjRef = useRef<Record<string, any>>({});
	const [repeatUdi, setRepeatUdi] = useState(''); //设置重复udi
	const [repeatLotNum, setRepeatLotNum] = useState(''); //设置重复批号
	const [currTotalCountInMin, setCurrTotalCountInMin] = useState<number>(0);
	const [optionList, setOptionList] = useState<ShippingList[]>([]);
	const [shippingGoodsList, setShippingGoodsList] = useState<ShippingList[]>([]);
	const { singleDeliveryInfo, getList, handleType, setHandleType } = props;
	const [popoverVisible, setPopoverVisible] = useState<boolean>(false);
	const [configValue, setConfigValue] = useState([]);
	const [goodDiObj, setGoodDiObj] = useState<Record<string, any>>({});
	const accessName = accessNameMap(); // 权限名称
	const [invoiceRequired, setInvoiceRequired] = useState<boolean>(false);

	useEffect(() => {
		if (singleDeliveryInfo) {
			setInvoiceRequired(!!singleDeliveryInfo.invoicingDate || !!singleDeliveryInfo.invoiceCode);
		}
	}, [singleDeliveryInfo]);

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

	useEffect(() => {
		if (handleType === 'view') return;

		let goodDi = {};
		let udiObj = udiObjRef.current;
		const loadList = delivery.shippingInfo.details;
		const groupList: ShippingOrderController.DetailData[] = delivery.goodsGroupList;
		let detailOther: any[] = cloneDeep(loadList);

		let shipGoodsList: any[] = groupList.map((item, i) => {
			const { udiCode } = item;
			item.isLoadingData = true;
			// 输入框初始值
			item.quantityInMinFixed = item.quantityInMin;
			item.gs1Value = udiCode;
			item.udiCode = udiCode;
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
			return item;
		});
		detailOther = detailOther.filter((item) => item.goodsRemainQuantityInMin !== 0);
		detailOther.map((itemO, index: number) => {
			groupList.map((itemL) => {
				if (itemL.goodsId == itemO.goodsId) {
					detailOther = index === 0 ? [] : detailOther.slice(index, 1);
				}
			});
		});
		udiObjRef.current = udiObj;
		setGoodDiObj(goodDi);
		shipGoodsList = shipGoodsList.concat(detailOther);
		setShippingGoodsList(setKeyWithTime(shipGoodsList));
		setTimeout(() => {
			if (form) form.resetFields();
		}, 200);
	}, [handleType]);

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
	const setKeyWithTime = (list: ShippingList[]) => {
		let arr: ShippingList[] = [];
		list.map((item, index) => {
			if (index != 0 && item.goodsId === list[index - 1].goodsId) {
				item.uniqId = new Date().getTime() + index;
			}
			item.gs1Value = item.udiCode;
			arr.push(item);
		});
		return arr;
	};

	const columns: ProColumns<ShippingList>[] = [
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
				const { goodsId, uniqId, udiCode, listId } = record;
				let eleName = `udiCode${goodsId}${uniqId}`;
				return record.goodsName ? (
					<div
						className={record.gs1CodeError && !record.gs1Validating ? 'has-error' : ''}
						style={{ width: '100%' }}>
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
									// onPressEnter={(value) => {
									//   handleChangeGoodsDetails(index, value, 'gs1Value');
									// }}
									onCompositionStart={() => {
										setPopoverVisible(true);
									}}
									value={record.udiCode}
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
									rules={[{ required: lotRequired }]}
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
						rules={[{ required: record.required || false, message: '  ' }]}
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
						rules={[{ required: record.required || false, message: ' ' }]}
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
		// {
		//   title: '包装规格',
		//   dataIndex: 'unitNum',
		//   key: 'unitNum',
		//   width: 100,
		//   renderText: (text: number, record) => {
		//     return (
		//       <span>
		//         {text ? formatUnitNum(text, record.minUnitName, record.purchaseUnitName) : ''}
		//       </span>
		//     );
		//   },
		// },
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
			className: 'quantityInMin',
			width: 150,
			render: (text, record, index) => {
				// 单位转换
				const { goodsId, uniqId, subtotalQuantity } = record;
				let eleName = `quantityInMin${goodsId}${uniqId}`;
				const { quantityInMinFixed, orderQuantity, unitNum, minUnitName } = record;
				const countTotal = (Number(subtotalQuantity) || Number(quantityInMinFixed)) * unitNum;
				let needNum: number = currTotalCountInMin ? countTotal - currTotalCountInMin : countTotal; // 需要填入的数据
				let numInPurchase = parseInt((Math.abs(needNum) / unitNum).toString());
				let toolTipTitle = '';
				let total =
					subtotalQuantity || (record.goodsQuantityInPurchase || orderQuantity || 0) * unitNum;
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
					<Tooltip
						title={toolTipTitle}
						placement='rightTop'>
						<FormItem
							className='mg0'
							name={eleName}
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
										eleName,
										record.goodsId,
										record,
									)
								}
								onMouseOver={(e: Record<string, any>) =>
									handleChangeGoodsDetails(
										index,
										e.target.value,
										'quantityInMin',
										eleName,
										record.goodsId,
										record,
									)
								}
								onMouseEnter={(e: Record<string, any>) =>
									handleChangeGoodsDetails(
										index,
										e.target.value,
										'quantityInMin',
										eleName,
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
		//   dataIndex: 'quantity',
		//   key: 'quantity',
		//   width: 120,
		//   ellipsis: true,
		//   render: (text, record) => {
		//     let quantity = 0;
		//     if (record.isLoadingData && record.quantityInMin == record.quantityInMinFixed) {
		//       quantity = record.quantityInMinFixed;
		//     } else {
		//       quantity = record.quantityInMin;
		//     }
		//     return <span>{quantity ? quantity + record.minUnitName : '-'}</span>;
		//   },
		// },
		{
			title: '产品注册证号',
			dataIndex: 'registrationNum',
			key: 'registrationNum',
			width: 120,
			ellipsis: true,
			renderText: (text: string) => <span>{text || '-'}</span>,
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
			render: (text, record, index) => {
				return (
					<div className='operation'>
						<span
							onClick={() => clearInfo(index)}
							className='handleLink'>
							清空
						</span>
					</div>
				);
			},
		},
	];

	const onGs1MouseOut = (record: ShippingList) => {
		if (record.gs1CodeError && !record.gs1Value) record.gs1Validating = true;
	};

	const upDataSelectValue = (id: number) => {
		const oldShipList = [...optionList];
		const newShipList: any = oldShipList.map((item) =>
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
		// // 过滤未配置数据
		let shippingGoodsItems = shippingGoodsList.filter(
			(item) =>
				item.lotNum ||
				item.serialNumber ||
				item.productionDate ||
				item.expirationDate ||
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
					notification.warning(`请检查${fields.baseGoods}配送数量！`);
					flag = true;
				}
				shippingGoodsItems.forEach((goods) => {
					// 如果有gs1code且包含21码或10码，基础物资数量为1
					// if (goods.udiCode && !goods.lotNum && goods.serialNumber) {
					//   goods.quantityInMin = 1;
					// }

					// 转换小单位
					goods.selectNum = goods.isLoadingData ? goods.quantityInMinFixed : goods.quantityInMin;

					// 检查基础物资数量和提交数量是否超出
					let detailsItem: Record<string, any> =
						shippingGoodsItems.filter((item) => item.goodsId == goods.goodsId)[0] || {};

					const needAll = detailsItem.subtotalQuantity || detailsItem.orderQuantity * goods.unitNum;

					if (needAll < goods.selectNum) {
						notification.warning(
							`${fields.baseGoods}[${detailsItem.goodsName}]可配送数量: [${needAll}${detailsItem.minUnitName}],实际配送数量:[${goods.selectNum}${goods.minUnitName}],数量超出！`,
						);
						flag = true;
					}
				});
				// 检查必填字段是否填写
				for (let i = 0; i < shippingGoodsItems.length; i++) {
					const goodProductionDate = shippingGoodsItems[i]['productionDate'];
					const goodExpirationDate = shippingGoodsItems[i]['expirationDate'];
					const goodSterilizationDate = shippingGoodsItems[i]['sterilizationDate'];
					if (shippingGoodsItems[i]['lotError']) {
						notification.warning('批号重复，请重新输入');
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
				// 类型是编辑/选型
				params = {
					items: cloneDeep(shippingGoodsItems).filter((goods) => {
						goods.diCode = '';
						goods.maDiCode = '';
						goods.code69 = '';
						goods.quantityInMin = goods.selectNum;
						if (goods.barcodeControlled) {
							goods.serialNo = goods.serialNumber;
						} else {
							delete goods.serialNumber;
						}
						delete goods.ais;
						delete goods.gs1CodeError;
						delete goods.gs1Validating;
						delete goods.gs1Value;
						return goods.quantityInMin != 0;
					}),
					shippingOrderId: singleDeliveryInfo.id,
					orderId: singleDeliveryInfo.purchaseOrderId,
					handleType,
					deliveryUserName,
					deliveryUserPhone,
					expectedDeliveryDate,
					expressNo,
					invoiceCode,
					surgicalPackageSelected,
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
					type: 'delivery/updateShippingOrder',
					payload: params,
					callback: (res: Record<string, any>) => {
						if (res && res.code === 0) {
							notification.success('操作成功');
							setShippingGoodsList([]);
							setModalVisible(false);
							setHandleType('view');
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
		};
	};

	// 清空
	const clearInfo = (index: number, isNoDeleteGs1Value?: boolean) => {
		let list = cloneDeep(shippingGoodsList);
		const item = list[index];
		const { udiCode, listId } = list[index];
		if (udiCode && !isNoDeleteGs1Value) {
			delete udiObjRef.current[udiCode];
		}
		let record = { ...item, ...clearObj(), lotNum: '' };
		let listArr = [];
		for (let i = 0, len = list.length; i < len; i++) {
			listArr.push(i == index ? record : list[i]);
		}
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
		setShippingGoodsList([...listArr]);
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
		const { goodsId, uniqId, barcodeControlled, udiCode } = changedItem;
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

		if (!value && key === 'gs1Value') {
			changedItem.udiCode = '';
			changedItem[key] = '';
		}

		value = transformSBCtoDBC(value);
		let reg = /^\d+$/; // 以数字开头和结尾的
		if ((!reg.test(value) || value === -0) && key == 'quantityInMin') {
			changedItem.isLoadingData = false;
			changedItem[key] = 0;
			changedItem.quantityError = true;
		} else {
			changedItem.isLoadingData = false;
			// 设置同种基础物资序列号不可以重复
			if (key === 'lotNum' || key == 'serialNumber') {
				// 已存在的序列号不可重复写

				changedItem[key] = typeof value === 'number' ? value : value.trim();
				shippingGoodsList[index] = changedItem;
				setShippingGoodsList([...shippingGoodsList]);
				if (key == 'serialNumber') {
					checkSerialNumber(changedItem.goodsId);
				}
			}
			changedItem[key] = typeof value === 'number' ? value : value.trim();
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
			if (barcodeControlled) {
				checkSerialNumber(changedItem.goodsId);
			} else {
				checkLotNum(changedItem.goodsId, index, changedItem.lotNum, key);
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
					// 当基础物资有quantityInMin时，需要判断quantityInMin的值是否有前端操作更新，通过change判断。如果已更新，则需要更新quantityInMin * unitNum。否则只需要使用后端返回的quantityInMin的值。
					if (item.quantityInMin) {
						count = quantityInMin * item.unitNum;
					} else {
						count = 0;
					}
				}
				totalCount = totalCount + count;
			}
		});
		return totalCount;
	};

	// 检验gs1
	const parseGs1 = async (index: number) => {
		let record = shippingGoodsList[index];
		const { gs1Value, goodsId, uniqId, listId } = record;
		let name = `${goodsId}${uniqId}`;
		const cover =
			configValue.length &&
			configValue.map((item: string | RegExp) => gs1Value && gs1Value.replaceAll(item, ''));
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
			form.resetFields([`udiCode${name}`]);
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
		record.udiCode = gs1Obj.gs1Code;
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
						form.resetFields([`udiCode${name}`]);
						notification.warning(`当前扫描UDI解析的DI 与${fields.goods}绑定的DI 不一致，请确认`);
						clearInfo(index, true);
						return;
					}
				} else {
					record.gs1CodeError = false;
				}
			} else if (res && res.code == 1) {
				form.resetFields([`udiCode${name}`]);
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
				[`lotNum${name}`]: gs1Obj?.lot || '',
			});
		} else {
			form.setFieldsValue({ [`lotNum${name}`]: '' });
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
				[`lotNumSerialNumber${name}`]: '',
				[`serialNumber${name}`]: gs1Obj?.serialNumber || '',
			});
		}

		form.setFieldsValue({
			[`quantityInMin${name}`]: gs1Obj?.serialNumber ? 1 : '',
		});

		// 过期时间
		if (gs1Obj?.expirationDate) {
			let data = gs1Obj?.expirationDate;
			if (data == 'Invalid Date') {
				record.expirationDate = undefined;
				form.setFieldsValue({ [`expirationDate${name}`]: undefined });
				return;
			}
			data = parseDate(gs1Obj?.expirationDate);
			record.expirationDate = data.valueOf();
			form.setFieldsValue({
				[`expirationDate${name}`]: moment(data.valueOf()),
			});
		} else {
			form.setFieldsValue({ [`expirationDate${name}`]: undefined });
		}

		// 生产时间
		if (gs1Obj?.manufactureDate) {
			let data = gs1Obj?.manufactureDate;
			if (data == 'Invalid Date') {
				record.expirationDate = undefined;
				record.sterilizationDate = undefined;
				form.setFieldsValue({
					[`productionDate${name}`]: undefined,
					[`sterilizationDate${name}`]: undefined,
				});
				return;
			}
			data = parseDate(gs1Obj?.manufactureDate);
			record.productionDate = data.valueOf();
			record.sterilizationDate = data.valueOf();
			form.setFieldsValue({
				[`productionDate${name}`]: moment(data.valueOf()),
				[`sterilizationDate${name}`]: moment(data.valueOf()),
			});
		} else {
			form.setFieldsValue({
				[`productionDate${name}`]: undefined,
				[`sterilizationDate${name}`]: undefined,
			});
		}

		let listArr = [];
		for (let i = 0, len = shippingGoodsList.length; i < len; i++) {
			listArr.push(i == index ? record : shippingGoodsList[i]);
		}
		setShippingGoodsList(listArr);
	};

	// 日期选择
	const onDateChange = (
		mom: moment.Moment | null,
		dateString: string,
		index: number,
		key: string,
	) => {
		let changeItem = shippingGoodsList[index];
		const value = moment(dateString).valueOf();
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

	const descriptionsOptions: DescriptionsItemProps[] = [
		{
			label: '期望到货时间2',
			dataIndex: 'expectedTime',
			render: (text: number) => (text ? moment(new Date(text)).format('YYYY/MM/DD HH:mm:ss') : '-'),
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

	return (
		<Modal
			visible={visible}
			title={
				handleType === 'add'
					? accessName['handled_add_shipping_order']
					: accessName['handled_edit_shipping_order']
			}
			onCancel={() => {
				setModalVisible(false);
				form.resetFields();
				setHandleType('view');
				setShippingGoodsList([]);
			}}
			footer={
				access['add_shipping_order'] ? (
					<Button
						key='submit'
						type='primary'
						onClick={() => shipModalSubmit()}
						className='modalSubmit'
						loading={submitting}>
						提交
					</Button>
				) : null
			}
			maskClosable={false}
			destroyOnClose={true}
			className='ant-detail-modal shippingModal'>
			<Form
				form={form}
				initialValues={{
					deliveryUserName: singleDeliveryInfo.deliveryUserName,
					deliveryUserPhone: singleDeliveryInfo.deliveryUserPhone,
					expectedDeliveryDate: moment(new Date(singleDeliveryInfo.expectedDeliveryDate)),
					expressNo: singleDeliveryInfo.expressNo,
					invoiceCode: singleDeliveryInfo.invoiceCode,
					ambivalentPlatformOrder: singleDeliveryInfo.ambivalentPlatformOrder ? 'true' : 'false',
					invoiceNo: singleDeliveryInfo.invoiceNo,
					invoicingDate: singleDeliveryInfo.invoicingDate
						? moment(new Date(singleDeliveryInfo.invoicingDate))
						: undefined,
					taxRate: singleDeliveryInfo.taxRate,
					invoiceAmount: singleDeliveryInfo.invoiceAmount
						? convertPriceWithDecimal(singleDeliveryInfo.invoiceAmount)
						: undefined,
				}}>
				<div>
					<Descriptions
						options={descriptionsOptions}
						data={singleDeliveryInfo}
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
								placeholder='请输入配送人'
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
								placeholder='请输入配送人联系电话'
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
							rules={[{ required: true, message: '请输入' }]}>
							<DatePicker
								format={['YYYY-MM-DD', 'YYYY/MM/DD']}
								style={{ width: '80%' }}
								disabledDate={(current) => {
									return current.valueOf() < Date.now() - 24 * 60 * 60 * 1000;
								}}
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
								disabledDate={(current) => current && current >= moment(getEndTime()).endOf('day')}
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
					{isWX && WEB_PLATFORM === 'MS' && (
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
						dataSource={shippingGoodsList}
						columns={columns}
						pagination={false}
						scroll={{ y: 300 }}
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
						options={{ density: false, fullScreen: false, setting: false }}
						rowKey={(record) => record.goodsId + '' + record.uniqId}
						onRow={(record) => {
							return {
								onMouseEnter: () => {
									let currTotalCountInMin = getCurrTotalCountInMin(record.goodsId);
									setCurrTotalCountInMin(currTotalCountInMin);
									upDataSelectValue(record.goodsId);
								},
							};
						}}
						loading={loading}
					/>
				</div>
			</Form>
		</Modal>
	);
};

export default connect(
	({
		loading,
		delivery,
	}: {
		delivery: ShippingOrderController.DeliveryDataType;
		loading: { effects: { [key: string]: boolean } };
	}) => ({
		delivery,
		submitting: loading.effects['delivery/updateShippingOrder'],
		loading:
			loading.effects['delivery/queryShippingData'] ||
			loading.effects['delivery/queryShippingGroup'],
	}),
)(EditShippingOrder);
