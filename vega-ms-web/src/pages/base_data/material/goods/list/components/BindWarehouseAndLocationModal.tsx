import type { FC } from 'react';
import type { ProColumns } from '@/components/ProTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import type { DefaultOptionType } from 'antd/lib/select';

import {
	useEffect,
	useState,
	cloneElement,
	ReactElement,
	useCallback,
	useMemo,
	useRef,
} from 'react';
import { Modal, Tooltip, Popconfirm, Select, Form, Badge, Spin } from 'antd';
import { useModel } from 'umi';
import moment from 'moment';
import ProTable from '@/components/ProTable';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';

import { antiEpidemicTypeTextMap } from '@/constants/dictionary';
import { pageList } from '@/services/newGoodsTypes';
import { listByStorageArea } from '@/services/storageCabinets';
import { findLocationCanBindByCabinetId, goodsBatchBindLocation } from '@/services/storageLocation';
import { sortListByLevel } from '@/services/storageAreas';
import { scrollTable } from '@/utils';
import { string } from 'prop-types';
import { dealPackNum } from '@/utils/dataUtil';
type GoodsRecord = Omit<NewGoodsTypesController.GoodsRecord, 'id'> & { id: number };
type StorageAreaRecord = StorageAreasController.StorageAreaRecord;
type CabinetsRecord = StorageCabinetsController.CabinetsRecord & DefaultOptionType;
type LocationRecord = StorageLocationController.LocationRecord & DefaultOptionType;

const FormItem = Form.Item;

const statusValueEnum = {
	false: {
		text: '未绑定',
		color: CONFIG_LESS['@c_starus_warning'],
	},
	true: {
		text: '已绑定',
		color: CONFIG_LESS['@c_starus_done'],
	},
};
const typeMap = {
	1: 'storageAreaIds',
	2: 'storageCabinetIds',
	3: 'storageLocationIds',
};

