import ExportFile from '@/components/ExportFile';
import ThermalPrinter from '@/components/print/ThermalPrinter';
import ProTable from '@/components/ResizableTable';
import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import {
	goodsExpiryDate,
	presenterOptions,
	stockGoodsStatus,
	stockGoodsStatusAllValueEnum,
} from '@/constants/dictionary';
import { useGoodsType } from '@/hooks/useGoodsType';
import { useStoreRoomList, useWarehouseList } from '@/hooks/useWarehouseList';
import { loadBlankBarcode } from '@/services/print';
import { queryGoodsStockList } from '@/services/stock';
import { retryPrintBarcode, getUrlParam } from '@/utils';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Button, Form, InputNumber, Popover } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { history, useAccess, useModel } from 'umi';
import { propsType } from './data';
import DetailModal from './detail/index';
import moment from 'moment';
import { getListByUser } from '@/services/distributor';

const Goods: React.FC<propsType> = ({ ...props }) => {
	const { handleprops, style } = props;
	const { type, setType } = handleprops;
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const presenter = useRef<boolean>(false);
	const warehouseId = useRef<number>(0);
	// 用于判断是否可以选择库房
	const [warehouseIds, setWarehouseIds] = useState<number[]>([]);
	// 请求完成了之后用于查看功能传参
	const [storageAreaId, setStorageAreaId] = useState<number>();
	const [sumPrice, setSumPrice] = useState<number>(0);
	const tableRef = useRef<ProTableAction>();
	const thermalPrinter = useRef<Record<string, any>>();
	const [expirationStatus, setExpirationStatus] = useState<string>('');
	const [popoverVisible, setPopoverVisible] = useState<boolean>(false);
	const [printNum, setPrintNum] = useState<number>(1);
	const access = useAccess();
	const [isExportFile, setIsExportFile] = useState(false);
	const { storeRoomList, setStoreRoomList, getStorageAreas } = useStoreRoomList();
	const warehouseList = (useWarehouseList() || []).map((item) => {
		const { name, id, nameAcronym } = item;
		if (name && name == '中心仓库') {
			warehouseId.current = id;
		}
		return { value: id, label: name, key: (nameAcronym || '') + '' + name };
	});
	const tagsData = useGoodsType({ goodsValue: '1', ordinaryValue: '2' }); //类型
	useEffect(() => {
		form.setFieldsValue({ type: [type] });
	}, [type]);

	useEffect(() => {
		const state = history?.location.state as { status: string };
		if (state?.status) {
			form.setFieldsValue({ statusList: state?.status });
			setTimeout(() => form.submit(), 200);
		}
	}, []);

	const searchColumns: ProFormColumns<StockController.GetGoodsStockListList> = [
		{
			title: '类型',
			dataIndex: 'type',
			valueType: 'tagSelect',
			fieldProps: {
				defaultValue: ['1'],
				multiple: false,
				options: tagsData,
				onChange: (value: '1' | '2' | undefined) => {
					if (value) {
						setType(value);
					}
				},
			},
		},
		{
			title: '状态',
			dataIndex: 'statusList',
			valueType: 'tagSelect',
			fieldProps: {
				options: stockGoodsStatus,
			},
		},
		{
			title: `赠送${fields.goods}`,
			dataIndex: 'presenter',
			valueType: 'tagSelect',
			initialValue: ['false'],
			fieldProps: {
				multiple: false,
				options: presenterOptions,
			},
		},
		{
			title: '效期(天)',
			dataIndex: 'expirationDates',
			valueType: 'select',
			fieldProps: {
				mode: 'multiple',
				showArrow: true,
				options: goodsExpiryDate,
			},
		},
		{
			title: '仓库',
			dataIndex: 'warehouseIds',
			valueType: 'select',
			fieldProps: {
				mode: 'multiple',
				showSearch: true,
				showArrow: true,
				options: warehouseList,
				onChange: (val) => {
					setWarehouseIds(val || []);
					if (!val || !val.length) {
						setStoreRoomList([]);
						form.resetFields(['storageAreaId']);
					}
					if (val && val.length > 0) {
						getStorageAreas({ warehouseIds: val });
					}
				},
				filterOption: (input, option: any) => {
					return option['data-item'].key.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '库房',
			dataIndex: 'storageAreaId',
			valueType: 'select',
			fieldProps: {
				showSearch: true,
				showArrow: true,
				options: storeRoomList,
				disabled: !warehouseIds.length,
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
		},
		{
			title: fields.goodsName,
			dataIndex: 'name',
			fieldProps: {
				placeholder: `可通过${fields.goodsName}或首字母查询`,
			},
		},
		{
			title: '规格/型号',
			dataIndex: 'commonSearch.specificationAndModel',
		},
		{
			title: '批号',
			dataIndex: 'lotNum',
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
		},
		{
			title: '国家医保编码',
			dataIndex: 'nationalNo',
		},
		{
			title: fields.distributor,
			dataIndex: 'distributorId',
			valueType: 'apiSelect',
			fieldProps: {
				api: getListByUser,
				params: { pageSize: 9999, pageNum: 0 },
				fieldConfig: {
					label: 'companyName',
					value: 'id',
				},
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
	];

	useEffect(() => {
		let value = warehouseId.current;
		if (value && expirationStatus) {
			form.setFieldsValue({
				warehouseIds: value,
			});
		}
	}, [warehouseId.current, expirationStatus]);

	useEffect(() => {
		if (type === '1') {
			const val = getUrlParam(location.search, 'expirationStatus');
			const warehouseIds = getUrlParam(location.search, 'warehouseIds');
			const state = history?.location.state as { status: string };
			if (state?.status) {
				form.setFieldsValue({ statusList: state?.status });
			}
			if (val) {
				setExpirationStatus(val);
				form.setFieldsValue({
					expirationDates: val,
					warehouseIds: Number(warehouseIds),
				});
			}
			if (val || state?.status) {
				setTimeout(() => form.submit(), 200);
			}
			let tabList = JSON.parse(sessionStorage.getItem('dictionary') || '{}').package_config || [];
			tabList.map((value: { text: string }) => {
				if (value.text == '医耗套包') {
					presenter.current = false;
				}
			});
		}
	}, [location.search]);
	// 转化表单数据为后端所需参数格式
	const convertSearchParams = () => {
		let params = tableRef.current?.getParams();
		params = {
			presenter: presenter.current,
			...params,
		};
		return params;
	};

	// 打印空白条码
	const printBarCode = async (record: Record<string, any>) => {
		if (!Object.keys(thermalPrinter.current?.state.selected_device).length) {
			notification.warning('请先选择打印机');
			return;
		}
		let res = await loadBlankBarcode(printNum);
		if (res && res.code === 0) {
			let printResult = thermalPrinter?.current?.print(res.data);
			printResult.xhr.onreadystatechange = async function () {
				// 当打印结果为500时，修改当前打印条目状态为打印失败
				if (printResult.xhr.readyState === 4 && printResult.xhr.status >= 500) {
					// 当打印失败时重试，默认重试三次
					retryPrintBarcode(thermalPrinter.current, res.data);
				}
			};
			setPopoverVisible(false);
		}
	};

	const columns: ProColumns<StockController.GetQueryGoodsStockListList>[] = [
		{
			width: 'XXS',
			title: '序号',
			dataIndex: 'index',
			align: 'center',
			render: (text, record, index) => {
				return <span>{index + 1}</span>;
			},
		},
		{
			width: 'XS',
			title: '状态',
			dataIndex: 'status',
			filters: false,
			valueEnum: stockGoodsStatusAllValueEnum,
		},
		{
			width: 'M',
			title: '仓库',
			dataIndex: 'warehouseName',
			ellipsis: true,
		},
		{
			width: 'L',
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			ellipsis: true,
		},
		{
			width: 'L',
			title: 'DI',
			dataIndex: 'diCode',
			ellipsis: true,
		},
		{
			width: 'L',
			title: fields.goodsName,
			dataIndex: 'goodsName',
			ellipsis: true,
		},
		{
			width: 'XS',
			title: '通用名',
			dataIndex: 'commonName',
			ellipsis: true,
		},
		{
			width: 'L',
			title: '规格/型号',
			dataIndex: 'specification',
			ellipsis: true,
			renderText: (text: string, record) => formatStrConnect(record, ['specification', 'model']),
		},
		{
			width: 'L',
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			ellipsis: true,
		},
		{
			width: 'XXL',
			title: fields.distributor,
			dataIndex: 'distributorName',
			ellipsis: true,
		},
		{
			width: 'S',
			title: '批号',
			dataIndex: 'lotNum',
			ellipsis: true,
			renderText: (text) => <span>{text || '-'}</span>,
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
			width: 'S',
			title: fields.goodsProperty,
			dataIndex: 'highValue',
			renderText: (text: boolean) => (typeof text === 'boolean' ? (text ? '高值' : '低值') : '-'),
		},
		{
			width: 'XXS',
			title: '单价(元)',
			dataIndex: 'procurementPrice',
			align: 'right',
			renderText: (text: number, record) => (
				<span>{text ? convertPriceWithDecimal(text) : '-'}</span>
			),
		},
		{
			width: 'XXXS',
			title: '单位',
			dataIndex: 'unitName',
		},
		{
			width: 'XXXS',
			title: '数量',
			dataIndex: 'quantity',
		},
		{
			width: 'XXS',
			title: '小计(元)',
			dataIndex: 'totalAmount',
			align: 'right',
			render: (text, record) => {
				return (
					<span>{record.totalAmount ? convertPriceWithDecimal(record.totalAmount) : '-'}</span>
				);
			},
		},
		{
			title: '有效期至',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width: 120,
			renderText: (text) => (text ? moment(text).format('YYYY/MM/DD') : '-'),
		},
		{
			width: 'S',
			title: '效期(天)',
			dataIndex: 'remainDay',
			sorter: true,
			key: 'inn.remain_day',
			render: (text, record) => {
				let name: string =
					(record.remainDay as number) <= 0
						? 'cl_FF110B'
						: (record.remainDay as number) < (record.nearExpirationDays as number)
						? 'cl_FF9F00'
						: '';
				return (
					<span className={name}>
						{(record.remainDay as number) > 0 ? `${record.remainDay}` : '已过期'}
					</span>
				);
			},
		},
		{
			width: 'XXS',
			title: '操作',
			dataIndex: 'option',
			fixed: 'right',
			render: (id, record) => {
				return (
					access.inventory_quantity_view && (
						<div className='operation'>
							<DetailModal
								trigger={<span className='handleLink'>查看</span>}
								record={record}
								storageAreaId={storageAreaId}
								activeTab={'goods'}
							/>
						</div>
					)
				);
			},
		},
	];

	return (
		<div style={style}>
			<ProTable
				tableInfoCode='inventory_quantity_goods_list'
				searchConfig={{
					form,
					columns: searchColumns,
				}}
				loadConfig={{
					request: false,
				}}
				api={queryGoodsStockList}
				rowKey={(record, index) => index as number}
				columns={columns}
				requestCompleted={(list, params, dataObj: Record<string, any>) => {
					setIsExportFile(list.length > 0);
					setSumPrice(dataObj.sumPrice);
					setStorageAreaId(params.storageAreaId);
				}}
				tableRef={tableRef}
				beforeSearch={(value: Record<string, any>) => {
					const { warehouseIds, statusList, presenter } = value;
					const params = {
						...value,
						presenter: presenter ? (presenter === 'all' ? '' : presenter.toString()) : undefined,
						warehouseIds: warehouseIds ? warehouseIds.toString() : undefined,
						statusList: statusList ? statusList.toString() : undefined,
						expirationDates: value.expirationDates ? value.expirationDates.toString() : undefined,
					};
					return params;
				}}
				toolBarRender={() => [
					<div
						className='thermalPrinterWrap'
						style={{ marginBottom: 0 }}>
						<label>*</label>
						<span>选择打印设备 :</span>
						<ThermalPrinter ref={thermalPrinter as any} />
					</div>,
					<Popover
						placement='bottom'
						title='批量打印'
						visible={popoverVisible}
						onVisibleChange={(visible) => {
							visible && setPrintNum(1);
							setPopoverVisible(visible);
						}}
						content={() => (
							<>
								<div style={{ marginTop: 10, paddingRight: 30 }}>
									数量：
									<InputNumber
										min={1}
										max={999}
										style={{ width: 100 }}
										value={printNum}
										onChange={(value) => setPrintNum(value ?? 1)}
									/>
								</div>
								<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
									<Button
										size='small'
										style={{ minWidth: 50 }}
										onClick={() => {
											setPopoverVisible(false);
										}}>
										取消
									</Button>
									<Button
										size='small'
										style={{ marginLeft: 10, minWidth: 50 }}
										type='primary'
										onClick={printBarCode}>
										确定
									</Button>
								</div>
							</>
						)}
						trigger='click'>
						<Button
							type='primary'
							style={{ width: 100, padding: 0 }}
							onClick={() => {
								setPopoverVisible(true);
							}}>
							打印空白条码
						</Button>
					</Popover>,
					access.consume_history_export && (
						<ExportFile
							data={{
								filters: { ...convertSearchParams() },
								link: '/api/admin/stock/1.0/goods/export',
								getForm: convertSearchParams,
							}}
							disabled={!isExportFile}
						/>
					),
				]}
				headerTitle={
					sumPrice > 0 && (
						<div className='flex flex-between'>
							<div className='tableTitle'>
								<span className='tableAlert'>
									<ExclamationCircleFilled
										style={{
											color: CONFIG_LESS['@c_starus_await'],
											marginRight: '8px',
											fontSize: '12px',
										}}
									/>
									<span className='consumeCount'>
										总金额：￥
										<span className='count'>{convertPriceWithDecimal(sumPrice) || 0}</span>
									</span>
								</span>
							</div>
						</div>
					)
				}
			/>
		</div>
	);
};

export default Goods;
