import DistributorChannelModel from '@/components/DistributorChannelModel';
import ExportFile from '@/components/ExportFile';
import type { ProColumns, ProTableAction } from '@/components/ProTable';
import ProTable from '@/components/ResizableTable';
import type { ProFormColumns } from '@/components/SchemaForm';
import {
	antiEpidemicTypeTextMap,
	enabledEnum,
	enabledPlatformMatchingValueEnum,
	enabledStatusValueEnum,
	isBarcodeController,
	isHightValue,
	listIsBarcodeController,
} from '@/constants/dictionary';
import type { ConnectState } from '@/models/connect';
import { getAllDistributors } from '@/services/distributor';
import { batchUpdateStatus, exportGoodsTypes } from '@/services/goodsTypes';
import { getAllManufacturers } from '@/services/manufacturer';
import { getBubbleExpireCount, pageList, updateEnabled } from '@/services/newGoodsTypes';
import { dealPackNum, lessThan_30Days } from '@/utils/dataUtil';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Form, Popconfirm, Spin, Tooltip } from 'antd';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { connect, history, useAccess, useModel } from 'umi';
import BindWarehouseAndLocationModal from './BindWarehouseAndLocationModal';
import OperatingHistory from './OperatingHistory';
type GoodsRecord = Omit<NewGoodsTypesController.GoodsRecord, 'id'> & { id: number };
const Goods: React.FC<{ global: ConnectState['global'] }> = ({ global }) => {
	const { fields } = useModel('fieldsMapping');
	const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
	const [selectedList, setSelectedList] = useState<GoodsRecord[]>([]);
	const [statusLoadingMap, setStatusLoadingMap] = useState<Record<number, boolean>>({});
	const [summary, setSummary] = useState({ expireCount: 0, willExpireCount: 0 }); //经营许可30天内过期的个数，及过期的个数
	const [isExportFile, setIsExportFile] = useState(false);
	const [distributorChannelVisible, setDistributorChannelVisible] = useState(false);
	const [goodsId, setGoodsId] = useState<number>();
	const [distributorList, setDistributorList] = useState<
		DistributorController.DistributorsRecord[]
	>([]);
	const [needBindLocations] = useState<boolean>(['DS'].includes(WEB_PLATFORM));
	const [searchForm] = Form.useForm();
	const access = useAccess();
	const tableRef = useRef<ProTableAction>();
	const { loading, fieldsMap, extendedFields, getGoodsFieldList } = useModel('goodsField');

	// 获取是否已经绑定货位
	const getIsHasBindLocations = useCallback((item: GoodsRecord) => {
		return needBindLocations ? !!item.storageLocBarcode : true;
	}, []);

	// 0 没有选中，1 选中禁用并且已绑定货位的数据，2 选中启用的，3 选中了未绑定货位的数据
	const checkedState = useMemo(() => {
		if (!selectedList.length) return 0;

		let state = false;
		if (needBindLocations) {
			state = selectedList.some((item) => !item.storageLocBarcode && !item.isEnabled);
			// 药品环境，选中了未绑定货位的数据
			if (state) return 3;
		}
		// 是否选中了启用的数据
		state = selectedList.some((item) => item.isEnabled);
		return state ? 2 : 1;
	}, [selectedList, needBindLocations]);

	const getSearchParams = () => {
		const values = searchForm.getFieldsValue();
		const params = {
			statusList: values.status && values.status[0] ? values.status.join(',') : undefined,
			isCombined: false,
			...values,
		};
		delete params.status;
		delete params.timeCreated;
		return params;
	};

	const clear = useCallback(() => {
		setSelectedRowKeys([]);
		setSelectedList([]);
	}, []);

	/**
	 * 点击启用或禁用基础物资
	 * @param status 启用禁用状态
	 * @param id 基础物资id
	 */
	const handleUpdateEnabled = async (isEnabled: boolean, id: number) => {
		setStatusLoadingMap({ ...statusLoadingMap, [id]: true });
		try {
			const res = await updateEnabled({ isEnabled, goodsId: id });
			if (res && res.code === 0) {
				notification.success('操作成功！');
				clear();
				tableRef.current?.reload();
			}
		} finally {
			setStatusLoadingMap({ ...statusLoadingMap, [id]: false });
		}
	};

	/**
	 * 批量启用禁用基础物资
	 * @param {number} state 1 批量启用，2 批量禁用
	 */
	const handleBatchUpdateStatus = useCallback(
		async (state: 1 | 2) => {
			const res = await batchUpdateStatus({
				enabled: state === 1,
				goodsIds: selectedRowKeys,
			});
			if (res && res.code === 0) {
				notification.success('操作成功！');
				clear();
				tableRef.current?.reload();
			}
		},
		[selectedRowKeys],
	);

	const getCode = () => {
		const hash = window.location.search;
		let keywords = undefined;
		let id = undefined;
		if (hash.indexOf('search_key') > -1) {
			keywords = global.keywords;
		}
		if (hash.indexOf('search_link') > -1) {
			id = global.linkKeys;
		}
		return { keywords, id };
	};
	//气泡提示
	const getExpire = async () => {
		const res = await getBubbleExpireCount(30);
		if (res && res.code === 0) {
			setSummary(res.data);
		}
	};

	const getDistributorList = async () => {
		const res = await getAllDistributors();
		if (res.code === 0) {
			setDistributorList(res.data);
		}
	};

	useEffect(() => {
		getGoodsFieldList();
		getExpire();
		// 无过供货渠道操作权限时
		access.goods_supply_channel && getDistributorList();
	}, []);

	useEffect(() => {
		if (!loading) {
			let { keywords } = getCode();
			const state = history?.location.state as { code?: string };
			if (state?.code) {
				keywords = undefined;
			}
			if (state?.code || keywords) {
				setTimeout(() => {
					searchForm.setFieldsValue({ goodsId: state?.code, keywords });
					searchForm.submit();
				}, 200);
			}
		}
	}, [loading, global.timestamp]);

	const resetGoodsId = useCallback(() => {
		if (history.location.state && (history.location.state as { code?: string }).code) {
			history.replace({
				...history.location,
				state: {},
			});
		}
		searchForm.resetFields(['keywords', 'goodsId']);
	}, []);

	const onSelectAll = (selected: boolean, selectedData: GoodsRecord[]) => {
		if (selected) {
			let selectedRows: GoodsRecord[] = [];
			if ([0, 2].includes(checkedState)) {
				selectedRows = selectedData.filter((item) => item.isEnabled);
				// 如果没有选中的数据，则选择禁用状态的数据
				if (checkedState === 0 && !selectedRows.length) {
					selectedRows = selectedData.filter(
						(item) => getIsHasBindLocations(item) && !item.isEnabled,
					);
					// 如果选中启用和禁用的数据，则设置禁用并且未绑定的数据
					if (needBindLocations && !selectedRows.length) {
						selectedRows = selectedData.filter((item) => !item.storageLocBarcode);
					}
				}
			} else if (checkedState === 3) {
				selectedRows = selectedData.filter((item) => !item.storageLocBarcode && !item.isEnabled);
			} else {
				selectedRows = selectedData.filter(
					(item) => getIsHasBindLocations(item) && !item.isEnabled,
				);
			}

			const selectedKeys = selectedRows.map((item) => item.id);
			setSelectedList(selectedRows);
			setSelectedRowKeys(selectedKeys);
		} else {
			setSelectedList([]);
			setSelectedRowKeys([]);
		}
	};

	const onSelect = (record: GoodsRecord, selected: boolean) => {
		const selectedRows = [...selectedList];
		if (selected) {
			selectedRows.push(record);
		} else {
			const len = selectedRows.length;
			for (let i = 0; i < len; i++) {
				if (selectedRows[i].id === record.id) {
					selectedRows.splice(i, 1);
					break;
				}
			}
		}
		const selectedKeys = selectedRows.map((item) => item.id);
		setSelectedRowKeys(selectedKeys);
		setSelectedList(selectedRows);
	};

	const jumpPage = useCallback(
		async (id: number, type: number, name?: string) => {
			history.push({
				pathname: `/base_data/new_goods/${type === 1 ? `detail` : `edit`}/${id}`,
				state: { goodsName: name },
			});
		},
		[history],
	);

	const getFieldLabel = useCallback(
		(fieldKey: string, text: string) => {
			const field = fieldsMap[fieldKey];
			const title = field ? field.displayFieldLabel || text : text;
			return {
				title,
				width: title.length <= 4 ? 64 : 90,
			};
		},
		[fieldsMap],
	);

	const openDistributorChannelModel = (id: number) => {
		setDistributorChannelVisible(true);
		setGoodsId(id);
	};

	const searchColumns: ProFormColumns = [
		{
			title: getFieldLabel('goodsName', `${fields.goodsName}`).title,
			dataIndex: 'goodsName',
		},
		{
			title: getFieldLabel('materialCode', `${fields.goodsCode}`).title,
			dataIndex: 'materialCode',
		},
		{
			title: getFieldLabel('enabled', '状态').title,
			dataIndex: 'isEnabled',
			valueType: 'radioButton',
			initialValue: '',
			valueEnum: enabledEnum,
			fieldProps: {
				className: 'search-radio-button',
			},
		},
		{
			title: getFieldLabel('highValue', `${fields.goodsProperty}`).title,
			dataIndex: 'highValue',
			valueType: 'select',
			fieldProps: {
				options: isHightValue,
			},
		},
		{
			title: getFieldLabel('pmCode', '产品主码').title,
			dataIndex: 'pmCode',
		},
		{
			title: 'DI',
			dataIndex: 'diCode',
		},
		{
			title: getFieldLabel('manufacturerIds', '生产厂家').title,
			dataIndex: 'manufacturerIds',
			valueType: 'apiSelect',
			fieldProps: {
				api: getAllManufacturers,
				fieldConfig: {
					label: 'companyName',
					value: 'id',
				},
				filterOption: (input: any, option: any) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
		},
		{
			title: getFieldLabel('nationalNo', '国家医保编码').title,
			dataIndex: 'nationalNo',
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
		},
		{
			title: '条码管控',
			dataIndex: 'isBarcodeControlled',
			valueType: 'radioButton',
			initialValue: '',
			valueEnum: isBarcodeController,
			fieldProps: {
				className: 'search-radio-button',
			},
		},
		{
			title: `${fields.goods}ID`,
			dataIndex: 'goodsId',
			formItemProps: {
				hidden: true,
			},
		},
		{
			title: `${fields.goods}有关的关键字`,
			dataIndex: 'keywords',
			formItemProps: {
				hidden: true,
			},
		},
	];

	const columns: ProColumns<GoodsRecord>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			width: 'XXS',
			align: 'center',
			renderText: (_text, _record, index) => index + 1,
		},
		{
			title: '状态',
			dataIndex: 'isEnabled',
			width: 'XXS',
			filters: false,
			valueEnum: enabledStatusValueEnum,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			width: 'XL',
			ellipsis: true,
		},
		{
			title: '产品主码',
			dataIndex: 'pmCode',
			width: 'L',
		},
		{
			title: 'DI',
			dataIndex: 'diCode',
			width: 'XXXL',
			ellipsis: true,
			render: (_text, record) => {
				const { diCode } = record;
				let diCodeArr = diCode ? diCode.split(';') : [];
				let len = diCodeArr.length;
				let title = diCodeArr.map((item, index) => {
					return <div>{`${item}${len === index + 1 ? '' : ';'}`}</div>;
				});
				return len ? (
					<span>
						<Tooltip title={title}>{diCode}</Tooltip>
					</span>
				) : (
					'-'
				);
			},
		},
		{
			title: fields.goodsName,
			dataIndex: 'name',
			width: 'L',
			ellipsis: true,
			render: (text, record) => {
				return access.goods_view ? (
					<a
						className='handleLink'
						onClick={() => jumpPage(record.id, 1, record?.name)}>
						{record.name}
					</a>
				) : (
					record.name
				);
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			width: 'L',
			ellipsis: true,
		},
		{
			title: '注册效期',
			dataIndex: 'registrationDueDate',
			key: 'temp.registration_end_date',
			width: 'L',
			ellipsis: true,
			sorter: true,
			render: (_text, record) => {
				const endTime = record && Number(record.registrationDueDate);
				const showRedText = lessThan_30Days(endTime, 0);
				const isOverdue = endTime < Date.parse(new Date().toString()) - 86400000 + 1000;
				return record.isConsumableMaterial ? (
					<span
						style={
							endTime
								? showRedText
									? { color: CONFIG_LESS['@c_starus_early_warning'] }
									: isOverdue
									? { color: CONFIG_LESS['@c_starus_warning'] }
									: {}
								: {}
						}>
						{record.registrationDueDate
							? moment(record.registrationDueDate).format('YYYY/MM/DD')
							: '长期有效'}
						{!!endTime && showRedText && <span className='warningIcon'>效期预警</span>}
						{!!endTime && isOverdue && <span className='earlyWarningIcon'>过期警告</span>}
					</span>
				) : (
					<span>-</span>
				);
			},
		},
		{
			title: fields.distributor,
			dataIndex: 'distributorName',
			width: 'L',
			ellipsis: true,
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			width: 'L',
			ellipsis: true,
		},
		{
			title: '国家医保编码',
			dataIndex: 'nationalNo',
			width: 'L',
			ellipsis: true,
		},
		{
			title: fields.goodsProperty,
			dataIndex: 'isHighValue',
			width: 'S',
			renderText: (text?: boolean) => (typeof text === 'boolean' ? (text ? '高值' : '低值') : '-'),
		},
		{
			title: fields.goodsType,
			dataIndex: 'materialCategory',
			width: 'S',
		},
		{
			title: '所属库房',
			dataIndex: 'storageAreaName',
			width: 'S',
			ellipsis: true,
			hideInTable: WEB_PLATFORM !== 'DS',
		},
		{
			title: '所属货位',
			dataIndex: 'storageLocBarcode',
			width: 'S',
			ellipsis: true,
			hideInTable: WEB_PLATFORM !== 'DS',
		},
		{
			title: fields.antiEpidemic,
			dataIndex: 'antiEpidemic',
			width: 'S',
			renderText: (text) => antiEpidemicTypeTextMap[text] || '',
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			width: 'L',
			ellipsis: true,
			renderText: (text: string, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '单价(元)',
			dataIndex: 'procurementPrice',
			key: 'procurementPrice',
			align: 'right',
			width: 'XS',
			renderText: (text: number) => convertPriceWithDecimal(text),
		},
		{
			title: '计价单位',
			dataIndex: 'minGoodsUnit',
			width: 'XXS',
		},
		{
			title: '大/中包装',
			dataIndex: 'minGoodsNum',
			width: 'XS',
			renderText: (text, record) => dealPackNum(record.largeBoxNum, record.minGoodsNum),
		},
		{
			title: '操作时间',
			dataIndex: 'timeModified',
			key: 'vg.time_modified',
			sorter: true,
			width: 'L',
			renderText: (text: number) => {
				return text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '条码管控',
			dataIndex: 'isBarcodeControlled',
			key: 'isBarcodeControlled',
			width: 'L',
			renderText: (text) => listIsBarcodeController[text],
		},
		{
			title: '重点品种',
			dataIndex: 'keyItem',
			width: 'S',
			renderText: (text: boolean, record) => {
				// 非条码管控下重点品种不显示，具体看http://192.168.10.25:8090/pages/viewpage.action?pageId=39685785 1.2的图片
				return record.isBarcodeControlled && typeof text === 'boolean' ? (text ? '是' : '否') : '-';
			},
		},
	];

	if (access.edit_goods || access.set_goods_enabled || access.Operating_history_goods) {
		columns.push({
			title: '操作',
			dataIndex: 'option',
			width: 250,
			fixed: 'right',
			render: (_text, record) => {
				return (
					<div className='operation'>
						{access.edit_goods && !record.combined && !record.isEnabled && (
							<>
								<a
									className='handleLink'
									onClick={() => jumpPage(record.id, 2, record.name)}>
									编辑
								</a>
								<Divider type='vertical' />
							</>
						)}
						{/* DS环境只有绑定了货位才可以使用启用/禁用功能，如果后续有其他环境需要这样的话，则加入环境判断，如果全环境支持的话则去掉环境判断，直接判断是否有货位 */}
						{access.set_goods_enabled && (
							<Popconfirm
								placement='left'
								title={`确定${record.isEnabled ? '禁用' : '启用'}该${fields.baseGoods}吗？`}
								okText='确定'
								cancelText='取消'
								onCancel={(e) => {
									e?.stopPropagation();
								}}
								// @ts-ignore
								onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => e?.stopPropagation()}
								disabled={statusLoadingMap[record.id]}
								onConfirm={(e) => {
									e?.stopPropagation();
									handleUpdateEnabled(!record.isEnabled, record.id);
								}}>
								<a>{record.isEnabled ? '禁用' : '启用'}</a>
								<Divider type='vertical' />
							</Popconfirm>
						)}
						{access.goods_supply_channel && (
							<>
								<a
									className='handleLink'
									onClick={() => {
										openDistributorChannelModel(record.id);
									}}>
									供货渠道
								</a>
								<Divider type='vertical' />
							</>
						)}
						{WEB_PLATFORM === 'DS' &&
							record['goodsExtendedAttrMap.platformMatching'] !== 'false' && ( // 没有任何操作逻辑暂时，演示用的
								<>
									<a
										className='handleLink'
										onClick={() => {}}>
										平台匹配
									</a>
									<Divider type='vertical' />
								</>
							)}
						{access.Operating_history_goods && (
							<OperatingHistory
								trigger={<a>操作历史</a>}
								detail={record}
							/>
						)}
					</div>
				);
			},
		});
	}

	const finalColumns: ProColumns<GoodsRecord>[] = [];

	if (!loading) {
		const noConfigKeys = ['index', 'option'];
		const extendedColumns: ProColumns<GoodsRecord>[] = [];
		const listExtendedFields = (extendedFields || []).filter(
			(item) => item.listShow && item.listShow,
		);
		if (listExtendedFields.length) {
			listExtendedFields.forEach((item) => {
				const FieldKey = item.displayFieldKey === 'goodsExtendedAttrMap.platformMatching';

				const col: Record<string, any> = {
					title: item.displayFieldLabel,
					width: 'XS',
					dataIndex: item.displayFieldKey,
					filters: false,
				};
				if (FieldKey) {
					col.valueEnum = enabledPlatformMatchingValueEnum;
				}
				if (item.displayFieldType === 'Date') {
					col.renderText = (text: string) =>
						text && Number(text) ? moment(Number(text)).format('YYYY/MM/DD') : '';
				} else if (item.displayFieldType === 'Boolean' && !FieldKey) {
					col.renderText = (text: string) => (text === 'true' ? '是' : '否');
				}

				extendedColumns.push(col);
			});
		}

		let initSort = 9999;
		columns
			.concat(extendedColumns)
			.sort((a, b) => {
				const aKey = a.dataIndex || a.key;
				const bKey = b.dataIndex || b.key;
				const aField = fieldsMap[aKey as string] || {};
				const bField = fieldsMap[bKey as string] || {};

				let aSort = aField.listSort || ++initSort;
				let bSort = bField.listSort || ++initSort;

				if (aKey === 'index') {
					aSort = -1;
				} else if (aKey === 'option') {
					aSort = 99999;
				}
				if (bKey === 'index') {
					bSort = -1;
				} else if (bKey === 'option') {
					bSort = 99999;
				}
				return aSort - bSort;
			})
			.forEach((col) => {
				let key = col.dataIndex || col.key;
				const field = fieldsMap[key as string] || {};
				console.log('field', field, fieldsMap);

				if (
					key === 'specification' &&
					(field.listShow || (fieldsMap.model && fieldsMap.model.listShow))
				) {
					finalColumns.push({
						...col,
						title: `${field.displayFieldLabel || '规格'}/${
							(fieldsMap.model && fieldsMap.model.displayFieldLabel) || '型号'
						}`,
					});
				} else if (
					key === 'minGoodsNum' &&
					(field.listShow || (fieldsMap.largeBoxNum && fieldsMap.largeBoxNum.listShow))
				) {
					finalColumns.push({ ...col });
				} else if ((field && field.listShow) || noConfigKeys.includes(key as string)) {
					const FieldKey = field.displayFieldKey === 'goodsExtendedAttrMap.platformMatching';

					finalColumns.push({
						...col,
						title:
							key === 'option'
								? col.title
								: FieldKey
								? `${field.displayFieldLabel}状态`
								: field.displayFieldLabel
								? `${field.displayFieldLabel}${key === 'procurementPrice' ? '(元)' : ''}`
								: col.title,
					});
				}
			});
	}

	const getCheckboxProps = (record: GoodsRecord) => {
		let disabled;
		if (checkedState === 0) {
			disabled = false; // 如果没有选中，则disabled都为false
		} else if (checkedState === 3) {
			disabled = !!record.storageLocBarcode || record.isEnabled;
		} else if (checkedState === 2) {
			disabled = !record.isEnabled;
		} else {
			// 禁用(需要绑定货位走绑定货位按钮禁用逻辑)
			disabled = access.goodsBindAreaLocal
				? record.isEnabled || (needBindLocations ? !record.storageLocBarcode : true)
				: record.isEnabled;
		}
		return {
			disabled: disabled,
		};
	};

	console.log('finalColumns', finalColumns);

	return (
		<Spin
			spinning={loading}
			tip='Loading...'>
			{loading ? (
				<div style={{ height: 100 }} />
			) : (
				<ProTable<GoodsRecord>
					tableInfoCode='goods_list'
					rowKey='id'
					columns={finalColumns}
					api={pageList}
					params={{ isCombined: false }}
					tableRef={tableRef}
					requestCompleted={(rows) => {
						setIsExportFile(rows.length > 0);
					}}
					headerTitle={
						<div className='flex flex-between'>
							<div className='tableTitle'>
								<span
									className='tableAlert'
									style={{
										backgroundColor: CONFIG_LESS['@bgc_search'],
										borderRadius: '5px',
										marginLeft: '10px',
									}}>
									<ExclamationCircleFilled
										style={{
											color: CONFIG_LESS['@c_starus_await'],
											marginRight: '8px',
											fontSize: '12px',
										}}
									/>
									{/* <span className="consumeCount" style={{ color: '#ee3f3a', border: 0 }}>
                    注册效期30天内过期数 {summary.willExpireCount} 个 | 已过期数{' '}
                    {summary.expireCount} 个
                  </span> */}
									<span
										className='consumeCount'
										style={{ border: 0 }}>
										注册效期
										<span className='titlewarning'>
											30天内过期数（个）<span style={{ color: CONFIG_LESS['@c_body'] }}>：</span>
											<span className='tableNotificationTitleNum'>
												{summary.willExpireCount || 0}
											</span>
										</span>{' '}
										，
										<span className='titlehaveexpired'>
											{' '}
											已过期数（个）<span style={{ color: CONFIG_LESS['@c_body'] }}>：</span>
											<span className='tableNotificationTitleNum'>{summary.expireCount || 0}</span>
										</span>
									</span>
								</span>
							</div>
						</div>
					}
					searchKey='goods_list'
					// tableInfoId="2"
					searchConfig={{
						columns: searchColumns,
						form: searchForm,
					}}
					loadConfig={{
						request: false,
					}}
					onFinish={resetGoodsId}
					setRows={(res) => {
						const data = res.data || {};
						return {
							...data,
							rows: (data.rows || []).map((item: GoodsRecord) => ({
								...item,
								...(item.goodsExtendedAttrMap || {}),
							})),
						};
					}}
					// extraHeight={62}
					beforeSearch={(value) => {
						if (
							value.sortList &&
							value.sortList[0] &&
							value.sortList[0].sortName === 'temp.registration_end_date' &&
							value.sortList[0].desc
						) {
							value.sortList = [
								{
									...value.sortList[0],
									nullsLast: false,
								},
							];
						}
						return { ...value };
					}}
					rowSelection={
						access.set_goods_enabled || access.goodsBindAreaLocal
							? {
									selectedRowKeys,
									onSelect,
									onSelectAll,
									getCheckboxProps: (record) => getCheckboxProps(record),
							  }
							: undefined
					}
					tableAlertOptionRender={
						<a
							onClick={() => {
								setSelectedRowKeys([]);
								setSelectedList([]);
							}}>
							取消选择
						</a>
					}
					toolBarRender={() => [
						access.goodsBindAreaLocal && (
							<BindWarehouseAndLocationModal
								onFinish={() => {
									clear();
									tableRef.current?.reload();
								}}
								selectedList={selectedList}
								trigger={<Button type='primary'>绑定库房&货位</Button>}
							/>
						),
						access.set_goods_enabled && (
							<Button
								type='primary'
								disabled={checkedState !== 1}
								onClick={() => handleBatchUpdateStatus(1)}
								style={{ width: 100, padding: 0 }}>
								批量启用
							</Button>
						),
						access.set_goods_enabled && (
							<Button
								type='primary'
								disabled={checkedState !== 2}
								onClick={() => handleBatchUpdateStatus(2)}
								style={{ width: 100, padding: 0 }}>
								批量禁用
							</Button>
						),
						access.add_goods && (
							<Button
								icon={<PlusOutlined />}
								type='primary'
								onClick={() => {
									history.push({
										pathname: `/base_data/new_goods/add`,
										state: { params: { ...searchForm.getFieldsValue() } },
									});
								}}
								className='iconButton'>
								新增
							</Button>
						),
						access.goods_export && (
							<ExportFile
								data={{
									filters: { ...getSearchParams() },
									link: exportGoodsTypes,
									getForm: getSearchParams,
								}}
								disabled={!isExportFile}
							/>
						),
					]}
				/>
			)}
			{distributorChannelVisible && (
				<DistributorChannelModel
					visible={distributorChannelVisible}
					handleVisible={() => {
						setDistributorChannelVisible(false);
					}}
					allDistributorList={distributorList}
					goodsId={goodsId!}
				/>
			)}
		</Spin>
	);
};

export default connect(({ global }: ConnectState) => ({ global }))(Goods);
