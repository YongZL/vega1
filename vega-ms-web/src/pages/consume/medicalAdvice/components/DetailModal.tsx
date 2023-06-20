import Descriptions from '@/components/Descriptions';
import { DescriptionsItemProps } from '@/components/Descriptions/typings';
import ProTable from '@/components/ProTable';
import ScanInput from '@/components/ScanInput/ScanInput';
import {
	chargeStatusTextMap,
	chargeStatusValueEnum,
	medicalAdviceStatusTextMap,
} from '@/constants/dictionary';
import { useDepartmentList } from '@/hooks/useDepartmentList';
import { findConfig as UDIParsing } from '@/services/config';
import { searchDate } from '@/services/consume';
import { lockGoods, medicalAdviceScanUdi, queryDetail } from '@/services/medicalAdvice';
import { accessNameMap, scrollTable, transformSBCtoDBC } from '@/utils';
import { formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import '@ant-design/compatible/assets/index.css';
import { ProColumns } from '@ant-design/pro-table/lib/typing';
import {
	Badge,
	Button,
	DatePicker,
	Divider,
	Form,
	Input,
	Modal,
	Select,
	Space,
	Statistic,
} from 'antd';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useAccess, useModel } from 'umi';
import BatchConsume from './BatchConsume';

type DetailListRecord = MedicalAdviceController.DetailListRecord;
type PropsType = MedicalAdviceController.DetailProps;