// 此组件回填和填充数据比较恶心，实现请看fillData函数，具体逻辑请看http://192.168.10.25:8090/pages/viewpage.action?pageId=39689014
const BindWarehouseAndLocationModal: FC<{
	trigger: ReactElement;
	disabled?: boolean;
	selectedList?: NewGoodsTypesController.GoodsRecord[];
	onFinish: () => void;
}> = ({ trigger, disabled, selectedList = [], onFinish }) => {
	const [visible, setVisible] = useState<boolean>(false);
	const [_refresh, setRefresh] = useState<number>();
	const [loading, setLoading] = useState<boolean>(false);
	const [submitLoading, setSubmitLoading] = useState<boolean>(false);
	const [dataSource, setDataSource] = useState<GoodsRecord[]>([]);
	const [storageAreaList, setStorageAreaList] = useState<StorageAreaRecord[]>([]);
	// 货架数据缓存列表
	const [cabinetListMap, setCabinetListMap] = useState<Record<string, CabinetsRecord[]>>({});
	// 初始化如果只有一个库房的话后续都用这个列表的数据
	const [cabinetList, setCabinetList] = useState<CabinetsRecord[] | undefined>();
	// 货位数据缓存列表
	const [locationListMap, setLocationListMap] = useState<Record<string, LocationRecord[]>>({});
	const [locationList, setLocationList] = useState<LocationRecord[] | undefined>();
	const { fields } = useModel('fieldsMapping');
	const { loading: fieldLoading, fieldsMap, extendedFields } = useModel('goodsField');
	const [form] = Form.useForm();
	const [searchForm] = Form.useForm();
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const listRef = useRef<GoodsRecord[]>([]);
	const selectedKeys = useMemo(() => {
		listRef.current = dataSource;
		return dataSource.map((item) => item.id);
	}, [dataSource]);
	const resetData = useCallback(() => {
		setDataSource([]);
		setStorageAreaList([]);
		setCabinetListMap({});
		setCabinetList(undefined);
		setLocationListMap({});
		setLocationList(undefined);
	}, []);

	// 选择物资后设置选择框的值
	const fillData = (record: GoodsRecord, index?: number) => {
		const values: Record<string, any> = {};
		// 如果已经绑定货位，则回填数据
		if (!!record.storageLocBarcode) {
			values[`${typeMap[1]}_${record.id}`] = record.storageAreaId;
			values[`${typeMap[2]}_${record.id}`] = record.storageCabinetId;
			values[`${typeMap[3]}_${record.id}`] = record.storageLocationId;

			// 如果没有默认的货架列表则去获取
			if (!cabinetList || !cabinetList.length) {
				getCabinets(record.storageAreaId as number, {
					goodsId: record.id,
					isNeedToGetLocation: false,
				});
			}

			if (!locationList || !locationList.length) {
				getStorageLocations(record.storageCabinetId as number, false, record.id);
			}
		} else {
			// 未绑定货位，并且库房长度只有1
			if (storageAreaList.length === 1) {
				values[`${typeMap[1]}_${record.id}`] = storageAreaList[0].id;

				if (cabinetList) {
					// 如果初始获取的货架长度为1的话执行这里
					if (cabinetList.length === 1) {
						values[`${typeMap[2]}_${record.id}`] = cabinetList[0].id;

						if (locationList) {
							// 如果初始获取的货位长度为1的话执行这里
							if (locationList.length === 1) {
								values[`${typeMap[3]}_${record.id}`] = locationList[0].id;
							} else {
								getStorageLocations(cabinetList[0].id, false, record.id);
							}
						}
					}
				} else {
					getCabinets(storageAreaList[0].id, { goodsId: record.id });
				}
			}
		}
		form.setFieldsValue(values);
		// setTimeout(() => {
		//   form.setFieldsValue(values);
		// }, 4 + (index || 0) * 2);
	};

	useEffect(() => {
		// 弹窗展示后，并且获取完库房、货架以及货位列表数据后回填数据
		const len = storageAreaList.length;
		const dLen = selectedList.length;
		if (visible && !loading && len > 0 && dLen > 0) {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
			timerRef.current = setTimeout(() => {
				selectedList.forEach(fillData);
				setRefresh(Date.now());
			}, 50);
		}
	}, [visible, loading, selectedList, storageAreaList]);

	useEffect(() => {
		if (visible) {
			if (selectedList.length > 0) {
				setDataSource([...selectedList]);
			}
		} else {
			resetData();
		}
	}, [visible, selectedList]);

	/**
	 * 获取货位列表
	 * @param {number} id 货架id
	 * @param {boolean} isInit 是否是首次加载
	 * @param {number} goodsId 物资id，非必传
	 */
	const getStorageLocations = useCallback(
		async (id: number, isInit: boolean, goodsId?: number) => {
			if (isInit) {
				setLoading(true);
			}
			try {
				const res = await findLocationCanBindByCabinetId(id, goodsId ? { goodsId } : {});
				if (res && res.code === 0) {
					const { data } = res;
					const list = (data || []).map((item) => ({
						...item,
						label: item.storageLocBarcode,
						value: item.id,
					}));
					const len = list.length;

					if (goodsId) {
						setLocationListMap((dataMap) => ({ ...dataMap, [goodsId]: list }));
					}

					if (isInit) {
						setLocationList(list || []);
					}

					if (len === 1 && goodsId) {
						form.setFieldsValue({ [`${typeMap[3]}_${goodsId}`]: list[0].id });
						setRefresh(Date.now());
					}
				}
				if (isInit) {
					setLoading(false);
				}
			} catch (e) {
				if (isInit) {
					setLoading(false);
				}
			}
		},
		[form],
	);

	/**
	 * 获取货架列表
	 * @param {number} id 库房id
	 * @param {boolean} params.isInit 是否是首次加载，默认为false，非必传
	 * @param {number} params.goodsId 物资id，非必传
	 * @param {boolean} params.isNeedToGetLocation 是否需要加载货位，默认为true，非必传
	 */
	const getCabinets = useCallback(
		async (
			id: number,
			params: {
				isInit?: boolean;
				goodsId?: number;
				isNeedToGetLocation?: boolean;
			} = {},
		) => {
			const { isInit = false, goodsId, isNeedToGetLocation = true } = params || {};
			if (isInit) {
				setLoading(true);
			}
			try {
				const res = await listByStorageArea({ storageAreaId: id });
				if (res && res.code === 0) {
					const { data } = res;
					const list = (data || []).map((item) => ({ ...item, label: item.name, value: item.id }));
					const len = list.length;
					if (goodsId) {
						setCabinetListMap((dataMap) => ({ ...dataMap, [goodsId]: list }));
					}

					if (isInit) {
						setCabinetList(list || []);
					}
					if (len === 1) {
						if (goodsId) {
							form.setFieldsValue({ [`${typeMap[2]}_${goodsId}`]: list[0].id });
							setRefresh(Date.now());
						}
						if (isNeedToGetLocation) {
							getStorageLocations(list[0].id, isInit, goodsId);
						}
					} else {
						if (isInit) {
							setLoading(false);
						}
					}
				} else {
					if (isInit) {
						setLoading(false);
					}
				}
			} catch (e) {
				if (isInit) {
					setLoading(false);
				}
			}
		},
		[form, getStorageLocations],
	);

	// 获取库房列表
	const getStorageAreas = useCallback(async () => {
		setLoading(true);
		try {
			const res = await sortListByLevel({ isCenterWarehouse: true });
			if (res && res.code === 0) {
				const list = (res.data || []).map((item) => ({
					...item,
					label: item.name,
					value: item.id,
				}));
				setStorageAreaList(list);
				// 只有一个库房的话直接请求所在货架数据
				if (list.length === 1) {
					getCabinets(list[0].id, { isInit: true });
				} else {
					setLoading(false);
				}
			}
		} catch (e) {
			setLoading(false);
		}
	}, [getCabinets]);

	useEffect(() => {
		if (visible) {
			getStorageAreas();
		}
	}, [visible, getStorageAreas]);

	/**
	 * 物资列表删除一项
	 *
	 * @param {number} id 物资id
	 */
	const handleDeleteItem = useCallback((id: number) => {
		setDataSource((list) => [...list.filter((item) => item.id !== id)]);
		setCabinetListMap((data) => {
			delete data[id];
			return { ...data };
		});
		setLocationListMap((data) => {
			delete data[id];
			return { ...data };
		});
	}, []);

	/**
	 * 库房选择回调
	 *
	 * @param {number} value 库房id
	 * @param {number} id 物资id
	 */
	const handleStorageAreaChange = useCallback(
		(value: number, id: number) => {
			form.resetFields([`${typeMap[2]}_${id}`, `${typeMap[3]}_${id}`]);
			setRefresh(Date.now());
			setCabinetListMap((data) => {
				delete data[id];
				return { ...data };
			});
			setLocationListMap((data) => {
				delete data[id];
				return { ...data };
			});
			if (value) {
				getCabinets(value, { goodsId: id });
			}
		},
		[form, getCabinets],
	);

	/**
	 * 货架选择回调
	 *
	 * @param {number} value 货架id
	 * @param {number} id 物资id
	 */
	const handleCabinetChange = useCallback(
		(value: number, id: number) => {
			form.resetFields([`${typeMap[3]}_${id}`]);
			setRefresh(Date.now());
			setLocationListMap((data) => {
				delete data[id];
				return { ...data };
			});
			if (value) {
				getStorageLocations(value, false, id);
			}
		},
		[form, getStorageLocations],
	);

	const handleSubmit = useCallback(async () => {
		try {
			const values = await form.validateFields();
			const goodsBindMap: Record<number, number[]> = {};
			// 如果后续需要兼容1对多，select请改成
			const keys = Object.keys(values);
			// 获取货位数据
			keys.forEach((key) => {
				if (key.includes(typeMap[3])) {
					const goodsId = Number(key.split('_')[1]);
					if (goodsBindMap[goodsId]) {
						goodsBindMap[goodsId].push(values[key]);
					} else {
						goodsBindMap[goodsId] = [values[key]];
					}
				}
			});

			setSubmitLoading(true);
			try {
				const res = await goodsBatchBindLocation(goodsBindMap);
				if (res && res.code === 0) {
					setVisible(false);
					typeof onFinish === 'function' && onFinish();
					notification.success(res.msg);
				}
				setSubmitLoading(false);
			} catch (e) {
				setSubmitLoading(false);
			}
		} catch (e) {
			if (e && e?.errorFields) {
				let id = Number(e?.errorFields[0].name[0].split('_')[1]);
				let index = listRef.current.findIndex((val) => val.id === id);
				scrollTable(Number(index) + 1, 'tableEle');
			}
		}
	}, [form, resetData, onFinish]);

	const searchTableColumns: ProColumns<GoodsRecord>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			width: 60,
			align: 'center',
			render: (_text, _record, index) => `${index + 1}`,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			ellipsis: true,
			width: 180,
		},
		{
			title: '产品主码',
			dataIndex: 'pmCode',
			ellipsis: true,
			width: 160,
		},
		{
			title: 'DI',
			dataIndex: 'diCode',
			ellipsis: true,
			width: 220,
			render: (_text, record) => {
				const { diCode } = record;
				const diCodeList: string[] = diCode ? diCode.split(';') : [];
				const len = diCodeList.length;
				const title = diCodeList.map((item, index) => {
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
			ellipsis: true,
			width: 160,
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			ellipsis: true,
			width: 160,
		},
		{
			title: '注册效期',
			dataIndex: 'registrationDueDate',
			ellipsis: true,
			key: 'temp.registration_end_date',
			width: 160,
			sorter: true,
			render: (_text, record) => {
				const { registrationDueDate, isConsumableMaterial } = record;
				// 由于后端返回的时间戳为当天0时0分0秒这样的话一天才开始就过期，所以只需要29天+1秒
				const showRedText = (registrationDueDate || 0) - Date.now() <= 2505601000;
				// VEGA-7198
				return isConsumableMaterial ? (
					<span
						style={
							registrationDueDate && showRedText ? { color: CONFIG_LESS['@c_starus_warning'] } : {}
						}>
						{registrationDueDate ? moment(registrationDueDate).format('YYYY/MM/DD') : '长期有效'}
					</span>
				) : (
					'-'
				);
			},
		},
		// {
		//   title: fields.distributor,
		//   dataIndex: 'distributorName',
		//   ellipsis: true,
		//   width: 160,
		// },
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			ellipsis: true,
			width: 160,
		},
		{
			title: '国家医保编码',
			dataIndex: 'nationalNo',
			ellipsis: true,
			width: 160,
		},
		{
			title: fields.goodsProperty,
			dataIndex: 'isHighValue',
			ellipsis: true,
			width: 120,
			render: (text) => (typeof text === 'boolean' ? (text ? '高值' : '低值') : '-'),
		},
		{
			title: fields.goodsType,
			dataIndex: 'materialCategory',
			ellipsis: true,
			width: 120,
		},
		{
			title: fields.antiEpidemic,
			dataIndex: 'antiEpidemic',
			ellipsis: true,
			width: 120,
			render: (text) => antiEpidemicTypeTextMap[`${text}`] || '',
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			ellipsis: true,
			key: 'specification',
			width: 160,
			render: (text, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '单价(元)',
			dataIndex: 'procurementPrice',
			ellipsis: true,
			key: 'procurementPrice',
			align: 'right',
			width: 100,
			render: (text) => convertPriceWithDecimal(text as number),
		},
		{
			title: '计价单位',
			dataIndex: 'minGoodsUnit',
			ellipsis: true,
			width: 80,
		},
		{
			title: '大/中包装',
			dataIndex: 'minGoodsNum',
			ellipsis: true,
			width: 100,
			render: (text, record) => dealPackNum(record.largeBoxNum, record.minGoodsNum),
		},
		{
			title: '重点品种',
			dataIndex: 'keyItem',
			ellipsis: true,
			width: 120,
			render: (text, record) => {
				return record.isBarcodeControlled && typeof text === 'boolean' ? (text ? '是' : '否') : '-';
			},
		},
		{
			title: '所属库房',
			dataIndex: 'storageAreaName',
			ellipsis: true,
			width: 120,
			hideInTable: WEB_PLATFORM !== 'DS',
		},
		{
			title: '所属货位',
			dataIndex: 'storageLocBarcode',
			ellipsis: true,
			width: 120,
			hideInTable: WEB_PLATFORM !== 'DS',
		},
	];

	const finalColumns: ProColumns<GoodsRecord>[] = [];
	if (!fieldLoading) {
		const extendedColumns: ProColumns<GoodsRecord>[] = [];
		const listExtendedFields = (extendedFields || []).filter((item) => item.listShow);
		if (listExtendedFields.length) {
			listExtendedFields.forEach((item) => {
				const isPlatformMatching = item.displayFieldKey === 'goodsExtendedAttrMap.platformMatching';
				if (!isPlatformMatching) {
					const col: Record<string, any> = {
						title: item.displayFieldLabel,
						width: 100,
						dataIndex: item.displayFieldKey,
						filters: false,
					};
					if (item.displayFieldType === 'Date') {
						col.renderText = (text: string) =>
							text && Number(text) ? moment(Number(text)).format('YYYY/MM/DD') : '';
					} else if (item.displayFieldType === 'Boolean') {
						col.renderText = (text: string) => (text === 'true' ? '是' : '否');
					}

					extendedColumns.push(col);
				}
			});
		}

		searchTableColumns
			.concat(extendedColumns)
			.sort((a, b) => {
				const aKey: any = a.dataIndex || a.key;
				const bKey: any = b.dataIndex || b.key;
				const aField = fieldsMap[aKey as string] || {};
				const bField = fieldsMap[bKey as string] || {};

				let aSort = aField.listSort;
				let bSort = bField.listSort;

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
				} else if ((field && field.listShow) || key === 'index') {
					const isPlatformMatching =
						field.displayFieldKey === 'goodsExtendedAttrMap.platformMatching';

					if (!isPlatformMatching) {
						finalColumns.push({
							...col,
							title: field.displayFieldLabel
								? `${field.displayFieldLabel}${key === 'procurementPrice' ? '(元)' : ''}`
								: col.title,
						});
					}
				}
			});
	}

	const searchColumns: ProFormColumns = [
		{
			title: `${fields.goods}编码/名称`,
			valueType: 'selectTable',
			dataIndex: 'goodsId',
			fieldProps: {
				api: pageList,
				selectRowKeys: selectedKeys,
				showArrow: false,
				searchKey: 'goodsNameOrCode',
				labelKey: 'name',
				valueKey: 'id',
				filterData: (res: ResponseList<NewGoodsTypesController.GoodsRecord[]>) => {
					return res.data.rows;
				},
				onChange: (value: number, option: GoodsRecord) => {
					if (value) {
						searchForm.resetFields(['goodsId']);
						if (selectedKeys.includes(value)) {
							notification.warn(`${fields.goods} ${option.name} 已存在列表中！`);
						} else {
							const list = [...dataSource];
							list.push(option);
							setDataSource(list);
							// 填充数据逻辑
							fillData(option);
						}
					}
				},
				params: {
					pageNum: 0,
					pageSize: 100,
				},
				tableProps: {
					rowKey: 'id',
					columns: finalColumns,
				},
			},
		},
	];

	const columns: ProColumns<GoodsRecord>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			align: 'center',
			width: 'XXS',
			render: (_text, _record, index) => index + 1,
		},
		{
			title: '状态',
			dataIndex: 'bindStatus',
			width: 'XS',
			render: (_text, record) => <Badge {...statusValueEnum[`${!!record.storageLocBarcode}`]} />,
		},
		{
			title: '药品名称',
			dataIndex: 'name',
			width: 'XL',
		},
		{
			title: '所属库房',
			dataIndex: typeMap[1],
			width: 'XL',
			render: (_text, record) => (
				<FormItem
					className='storage-form-item'
					name={`${typeMap[1]}_${record.id}`}
					rules={[{ required: true, message: '' }]}>
					<Select
						showSearch={false}
						placeholder=''
						options={storageAreaList}
						style={{ width: '100%' }}
						onChange={(value) => handleStorageAreaChange(value, record.id)}
					/>
				</FormItem>
			),
		},
		{
			title: '所属货架',
			dataIndex: typeMap[2],
			width: 'XL',
			render: (_text, record) => (
				<FormItem
					className='storage-form-item'
					name={`${typeMap[2]}_${record.id}`}
					rules={[{ required: true, message: '' }]}>
					<Select
						showSearch={false}
						placeholder=''
						options={
							(cabinetList && cabinetList.length > 0 && cabinetList) ||
							cabinetListMap[record.id] ||
							[]
						}
						style={{ width: '100%' }}
						onChange={(value) => handleCabinetChange(value, record.id)}
						disabled={!form.getFieldValue(`${typeMap[1]}_${record.id}`)}
					/>
				</FormItem>
			),
		},
		{
			title: '所属货位',
			dataIndex: typeMap[3],
			width: 'XL',
			render: (_text, record) => (
				<FormItem
					className='storage-form-item'
					name={`${typeMap[3]}_${record.id}`}
					rules={[{ required: true, message: '' }]}>
					<Select
						showSearch={false}
						placeholder=''
						options={
							(locationList && locationList.length > 0 && locationList) ||
							locationListMap[record.id] ||
							[]
						}
						style={{ width: '100%' }}
						disabled={!form.getFieldValue(`${typeMap[2]}_${record.id}`)}
					/>
				</FormItem>
			),
		},
		{
			title: '操作',
			dataIndex: 'option',
			width: 'XXXS',
			render: (_text, record) => {
				return (
					<Popconfirm
						title={`确定删除 ${record.name} 吗？`}
						onConfirm={() => handleDeleteItem(record.id)}>
						<a href='javascript:;'>删除</a>
					</Popconfirm>
				);
			},
		},
	];

	return (
		<>
			{cloneElement(trigger, {
				onClick: () => {
					if (!disabled) {
						setVisible(true);
					}
				},
			})}
			<Modal
				visible={visible}
				maskClosable={false}
				title='绑定库房&货位'
				onCancel={() => {
					setVisible(false);
				}}
				okButtonProps={{
					loading: submitLoading,
					disabled: !dataSource.length,
				}}
				okText='保存'
				destroyOnClose
				className='ant-detail-modal'
				onOk={handleSubmit}>
				<Form
					form={form}
					component={false}
					scrollToFirstError
					preserve={false}
					colon={false}>
					<Spin spinning={loading || fieldLoading}>
						<div id='tableEle'>
							<ProTable<GoodsRecord>
								dataSource={dataSource}
								searchConfig={{
									columns: searchColumns,
									submitter: false,
									form: searchForm,
								}}
								columns={columns}
								scroll={{
									x: '100%',
									y: 300,
								}}
								options={{
									density: false,
									fullScreen: false,
									setting: false,
								}}
								pagination={false}
								rowKey='id'
								className='bind-warehouse-and-location-form'
							/>
						</div>
					</Spin>
				</Form>
			</Modal>
		</>
	);
};

export default BindWarehouseAndLocationModal;
