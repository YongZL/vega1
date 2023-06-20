import type { InitialState } from '@/app';
import type { ProColumns } from '@/components/ProTable';
import type { ProFormColumns } from '@/components/SchemaForm';
import type { SorterResult } from 'antd/es/table/interface';

import Breadcrumb from '@/components/Breadcrumb';
import ProTable from '@/components/ResizableTable';
import { consumeCount, findLowerExpirationDate, getCode } from '@/services/scanCountReport';
import { removeRowAttr, setRowAttr } from '@/utils';
import { notification } from '@/utils/ui';
import { Button, Form, InputNumber, Modal } from 'antd';
import classNames from 'classnames';
import { debounce, uniq } from 'lodash';
import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { history, Prompt, useAccess, useModel } from 'umi';
import ConfirmModal from './components/ConfirmModal';
import DelConfirmModal from './components/DelConfirmModal';
import EditModal from './components/EditMdodal';
import './index.less';
import { addRowAttribute, addRowKey, resetEquipment, splitTableData, validateData } from './utils';

type ConsumeHandleRecord = ScanCountReportController.ConsumeHandleRecord;
type GoodsReportItem = Required<ScanCountReportController.GoodsReportItem>;
type EquipmentDto = Required<ScanCountReportController.EquipmentDto>;
type DataItem = GoodsReportItem & EquipmentDto & { rowKey: number };

const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');
const tipMap = {
	1: '扫描无效！',
	2: '当前设备已存在',
	3: `当前扫描${fields.goods}行缺少${fields.goods}信息，请扫描${fields.goods}条码！`,
};