const FormItem = Form.Item;
const DetailModal: React.FC<PropsType> = ({
	isOpen,
	handleType,
	orderInfo,
	setIsOpen,
	getFormList,
}) => {
	const access = useAccess();
	const { fields } = useModel('fieldsMapping');
	const [form] = Form.useForm();
	const departmentList = useDepartmentList();
	const [loading, setLoading] = useState<boolean>(false);
	const [submitLoading, setSubmitLoading] = useState<boolean>(false);
	const [scanValue, setScanValue] = useState<string>('');
	const [warning, setWarning] = useState<boolean>(false);
	const [warningMsg, setWarningMsg] = useState<string>('');
	const [isDisabled, setIsDisabled] = useState<boolean>(false); //是否禁用扫码输入框
	const [list, setList] = useState<DetailListRecord[]>([]);
	const [listCopy, setListCopy] = useState<DetailListRecord[]>([]);
	const [inputVal, setInputVal] = useState<string>(orderInfo.implantSerialNumber || '');
	const [showConsumeModal, setShowConsumeModal] = useState<boolean>(false);
	const [scanGoodsInfo, setScanGoodsInfo] = useState<Record<string, any>>({});

	const accessNameMapList: Record<string, any> = accessNameMap();
	const handleTitle = {
		detail: accessNameMapList.department_medical_advice_detail,
		consume: accessNameMapList.department_medical_advice_scan,
		refunds: accessNameMapList.department_medical_advice_return,
	};

	const pattern = /[^\x00-\x80]/g;
	const Reg = () => {
		const regular = /^[a-zA-Z0-9_]{0,}$/;
		return regular.test(inputVal);
	};

	// 弹窗详情
	const getDetailInfo = async () => {
		setLoading(true);
		const res = await queryDetail({ adviceId: orderInfo.id });
		if (res && res.code === 0) {
			setList([...res.data]);
			setListCopy([...res.data]);
		}
		document.getElementById('scan_show')?.focus();
		setLoading(false);
	};

	// 关闭弹窗
	const modalCancel = (update: boolean) => {
		setScanValue('');
		setList([]);
		setIsOpen(false);
		if (update) getFormList();
	};

	// 撤回
	const unConsume = async (record: DetailListRecord) => {
		const newList = [...list];
		const newListCopy = [...listCopy];

		newList.map((item, index: number) => {
			if (item.medicalChargeId === record.medicalChargeId) {
				const newList2: DetailListRecord = newListCopy[index];
				if (orderInfo.stageType) {
					newList2.goodsName = '';
					newList2.manufacturerName = '';
					delete newList2.isScan;
					newList2.materialName = '';
					newList2.materialCode = '';
					newList2.model = '';
					newList2.specification = '';
					newList2.udiCode = '';
					newList2.distributorBeans = undefined;
					newList2.distributorName = '';
					newList2.distributorId = undefined;
					newList2.expirationDate = undefined;
					newList2.lotNum = '';
					newList2.productionDate = undefined;
					form.setFieldsValue({
						[record.medicalChargeId]: undefined,
						[`lotNum${record.medicalChargeId}`]: null,
						[`productionDate${record.medicalChargeId}`]: null,
						[`expirationDate${record.medicalChargeId}`]: null,
					});
				}
				newList[index] = newList2;
			}
		});

		setList(newList);
		setIsDisabled(false);
		notification.success('操作成功！');
	};

	// 扫码提交
	const scanSubmit: any = async (code: string) => {
		if (!code) return;
		const newList: any[] = [...list]; // 医嘱列表
		let barCode = !pattern.test(code) ? transformSBCtoDBC(code) : ''; // 物资条码

		// 跟台物资扫码处理
		if (orderInfo.stageType) {
			const res = await UDIParsing();
			if (res && res.code === 0) {
				const data = res.data.configValue?.split('&');
				const cover = data && data.length && data.map((item: any) => barCode.replaceAll(item, ''));
				barCode = cover[0];
			}

			const result = await medicalAdviceScanUdi({ udiCode: barCode });
			if (result && result.code === 0) {
				const data = result.data;
				if (!data.goodsName) return;
				if (list.some((item) => item.udiCode === data.udiCode && !data.isBatchConsume)) {
					setScanValue('');
					notification.warning(`此${fields.goods}已存在列表中`);
					return;
				}
				// 批量消耗
				if (
					data.isBatchConsume &&
					list.filter((item) => !(item.materialCode || item.status === 'consumed')).length > 1
				) {
					setScanGoodsInfo(data);
					setShowConsumeModal(true);
					setScanValue('');
					return;
				}
				// 单个消耗
				for (let index = 0; index < list.length; index++) {
					if (!list[index].materialCode) {
						list[index] = {
							...list[index],
							udiCode: data.udiCode,
							materialCode: data.materialCode,
							goodsName: data.goodsName,
							specification: data.specification,
							model: data.model,
							manufacturerName: data.manufacturerName,
							distributorBeans: data.distributorBeans ?? undefined,
							distributorName: data.distributorName ?? undefined,
							distributorId: data.distributorId ?? undefined,
							lotNum: data.lotNum,
							isLotNum: data.lotNum ? true : false,
							isProductionDate: data.productionDate ? true : false,
							isExpirationDate: data.expirationDate ? true : false,
							expirationDate: data.expirationDate ?? undefined,
							productionDate: data.productionDate ?? undefined,
							isScan: true,
						};
						break;
					}
				}
				// 扫码框禁用判断
				const isAllConsumedList = list.filter((item) => item.isScan || item.status === 'consumed');
				setIsDisabled(isAllConsumedList.length == list.length);
				setScanValue('');
				setList([...list]);
			}
		} else {
			// 非跟台物资扫码处理
			const params = {
				operatorBarcode: barCode,
				related: true,
				returnGoods: handleType === 'refunds',
				departmentId: orderInfo.spdDeptId,
			};
			const res = await searchDate(params);
			if (res && res.code === 0) {
				const data = res.data;
				if (!data) return;
				// 已上架/已下架/占用中 可消耗
				if (
					!['put_off_shelf', 'put_on_shelf', 'occupied'].includes(data.status) &&
					handleType !== 'refunds'
				) {
					setScanValue('');
					notification.error(`${fields.goods}状态不匹配，不可消耗`);
					return;
				}
				if (
					list.some((item) => item.operatorBarcode === data.operatorBarcode && !data.isBatchConsume)
				) {
					setScanValue('');
					notification.warning(`此${fields.goods}已存在列表中`);
					return;
				}
				// 只针对消耗，排除退费
				if (orderInfo.type != '1') {
					const filterLength = list.filter(
						(item) => item.operatorBarcode === data.operatorBarcode,
					).length;
					if (filterLength >= data.maximumConsumable) {
						setScanValue('');
						notification.warning(`${fields.goods}可用库存不足`);
						return;
					}
				}
				// 批量消耗
				if (
					data.isBatchConsume &&
					list.filter((item) => !(item.operatorBarcode || item.status === 'consumed')).length > 1
				) {
					setScanGoodsInfo(data);
					setShowConsumeModal(true);
					setScanValue('');
					return;
				}
				// 单个消耗
				let isLock = true;
				newList.map((items: any, index: number) => {
					if (!items.operatorBarcode) {
						if (isLock) {
							isLock = false;
							newList[index] = {
								...newList[index],
								...data,
								status: newList[index].status,
							};
						}
					}
				});
				// 扫码框禁用判断
				const isAllConsumedList = newList.filter((item) => item.operatorBarcode);
				setIsDisabled(isAllConsumedList.length == list.length);
				setList(newList);
				setScanValue('');
			}
		}
	};

	// 提交锁定
	const modalSubmit = async () => {
		form
			.validateFields()
			.then(async (values) => {
				if (!Reg()) {
					setWarning(true);
					setWarningMsg('追溯流水单号中不能包括中文和特殊符号!');
					return;
				}
				const param: Record<string, any>[] = [];
				list.map((item) => {
					const { stageType, id } = orderInfo;
					const { udiCode, status, productionDate, expirationDate, lotNum } = item;
					const { medicalChargeId, distributorBeans, distributorId, operatorBarcode } = item;
					if (
						((stageType && !operatorBarcode && udiCode) || operatorBarcode) &&
						!['consumed', 'returned'].includes(status)
					) {
						param.push({
							lotNum,
							stageType,
							udiCode,
							adviceId: id,
							productionDate,
							expirationDate,
							consumeId: medicalChargeId,
							barcode: stageType ? operatorBarcode : item.newOperatorBarcode,
							authorizingDistributorId:
								distributorBeans && !distributorId
									? distributorBeans.length > 1
										? form.getFieldValue(medicalChargeId)
										: distributorBeans[0].distributorId
									: distributorId,
						});
					}
				});
				setSubmitLoading(true);
				const res = await lockGoods(inputVal ? inputVal : '', param);
				if (res && res.code === 0) {
					notification.success('操作成功！');
					modalCancel(true);
				}
				setSubmitLoading(false);
			})
			.catch((_error) => {
				for (let i = 0; i < list.length; i++) {
					const {
						isScan,
						productionDate,
						expirationDate,
						lotNum,
						distributorId,
						distributorBeans,
					} = list[i];
					if (isScan && (!lotNum || !productionDate || !expirationDate)) {
						const index = Number(i) + 1;
						scrollTable(index, 'tableEle', 4);
						notification.warning(`第${index}行，批号或生产日期或效期不能为空`);
						break;
					} else if (
						isScan &&
						!distributorId &&
						distributorBeans &&
						distributorBeans.length > 1 &&
						!form.getFieldValue(list[i].medicalChargeId)
					) {
						const index = Number(i) + 1;
						scrollTable(index, 'tableEle', 15);
						notification.warning(`第${index}行，${fields.distributor}不能为空`);
						break;
					}
				}
			});
	};

	const handleChange = (value: number | string, index: number, name: string) => {
		let listArr = cloneDeep(list);
		listArr[index][name] = value;
		setList([...listArr]);
	};

	const columns: ProColumns<DetailListRecord>[] = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 80,
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: '状态',
			dataIndex: 'status',
			key: 'status',
			width: 100,
			renderText: (text: string, record) => (
				<span className={record.deleted ? 'cl_C0C4CC' : ''}>
					<Badge
						color={(chargeStatusValueEnum[text] || {}).color}
						text={chargeStatusTextMap[text]}
					/>
				</span>
			),
		},
		{
			title: `${fields.goods}条码/UDI`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 180,
			ellipsis: true,
			hideInTable: orderInfo.stageType,
			renderText: (text, record) => {
				const { barcodeControlled, isBarcodeControlled, udiCode, keyItem, serialNum } = record;
				let data = '';
				if (barcodeControlled || isBarcodeControlled) {
					data = keyItem && !serialNum ? text : udiCode;
				} else {
					data = text;
				}
				return <span className={record.deleted ? 'cl_C0C4CC' : ''}>{data}</span>;
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 180,
			ellipsis: true,
			hideInTable: !orderInfo.stageType,
			renderText: (text, record) => (
				<span className={record.deleted ? 'cl_C0C4CC' : ''}>{text}</span>
			),
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 150,
			ellipsis: true,
			renderText: (text: string, record) => (
				<span className={record.deleted ? 'cl_C0C4CC' : ''}>
					{text || record.name || record.goodsName}
				</span>
			),
		},
		{
			title: '批号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 150,
			ellipsis: true,
			render: (text: string, record, index) => {
				const { isScan, medicalChargeId, lotNum, isLotNum } = record;
				let required = !lotNum;
				return isScan && !isLotNum ? (
					<FormItem
						className='mg0'
						key={`lotNum${medicalChargeId}`}
						name={`lotNum${medicalChargeId}`}
						rules={[{ required }]}
						initialValue={lotNum || ''}>
						<Input onChange={(e) => handleChange(e.target.value, index, 'lotNum')} />
					</FormItem>
				) : (
					<span>{lotNum || '-'}</span>
				);
			},
		},
		{
			title: '生产日期',
			dataIndex: 'productionDate',
			key: 'productionDate',
			width: 150,
			ellipsis: true,
			render: (text: string, record, index) => {
				const { isScan, medicalChargeId, productionDate, isProductionDate } = record;
				let value = productionDate ? moment(productionDate) : null;
				let required = !value;
				return isScan && !isProductionDate ? (
					<FormItem
						className='mg0'
						name={`productionDate${medicalChargeId}`}
						rules={[{ required }]}
						initialValue={value}>
						<DatePicker
							format={['YYYY-MM-DD', 'YYYY/MM/DD']}
							onChange={(_, date: string) => {
								let value = date ? moment(date).valueOf() : '';
								handleChange(value, index, 'productionDate');
							}}
						/>
					</FormItem>
				) : (
					<span>{productionDate ? moment(Number(productionDate)).format('YYYY/MM/DD') : '-'}</span>
				);
			},
		},
		{
			title: '效期',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width: 150,
			ellipsis: true,
			render: (text: string, record, index) => {
				const { isScan, expirationDate, isExpirationDate, medicalChargeId } = record;
				let value = expirationDate ? moment(expirationDate) : null;
				let required = !value;
				return isScan && !isExpirationDate ? (
					<FormItem
						className='mg0'
						name={`expirationDate${medicalChargeId}`}
						rules={[{ required }]}
						initialValue={value}>
						<DatePicker
							format={['YYYY-MM-DD', 'YYYY/MM/DD']}
							onChange={(_, date: string) => {
								let value = date ? moment(date).valueOf() : '';
								handleChange(value, index, 'expirationDate');
							}}
						/>
					</FormItem>
				) : expirationDate ? (
					moment(expirationDate).format('YYYY-MM-DD')
				) : (
					'-'
				);
			},
		},
		{
			title: '消耗时间',
			dataIndex: 'timeConsumed',
			key: 'timeConsumed',
			width: 180,
			renderText: (text: string, record) => (
				<span className={record.deleted ? 'cl_C0C4CC' : ''}>
					{text ? moment(Number(text)).format('YYYY/MM/DD HH:mm:ss') : '-'}
				</span>
			),
		},
		{
			title: '消耗科室',
			dataIndex: 'consumedDepartmentName',
			key: 'consumedDepartmentName',
			width: 120,
			ellipsis: true,
			renderText: (text: string, record) => (
				<span className={record.deleted ? 'cl_C0C4CC' : ''}>{text}</span>
			),
		},
		{
			title: '消耗人',
			dataIndex: 'consumedByName',
			key: 'consumedByName',
			width: 100,
			renderText: (text: string, record) => (
				<span className={record.deleted ? 'cl_C0C4CC' : ''}>{text}</span>
			),
		},
		{
			title: '收费项编码',
			dataIndex: 'chargeCode',
			key: 'chargeCode',
			width: 150,
			ellipsis: true,
			renderText: (text: string, record) => (
				<span className={record.deleted ? 'cl_C0C4CC' : ''}>{text}</span>
			),
		},
		{
			title: '收费项名称',
			dataIndex: 'chargeName',
			key: 'chargeName',
			width: 150,
			ellipsis: true,
			renderText: (text: string, record) => (
				<span className={record.deleted ? 'cl_C0C4CC' : ''}>{text}</span>
			),
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 150,
			ellipsis: true,
			renderText: (text: string, record) => (
				<span className={record.deleted ? 'cl_C0C4CC' : ''}>{text}</span>
			),
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			width: 150,
			ellipsis: true,
			renderText: (text: string, record) => (
				<span className={record.deleted ? 'cl_C0C4CC' : ''}>
					{formatStrConnect(record, ['specification', 'model'])}
				</span>
			),
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 150,
			ellipsis: true,
			renderText: (text: string, record) => (
				<span className={record.deleted ? 'cl_C0C4CC' : ''}>{text}</span>
			),
		},
		{
			title: fields.distributor,
			dataIndex: 'distributorName',
			key: 'distributorName',
			width: 150,
			ellipsis: true,
			hideInTable: !(handleType === 'detail'),
			renderText: (text: string) => <span>{text}</span>,
		},
		{
			title: fields.distributor,
			dataIndex: 'medicalChargeId',
			key: 'medicalChargeId',
			width: 150,
			ellipsis: true,
			hideInTable: handleType === 'detail',
			renderText: (text: number, record) => {
				const topData = (record.distributorBeans || []).filter((item) => item.isTop);
				const firstChoice = topData.length > 0 ? topData[0].distributorId : undefined; // 首选数据
				return !record.distributorName ? (
					record.distributorBeans ? (
						record.distributorBeans.length > 1 ? (
							<FormItem
								className='mg0'
								name={text}
								initialValue={firstChoice}
								rules={[{ required: true }]}>
								<Select
									style={{ width: '100%' }}
									showSearch
									allowClear
									optionFilterProp='children'
									placeholder='请选择'
									filterOption={(input, option: any) =>
										option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
									}>
									{record.distributorBeans.map((item) => {
										return (
											<Select.Option
												key={item.distributorId}
												value={item.distributorId}>
												{item.distributorName}
											</Select.Option>
										);
									})}
								</Select>
							</FormItem>
						) : (
							<span>
								{record.distributorBeans.length > 0
									? record.distributorBeans[0].distributorName
									: ''}
							</span>
						)
					) : (
						<span></span>
					)
				) : (
					<span>{record.distributorName}</span>
				);
			},
		},
		{
			title: 'UDI',
			dataIndex: 'udiCode',
			key: 'udiCode',
			width: 200,
			ellipsis: true,
			hideInTable: !orderInfo.stageType,
			renderText: (text: string, record) => (
				<span className={record.deleted ? 'cl_C0C4CC' : ''}>{text}</span>
			),
		},
	] as ProColumns<DetailListRecord>[];

	if (['refunds', 'consume'].includes(handleType) && access['department_medical_advice_edit']) {
		columns.push({
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			fixed: 'right',
			width: 106,
			render: (_, record) => {
				return (
					<div className='operation'>
						{!orderInfo.stageType
							? !record.deleted &&
							  !['consumed', 'returned'].includes(record.status) &&
							  record.operatorBarcode && (
									<span
										className='handleLink'
										onClick={() => unConsume(record)}>
										撤回
									</span>
							  )
							: record.isScan && (
									<span
										className='handleLink'
										onClick={() => unConsume(record)}>
										撤回
									</span>
							  )}
					</div>
				);
			},
		});
	}

	useEffect(() => {
		if (isOpen) getDetailInfo();
	}, [isOpen]);

	useEffect(() => {
		if (departmentList.length > 0) {
			const departmentId = departmentList[0].id;
			form.setFieldsValue({ departmentId });
		}
	}, [departmentList]);

	const onInput = () => {
		if (!Reg()) {
			setWarning(true);
			setWarningMsg('追溯流水单号中不能包括中文和特殊符号!');
			return;
		}
		setWarning(false);
		setWarningMsg('');
	};

	const descriptionsOptions: DescriptionsItemProps[] = [
		{
			label: '收费序号',
			dataIndex: 'adviceNo',
		},
		{
			label: '病人名称',
			dataIndex: 'patientName',
		},
		{
			label: '开单时间',
			dataIndex: 'timeCreated',
			render: (text: number) => (text ? moment(new Date(text)).format('YYYY/MM/DD HH:mm:ss') : '-'),
		},
		{
			label: '开单科室',
			dataIndex: 'spdDeptName',
		},
		{
			label: '医生姓名',
			dataIndex: 'doctorName',
		},
	];
	if (handleType !== 'refunds') {
		descriptionsOptions.push({
			label: '追溯流水号',
			dataIndex: 'implantSerialNumber',
			render: (text: string) =>
				handleType === 'detail' ? (
					text || '-'
				) : (
					<Input
						maxLength={50}
						placeholder='请输入'
						onKeyUp={onInput}
						defaultValue={orderInfo.implantSerialNumber}
						onChange={(e) => setInputVal(e.target.value)}
						style={{
							width: '160px',
							height: '23px',
							borderColor: warning ? CONFIG_LESS['@c_EF394F'] : '',
						}}
					/>
				),
		});
	}

	return (
		<>
			<Form form={form}>
				<Modal
					width='80%'
					destroyOnClose
					onCancel={() => setIsOpen(false)}
					maskClosable={false}
					closable={!['consume', 'refunds'].includes(handleType)}
					visible={isOpen}
					title={handleType && handleTitle[handleType]}
					footer={
						['consume', 'refunds'].includes(handleType)
							? [
									<Button onClick={() => modalCancel(false)}>返回</Button>,
									<Button
										type='primary'
										loading={submitLoading}
										onClick={modalSubmit}>
										提交
									</Button>,
							  ]
							: null
					}>
					<div className='modelInfo'>
						<div className='left'>
							<Space>
								{/* 描述组件 */}
								<Descriptions
									options={descriptionsOptions}
									data={orderInfo}
									optionEmptyText='-'
								/>
								{warning ? (
									<div
										style={{
											color: CONFIG_LESS['@c_EF394F'],
											textAlign: 'right',
											marginRight: '13%',
										}}>
										{warningMsg}
									</div>
								) : null}
							</Space>
						</div>
						<div className='right'>
							<Statistic
								title='当前状态'
								value={(orderInfo.status && medicalAdviceStatusTextMap[orderInfo.status]) || '-'}
							/>
						</div>
					</div>
					{(handleType === 'consume' || handleType === 'refunds') && (
						<>
							<Divider />
							<div className='flex flex-right mb2'>
								<ScanInput
									value={scanValue}
									onSubmit={scanSubmit}
									onChange={(value: string) => setScanValue(value)}
									placeholder='点击此处扫码'
									style={{ width: 230 }}
									disabled={list.length == 0 || isDisabled}
								/>
							</div>
						</>
					)}
					<div id='tableEle'>
						<ProTable
							loading={loading}
							columns={columns}
							rowKey='medicalChargeId'
							dataSource={list}
							options={{ density: false, fullScreen: false, setting: false }}
							scroll={{ y: 300 }}
							pagination={false}
							size='small'
						/>
					</div>
				</Modal>
			</Form>
			{/* 批量消耗 */}
			{showConsumeModal && (
				<BatchConsume
					isStageType={!!orderInfo.stageType}
					goodsInfo={scanGoodsInfo}
					dataList={list}
					setDataList={setList}
					setIsDisabled={setIsDisabled}
					closeModal={() => setShowConsumeModal(false)}
				/>
			)}
		</>
	);
};

export default DetailModal;