const ConsumeHandle: React.FC = () => {
	const access = useAccess();
	const { fields } = useModel('fieldsMapping');
	const { setInitialState } = useModel('@@initialState');
	const [form] = Form.useForm();
	const [submitLoading, setSubmitLoading] = useState<boolean>(false);
	const [tableClass, setTableClass] = useState('');
	const [operatorTip, setOperatorTip] = useState('');
	const [dataSource, setDataSource] = useState<DataItem[]>([]);
	const [confirmVisible, setConfirmVisible] = useState(false);
	const [delConfirmVisible, setDelConfirmVisible] = useState(false);
	const [selectRowData, setSelectRowData] = useState<DataItem>();
	const [sortOrder, setSortOrder] = useState('descend');
	const [editVisible, setEditVisible] = useState<boolean>(false);
	const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
	const [lowerExprateDateMap, setLowerExprateDateMap] = useState<Record<string, string>>({});
	const [lowerExprateDate, setLowerExprateDate] = useState<string[]>([]);
	const [scanOperatorBarcode, setScanOperatorBarcode] = useState<any>('');
	const tableElRef = useRef<Element>();

	// 获取表格
	useEffect(() => {
		tableElRef.current = document.querySelector('.consume-handle-table') as Element;
	}, []);

	useEffect(() => {
		const hideTip = () => {
			setOperatorTip('');
			document.removeEventListener('click', hideTip, false);
		};
		setTimeout(() => {
			if (operatorTip) {
				document.addEventListener('click', hideTip, false);
			}
		}, 100);
	}, [operatorTip]);

	useEffect(() => {
		const len = dataSource.length;
		setInitialState(
			(is) =>
				({
					...is,
					todoData: {
						...is?.todoData,
						consumption_business: (is?.todoData?.department_medical_advice_list || 0) + len,
						consumeEdit: len,
					},
				} as InitialState),
		);
	}, [dataSource]);

	// 列表行点击
	const onRowClick = (record: DataItem, index?: number) => {
		setRowAttr({
			tableEl: tableElRef.current as Element,
			index: typeof index === 'number' ? index : undefined,
			record,
			rowKey: 'rowKey',
		});

		const code = record.operatorBarcode;
		if (!selectedRowKeys.length || code === selectRowData?.operatorBarcode) {
			// 给有相同operatorBarcode添加‘same-element’属性
			setTimeout(() => {
				setDataSource((data: DataItem[]) => {
					addRowAttribute(tableElRef.current as Element, code as string, data);
					return data;
				});
			}, 0);
		}
	};

	// 获取更近效期
	const getFindLowerExprateDate = async (code: string) => {
		setScanOperatorBarcode(code);
		form.setFieldsValue({ scan: '' });
		const res = await findLowerExpirationDate({ operatorBarcode: code });

		if (res && res.code === 0) {
			if (!res.data) {
				getCodeData(code);
				return;
			}
			// 更近效期不一致弹窗确认是否处理
			setLowerExprateDate(res.data);
			setConfirmVisible(true);
		}
	};

	// 扫码提交
	const scanSubmit = (scanValue: string) => {
		const code = scanValue.trim();
		// 有权限获取更近效期和没有缓存数据
		if (access.closer_valid_period && !lowerExprateDateMap[code]) {
			getFindLowerExprateDate(code);
		} else {
			getCodeData(code);
		}
	};

	// 处理物资数据
	const dealGoods = (data: Required<ConsumeHandleRecord>, code: string) => {
		const tableData = [...dataSource];
		const len = tableData.length;
		const { equipmentDto, goodsReportItem } = data;

		const {
			lotNum,
			goodsName,
			itemExpirationDate,
			scanCapacity,
			specification,
			remainingCapacity,
			splitQuantity,
			isValidPeriod,
		} = goodsReportItem;

		// 过期提示
		if (isValidPeriod && access.is_valid_period) {
			const tip =
				'产品效期为' + moment(itemExpirationDate).format('YYYY年MM⽉DD⽇') + '，不可操作！';
			notification.warning(tip);
			return;
		}

		// 扫码容量
		const count =
			(1 + (splitQuantity || 0) + Number(goodsReportItem?.scanQuantity || 0)) * (scanCapacity || 0);
		if (
			!remainingCapacity ||
			count > remainingCapacity ||
			validateData(goodsReportItem as GoodsReportItem, dataSource)
		) {
			// 如果没有剩余容量代表已消耗完
			notification.warning(tipMap[1]);
			return;
		}
		if (len) {
			const rowIndex = sortOrder === 'descend' ? 0 : len - 1;
			const getRowData: DataItem = tableData[rowIndex];

			// 如果当前行与扫描物资不一致
			if (getRowData.operatorBarcode !== code) {
				// 从dataSource中找和扫描物资一致的数据
				const arr = dataSource.filter((item) => item.operatorBarcode === code);
				const key = 'remainingCapacity';
				const { scanQuantity, remainingCapacity } = arr.length
					? arr.sort((a, b) => a[key] - b[key])[0]
					: (goodsReportItem as GoodsReportItem);
				const { scanCapacity } = goodsReportItem as GoodsReportItem; // 取最新的单次容量
				const obj = {
					splitQuantity: 0,
					remainingCapacity: remainingCapacity - scanCapacity,
					scanQuantity: arr.length ? 1 : (scanQuantity || 0) + 1,
				};

				// 如果剩余容量小于单次容量
				if (remainingCapacity < scanCapacity) {
					notification.warning(tipMap[1]);
					return;
				}

				const { idEquipments, operatorBarcode } = getRowData;
				// 当前行有设备单没有物资
				if (idEquipments && !operatorBarcode) {
					addTableData(
						{
							...getRowData,
							...goodsReportItem,
							...concatEquipment(equipmentDto as EquipmentDto, getRowData),
							...obj,
						},
						true,
						rowIndex,
					);
				} else {
					addTableData(
						{
							...goodsReportItem,
							...(equipmentDto || {}),
							...obj,
							...addRowKey(goodsReportItem),
							operatorTime: new Date().getTime(),
						} as DataItem,
						false,
					);
				}
				return;
			}

			// 如果上面代码判断都没有找出与扫描物资相同的,则执行下面
			const { idEquipments, scanQuantity, remainingCapacity, operatorBarcode } = getRowData;
			const newRemainingCapacity = remainingCapacity - (scanCapacity as number);

			// 如果列表物资条码和当前扫描的条码一样
			if (operatorBarcode && operatorBarcode === code) {
				// 如果剩余容量少于单次容量
				if (remainingCapacity < (scanCapacity as number)) {
					notification.warning(tipMap[1]);
					return;
				}

				if (
					getRowData.lotNum !== lotNum ||
					getRowData.goodsName !== goodsName ||
					getRowData.scanCapacity !== scanCapacity ||
					getRowData.specification !== specification ||
					getRowData.itemExpirationDate !== itemExpirationDate
				) {
					// 物资名称、批号、规格、效期、单次容量如果有变化 都需要新创建一行
					const nowTime = new Date().getTime();
					addTableData(
						{
							...(equipmentDto || {}),
							...goodsReportItem,
							scanQuantity: 1,
							rowKey: nowTime,
							operatorTime: nowTime,
							remainingCapacity: newRemainingCapacity,
						} as DataItem,
						false,
					);
				} else {
					addTableData(
						{
							...getRowData,
							...concatEquipment(equipmentDto as EquipmentDto, getRowData),
							scanQuantity: (scanQuantity || 0) + 1,
							remainingCapacity: newRemainingCapacity,
							createdName: goodsReportItem?.createdName as string,
							operatorTime: goodsReportItem?.operatorTime as number,
						},
						true,
						rowIndex,
					);
				}
			} else {
				// 如果列表中没有这个物资条码
				const currentDataItem = {
					...goodsReportItem,
					scanQuantity: (goodsReportItem.scanQuantity || 0) + 1,
				};
				if (idEquipments) {
					// 1、没有物资，把扫描的物资与当前行合并
					// 2、有物资，所以往数组新添加一条
					if (operatorBarcode) {
						addTableData(
							{
								...currentDataItem,
								...equipmentDto,
								...addRowKey(goodsReportItem),
								operatorTime: new Date().getTime(),
							} as DataItem,
							false,
						);
					} else {
						addTableData(
							{
								...getRowData,
								...concatEquipment(equipmentDto as EquipmentDto, getRowData),
								...currentDataItem,
							},
							true,
							rowIndex,
						);
					}
				} else {
					addTableData(
						{
							...goodsReportItem,
							...(equipmentDto || {}),
							scanQuantity: 1,
							operatorTime: new Date().getTime(),
							...addRowKey(goodsReportItem),
						} as DataItem,
						false,
					);
				}
			}
		} else {
			// 如果列表没有数据
			addTableData(
				{
					...equipmentDto,
					...goodsReportItem,
					...addRowKey(goodsReportItem),
					scanQuantity: (goodsReportItem.scanQuantity || 0) + 1,
					remainingCapacity: remainingCapacity - (scanCapacity as number),
				} as DataItem,
				false,
			);
		}
	};

	// 处理设备数据
	const dealEquipments = (data: any, code: string) => {
		const len = dataSource.length;
		const { equipmentDto } = data;

		if (len) {
			const rowIndex = sortOrder === 'descend' ? 0 : len - 1;
			const getRowData = dataSource[rowIndex]; // 获取指定位置数据
			const { goodsItemId, remainingCapacity, equipmentBarcodes } = getRowData;
			// 如果有物资
			if (goodsItemId) {
				// 如果存在设备则提示
				if (equipmentBarcodes && equipmentBarcodes.split(',').includes(code)) {
					notification.warning(tipMap[2]);
					return;
				}
				// 如果第一条有物资，但物资未消耗完。
				if (remainingCapacity >= 0) {
					addTableData(
						{ ...getRowData, ...equipmentDto, ...concatEquipment(equipmentDto, getRowData) },
						true,
						rowIndex,
					);
				} else {
					// 物资消耗完成，添加一条新数据。
					addTableData({ ...equipmentDto, ...addRowKey(equipmentDto) }, false);
				}
			} else {
				// 没有物资
				if (equipmentBarcodes && equipmentBarcodes.split(',').includes(code)) {
					notification.warning(tipMap[2]);
				} else {
					addTableData({ ...concatEquipment(equipmentDto, getRowData) }, true, rowIndex);
				}
			}
		} else {
			//如果列表没有数据，直接添加一条数据
			addTableData({ ...equipmentDto, ...addRowKey(equipmentDto) }, false);
		}
	};

	// 获取扫码数据
	const getCodeData = async (code: string) => {
		const isGoods = new RegExp('^ID_').test(code);
		const isEquipments = new RegExp('^EQ_').test(code);
		form.setFieldsValue({ scan: '' });

		// 不是物资和设备
		if (!isGoods && !isEquipments) {
			notification.warning(tipMap[1]);
			return;
		}

		const res = await getCode({ code, isReport: true });

		if (res && res.code === 0) {
			if (!res.data) {
				notification.warning(tipMap[1]);
				return;
			}
			if (isGoods) {
				dealGoods(res.data as Required<ConsumeHandleRecord>, code);
			}

			if (isEquipments) {
				dealEquipments(res.data, code);
			}
		}
	};

	/**
	 * 添加数据处理
	 * @param newData 要添加的数据
	 * @param {boolean} isReplace true-替换 false-添加
	 * @param index 添加下标
	 */
	const addTableData = (newData: DataItem, isReplace: boolean, index?: number) => {
		setSelectRowData(newData);
		setDataSource((data) => {
			if (sortOrder === 'descend') {
				isReplace ? (data[index || 0] = newData) : data.unshift(newData);
			} else {
				isReplace ? (data[index as number] = newData) : data.push(newData);
			}
			return [...data];
		});
		setTimeout(() => {
			onRowClick(newData);
		}, 100);
	};

	// 确认操作提交数据
	const postData = async (tableData: DataItem[], tip: string, type?: string) => {
		const countReports: ScanCountReportController.ConsumeCountParams['countReports'] = [];
		const len = tableData.length;

		for (let i = 0; i < len; i++) {
			const item = tableData[i];
			if (!item.operatorBarcode) {
				notification.warning(`第${i + 1}行未添加${fields.goods}，请添加${fields.goods}`);
				return;
			}

			if (item.scanQuantity > 0 || item.splitQuantity > 0) {
				countReports.push({
					lotNum: item.lotNum,
					goodsName: item.goodsName,
					equipmentIds: item.idEquipments,
					scanCount: item.scanQuantity,
					splitCount: item.splitQuantity,
					scanCapacity: item.scanCapacity,
					goodsBarcode: item.operatorBarcode,
					specification: item.specification,
					detectionCapacity: item.detectionCapacity,
					remainingCapacity: item.remainingCapacity,
					expirationDate: item.itemExpirationDate,
					operatorTime: item.operatorTime,
				});
			}
		}

		setOperatorTip('等待处理...');
		setSubmitLoading(true);

		if (countReports.length) {
			const key = 'operatorTime';
			const postParams = countReports.sort((a, b) => {
				return a[key] - b[key];
			});
			try {
				const res = await consumeCount({
					isReport: true,
					countReports: sortOrder === 'descend' ? countReports : postParams,
				});
				if (res && res.code === 0) {
					dealPost(tableData, tip, type);
				}
			} finally {
				setSubmitLoading(false);
			}
		} else {
			dealPost(tableData, tip, type);
		}
	};

	const dealPost = async (tableData: DataItem[], tip: string, type?: string) => {
		setOperatorTip(tip + '成功!');

		if (type === 'confirm') {
			setSelectedRowKeys([]);
			setSelectRowData(undefined);
			setDataSource([]);
			setLowerExprateDateMap({});
			setSubmitLoading(false);
		} else {
			try {
				const { departmentId, operatorBarcode } = (tableData && tableData[0]) || {};
				const res = await getCode({
					isReport: true,
					code: operatorBarcode,
					deleteDepartmentId: departmentId,
				});
				if (res && res.code === 0) {
					const { goodsReportItem } = res.data;
					const nowTime = new Date().getTime();
					setSelectedRowKeys([]);
					setSelectRowData(undefined);
					setTableClass('');
					if (type === 'edit') {
						setEditVisible(false);
					} else {
						// type === 'del'
						setDelConfirmVisible(false);
					}
					addTableData(
						{
							...goodsReportItem,
							rowKey: nowTime,
							operatorTime: nowTime,
							scanQuantity: 0,
							splitQuantity: 0,
							...resetEquipment(),
						} as unknown as DataItem,
						false,
					);
				}
			} finally {
				setSubmitLoading(false);
			}
		}
	};

	// 扫描框获取或失去焦点
	const scanFocus = (focus: boolean) => {
		const ele = document.querySelector('.scanArea input') as HTMLInputElement;
		focus ? ele?.focus() : ele?.blur();
	};

	useEffect(() => {
		if (confirmVisible || delConfirmVisible || editVisible) {
			scanFocus(false);
		}
	}, [confirmVisible, delConfirmVisible, editVisible]);

	const handleEditFinish = () => {
		const tableData = splitTableData(selectRowData?.operatorBarcode as string, dataSource);
		setDataSource([...tableData[1]]);
		postData(tableData[0], '单次容量编辑', 'edit');
	};

	const handleEditCancel = () => {
		setSelectRowData(undefined);
		setEditVisible(false);
		setSelectedRowKeys([]);
		removeRowAttr(tableElRef.current as Element);
		// 清楚same-element
		addRowAttribute(tableElRef.current as Element, '', dataSource);
	};

	const handleDelFinish = (data: GoodsReportItem, tableData: DataItem[]) => {
		setTableClass('');
		setSelectRowData(undefined);
		setDelConfirmVisible(false);
		setSelectedRowKeys([]);
		setDataSource([...tableData]);
		setOperatorTip('删除成功');

		const time = new Date().getTime();
		addTableData(
			{
				...data,
				...resetEquipment(),
				rowKey: time,
				splitQuantity: 0,
				scanQuantity: 0,
				operatorTime: time,
			} as unknown as DataItem,
			false,
		);
	};

	const handleCancel = () => {
		setScanOperatorBarcode('');
		setConfirmVisible(false);
	};

	const handleConfirm = () => {
		const code = scanOperatorBarcode;
		lowerExprateDateMap[code] = code;
		scanFocus(true);
		setLowerExprateDateMap({ ...lowerExprateDateMap });
		getCodeData(code);
		setConfirmVisible(false);
	};

	const confirmSubmit = () => {
		if (!dataSource.length) {
			return;
		}
		const noOperatorBarcode = dataSource.some((item) => !item.operatorBarcode);
		if (noOperatorBarcode) {
			notification.warning(tipMap[3]);
			return;
		}
		if (!submitLoading) {
			postData(dataSource, '确认操作', 'confirm');
		}
	};

	const setInputDisabled = (index: number) => {
		const defaultIndex = sortOrder === 'descend' ? 0 : dataSource.length - 1;
		return index !== defaultIndex;
	};

	/**
	 * @param newData 为需要添加的设备数据
	 * @param data 为已有的设备数据
	 * @returns
	 */
	const concatEquipment = useCallback(
		(newData: EquipmentDto, data: DataItem = {} as DataItem): DataItem => {
			if (data && (data.equipmentBarcodes || data.idEquipments) && newData) {
				['idEquipments', 'equipmentNames', 'equipmentCodes', 'equipmentBarcodes'].forEach((key) => {
					newData[key] = uniq(
						((newData[key] ? newData[key] + ',' : '') + (data[key] || '')).split(','),
					).join(',');
				});
				return newData as DataItem;
			}
			return newData as DataItem;
		},
		[],
	);

	const searchColumns: ProFormColumns = [
		{
			title: '扫描/输入条码',
			valueType: 'scanInput',
			dataIndex: 'scan',
			fieldProps: {
				onSubmit: debounce((value: any) => scanSubmit(value), 600),
				onPressEnter: () => debounce(scanSubmit, 600),
				style: { width: 300 },
				placeholder: '点击此处扫码',
			},
		},
		{
			valueType: 'remarks',
			fieldProps: {
				remarks: [
					`* 扫描(可重复)“${fields.goods}/设备”条码→操作完成后点击“确认操作”按钮`,
					`* 红色“批号/效期”：提示近效期或过期${fields.goods}`,
				],
				style: { display: 'unset' },
				itemStyle: { color: CONFIG_LESS['@c_starus_warning'] },
			},
		},
	];

	const columns: ProColumns<DataItem>[] = [
		{
			title: '',
			dataIndex: 'index',
			key: 'index',
			width: 'XXXS',
			ellipsis: true,
			render: (text, record, index) => `${index + 1}`,
		},
		{
			title: '操作时间',
			dataIndex: 'operatorTime',
			width: 'XXXL',
			sorter: (a, b) => a.operatorTime - b.operatorTime,
			render: (text, record) => {
				const { operatorTime } = record;
				return operatorTime ? moment(operatorTime).format('YYYY-MM-DD/HH:mm:ss') : '';
			},
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			width: 336,
			ellipsis: true,
		},
		{
			title: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
			width: 240,
			ellipsis: true,
		},
		{
			title: '扫描分拆次数',
			dataIndex: 'scanQuantity',
			width: 'M',
			ellipsis: true,
		},
		{
			title: '人工分拆次数',
			dataIndex: 'splitQuantity',
			width: 'M',
			ellipsis: true,
			render: (text, record, index) => {
				const { remainingCapacity, scanCapacity, splitQuantity, scanQuantity, rowKey } = record;
				return access.artificialSplit ? (
					<InputNumber
						min={1}
						max={999999}
						style={{ width: '100%' }}
						onPressEnter={(e) => {
							(e.target as HTMLInputElement).blur();
							scanFocus(true);
						}}
						onBlur={() => scanFocus(true)}
						value={splitQuantity || ''}
						disabled={setInputDisabled(index)}
						onChange={(values) => {
							const vals = (values || 0).toString();
							let value: string | number = 0;
							if (vals) {
								if (vals.length === 1) {
									value = vals.replace(/[^1-9]/g, '');
								} else {
									value = vals.replace(/\D/g, '');
								}
							}

							const nowCapacity = (Number(value || 0) + scanQuantity) * scanCapacity; // 当前容量
							const grossCapacity =
								(Number(splitQuantity) + scanQuantity) * scanCapacity + remainingCapacity; // 当前行总容量
							const remainingCapacitys =
								grossCapacity < nowCapacity
									? grossCapacity - scanQuantity * scanCapacity
									: grossCapacity - nowCapacity;
							let val = value || 0;
							if (grossCapacity < nowCapacity) {
								val = 0;
								notification.warning('分拆无效！');
							}
							const newDataSource = dataSource.map((item: any) => {
								return item.rowKey === rowKey
									? {
											...item,
											splitQuantity: Number(val),
											remainingCapacity: remainingCapacitys,
									  }
									: { ...item };
							});
							setDataSource([...newDataSource]);
						}}
					/>
				) : (
					record.splitQuantity
				);
			},
		},
		{
			title: '单次容量',
			dataIndex: 'scanCapacity',
			width: 'XL',
			ellipsis: true,
			renderText: (text, record) => {
				let capacityUnit = record.capacityUnit || '',
					scanCapacity = record.scanCapacity || '0';
				return scanCapacity + capacityUnit;
			},
		},
		{
			title: '剩余容量',
			dataIndex: 'remainingCapacity',
			width: 'XL',
			ellipsis: true,
			renderText: (text, record) => {
				let capacityUnit = record.capacityUnit || '',
					remainingCapacity = record.remainingCapacity || '0';
				return remainingCapacity + capacityUnit;
			},
		},
		{
			title: '规格',
			dataIndex: 'specification',
			width: 'XL',
			ellipsis: true,
		},
		{
			title: '单位',
			dataIndex: 'unitName',
			width: 'XS',
			ellipsis: true,
		},
		{
			title: '容量/单位',
			dataIndex: 'detectionCapacityUint',
			width: 'XL',
			ellipsis: true,
		},
		{
			title: '批号',
			dataIndex: 'lotNum',
			width: 'XL',
			ellipsis: true,
		},
		{
			title: '效期',
			dataIndex: 'itemExpirationDate',
			width: 'XXXL',
			render: (text, record) => {
				const { itemExpirationDate, isValidPeriod } = record;
				return itemExpirationDate ? (
					<span style={{ color: isValidPeriod ? CONFIG_LESS['@c_starus_warning'] : '' }}>
						{moment(itemExpirationDate).format('YYYY-MM-DD')}
					</span>
				) : (
					'-'
				);
			},
		},
		{
			title: '设备名称',
			dataIndex: 'equipmentNames',
			width: 'XL',
			ellipsis: true,
		},
		{
			title: '设备编号',
			dataIndex: 'equipmentCodes',
			width: 'XL',
			ellipsis: true,
		},
		{
			title: '设备条码',
			dataIndex: 'equipmentBarcodes',
			width: 'XL',
			ellipsis: true,
		},
		{
			title: '科室/仓库',
			dataIndex: 'warehouseName',
			width: 'XL',
			ellipsis: true,
		},
		{
			title: '操作人员',
			dataIndex: 'createdName',
			width: 'S',
			ellipsis: true,
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			width: 336,
			ellipsis: true,
		},
	];

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<ProTable<DataItem>
				tableInfoCode='consumeEdit'
				rowKey='rowKey'
				dataSource={dataSource}
				columns={columns}
				searchConfig={{
					form,
					columns: searchColumns,
					submitter: false,
				}}
				rowSelection={{
					hideSelectAll: true,
					onChange: (selectedRowKeys) => {
						setSelectedRowKeys([...selectedRowKeys]);
					},
					onSelect: (record) => {
						setSelectRowData(record);
						addRowAttribute(tableElRef.current as Element, record?.operatorBarcode, dataSource);
						setRowAttr({
							tableEl: tableElRef.current as Element,
							record,
							rowKey: 'rowKey',
						});
					},
					selectedRowKeys,
					getCheckboxProps: (record) => {
						if (selectedRowKeys.length > 0) {
							const { operatorBarcode } =
								dataSource.find((item) => selectedRowKeys.includes(item.rowKey)) || {};
							return {
								disabled:
									(operatorBarcode as unknown as boolean) &&
									record.operatorBarcode !== operatorBarcode,
							};
						}
						return { disabled: false };
					},
				}}
				tableClassName={classNames('consume-handle-table', tableClass)}
				onRow={(record, index?: number) => ({
					onClick: () => {
						// 不是统计行
						if (index !== dataSource.length) {
							onRowClick(record, index);
							if (!selectedRowKeys.length) {
								setSelectRowData(record);
							}
						}
					},
				})}
				onChange={(_pagination, _filters, sorter, { action }) => {
					if (action === 'sort') {
						const currentSorter: SorterResult<DataItem> = sorter as SorterResult<DataItem>;
						if (sorter && currentSorter.order !== sortOrder && currentSorter.order) {
							setSortOrder(currentSorter.order || sortOrder);
							const arr = dataSource.sort((a, b) => {
								return currentSorter.order === 'descend'
									? b.operatorTime - a.operatorTime
									: a.operatorTime - b.operatorTime;
							});
							setDataSource(arr);
						}
					}
				}}
				// tableInfoId="250"
				toolBarRender={() => [
					<p className='consume-operator-tip'>{operatorTip}</p>,
					<Button
						type='primary'
						style={{ marginLeft: 10 }}
						onClick={confirmSubmit}>
						确认操作
					</Button>,
					<Button
						type='primary'
						style={{ marginLeft: 10 }}
						disabled={!selectRowData}
						onClick={() => {
							if (!selectRowData?.operatorBarcode) {
								notification.warning(tipMap[3]);
								return;
							}
							setTableClass('consume-handle-table__active');
							setDelConfirmVisible(true);
						}}>
						删除
					</Button>,
					<Button
						type='primary'
						style={{ marginLeft: 10 }}
						disabled={!access.scanEdit || !selectRowData}
						onClick={() => {
							if (!selectRowData?.operatorBarcode) {
								notification.warning(tipMap[3]);
								return;
							}
							setEditVisible(true);
						}}>
						单次容量编辑
					</Button>,
				]}
				pagination={false}
				indexKey='index'
				renderSummary={(data) => {
					return {
						rowKey: 'summary_row_item',
						operatorTime: `共计(${data.length})`,
					};
				}}
			/>
			{editVisible && (
				<EditModal
					selectRowData={selectRowData}
					onFinish={handleEditFinish}
					onCancel={handleEditCancel}
					setOperatorTip={setOperatorTip}
					setTableClass={setTableClass}
					dataSource={dataSource}
					tableElRef={tableElRef}
				/>
			)}
			{confirmVisible && (
				<ConfirmModal
					onOk={handleConfirm}
					onCancel={handleCancel}
					lowerExprateDate={lowerExprateDate}
				/>
			)}
			{delConfirmVisible && (
				<DelConfirmModal
					onFinish={handleDelFinish}
					onCancel={() => {
						setTableClass('');
						setDelConfirmVisible(false);
					}}
					dataSource={dataSource}
					setDataSource={setDataSource}
					postData={postData}
					selectedRowKeys={selectedRowKeys}
					selectRowData={selectRowData}
				/>
			)}
			{dataSource && dataSource.length > 0 && (
				<Prompt
					when={!!dataSource && dataSource.length > 0}
					message={(location) => {
						if (location.pathname !== '/consume/handle') {
							Modal.confirm({
								icon: <span></span>,
								width: 300,
								content: '是否退出',
								okText: '是',
								cancelText: '否',
								onOk() {
									setDataSource([]);
									setTimeout(() => {
										history.push(location.pathname);
									});
								},
							});
						}
						return false;
					}}
				/>
			)}
		</div>
	);
};

export default ConsumeHandle;
