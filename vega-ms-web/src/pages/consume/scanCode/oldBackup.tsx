// 旧文件备份

import Breadcrumb from '@/components/Breadcrumb';
import { DescriptionsItemProps } from '@/components/Descriptions/typings';
import { ProColumns } from '@ant-design/pro-table/lib/typing';
// import Descriptions from '@/components/Descriptions';
// import { scanConsumeTypeTextMap } from '@/constants/dictionary';
import ProTable from '@/components/ProTable';
import ScanInput from '@/components/ScanInput';
import useDebounce from '@/hooks/useDebounce';
import { getList } from '@/services/config';
import { batchConsume, postSearchAndConsume, searchDate } from '@/services/consume';
import { getConsumedGoodsList, queryMedicalAdvice } from '@/services/medicalAdvice';
import { judgeBarCodeOrUDI, transformSBCtoDBC } from '@/utils';
import { formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { ConsumeContext } from '@/wrappers/warehouseRadioSelect';
import { SyncOutlined } from '@ant-design/icons';
import { Alert, Button, Card, InputNumber, Popover } from 'antd';
import moment from 'moment';
import { useContext, useEffect, useState } from 'react';
import { connect, useAccess, useModel } from 'umi';
import styles from './index.less';

const ScanConsume = () => {
	const access = useAccess();
	const { fields } = useModel('fieldsMapping');
	const [adviceId, setAdviceId] = useState<number>();
	const [isSpdToHis, setIsSpdToHis] = useState();
	const [barCode, setBarCode] = useState<string>('');
	const [scanValue, setScanValue] = useState<string>('');
	const [patientType, setPatientType] = useState<string>('adviceNo');
	const [dataList, setDataList] = useState<Record<string, any>[]>([]);
	const [adviceList, setAdviceList] = useState([]);
	const [consumeList, setConsumeList] = useState([]);
	const [patient, setPatient] = useState<Partial<ConsumeController.Patient>>({});
	const [scannedList, setScannedList] = useState<ConsumeController.SearchGoodsInfo[]>([]);
	const [inputTipIndex, setInputTipIndex] = useState<number>(-1); // 控制当前应该显示哪行的数量tip
	const context: Record<string, any> = useContext(ConsumeContext);
	const { byUserWarehouses } = useModel('scanConsumeReport');

	// const debouncedGoodsTerm = useDebounce(barCode, 500);
	const debouncedPatientTerm = useDebounce(scanValue, 500);
	const patientConfig = {
		pageNum: 0,
		pageSize: 50,
	};

	const consumeWarehouse = sessionStorage.getItem('consumeWarehouse');
	const warehouseName = (consumeWarehouse && JSON.parse(consumeWarehouse).warehouseName) || '';

	// useEffect(() => {
	//   if (debouncedGoodsTerm) scanSubmit(barCode);
	// }, [debouncedGoodsTerm]);

	useEffect(() => {
		if (debouncedPatientTerm) patientScanSubmit(scanValue);
	}, [debouncedPatientTerm]);

	useEffect(() => {
		getPatientType();
	}, []);

	// 扫码提交
	const scanSubmit: any = (scanValue: string) => getInfoByCode(transformSBCtoDBC(scanValue));

	// 查询信息
	const getInfoByCode = async (scanValue: string) => {
		if (!scanValue) return;

		const gs1Code: any = scanValue.indexOf('_') > -1 ? scanValue : scanValue; // formatToGS1(scanValue)
		// if (scannedList.some((item) => item.operatorBarcode == scanValue && item.serialNo)) {
		//   notification.warning('此物品已经扫过码');
		//   setBarCode('');
		//   return;
		// }
		const params = {
			operatorBarcode: gs1Code,
			related: false,
		};
		if (!isSpdToHis) {
			handleSearchAndConsumeSubmit(scanValue);
			return;
		}
		const res = await searchDate(params);
		if (res && res.code === 0) {
			const data = res.data;
			data.barcode = gs1Code; // 保存扫描的码供提交
			if (!data) return;
			/* 已上架/已下架/占用中 可消耗*/
			if (!['put_off_shelf', 'put_on_shelf', 'occupied'].includes(data.status)) {
				setBarCode('');
				notification.error(`${fields.goods}状态不匹配，不可消耗`);
				return;
			}

			// 管控到序列号的数量为1不可修改，非重点管控到批号的物资可以修改数量
			if (!data.keyItem && data.lotNum) {
				data.editQuantity = true;
			}
			if (data.editQuantity) {
				if (scannedList.some((item) => item.id == data.id)) {
					const dataList = JSON.parse(JSON.stringify(scannedList));
					dataList.forEach((item: Record<string, any>) => {
						if (item.id === data.id) {
							if (item.quantity >= item.remainQuantity) {
								return notification.warning('物品不可超出剩余数量');
							}
							item.quantity += 1;
						}
					});
					setScannedList(dataList);
					setBarCode('');
				} else {
					scannedList.push({ ...data, quantity: 1 });
					setScannedList([...scannedList]);
					setBarCode('');
				}
			} else {
				if (
					scannedList.some(
						(item) => item.operatorBarcode == data.operatorBarcode || item.id === data.id,
					)
				) {
					setBarCode('');
					notification.warning('此物品已经扫过码');
					return;
				} else {
					scannedList.push(data);
					setScannedList([...scannedList]);
					setBarCode('');
				}
			}
		}
		setBarCode('');
	};

	// 病人扫描
	const patientScanSubmit: any = (scanValue: string) => {
		setScanValue(scanValue);
		getPatientInfoByCode(transformSBCtoDBC(scanValue));
	};

	const handleRemove = (operatorBarcode: string) => {
		const list = scannedList.filter((item) => item.operatorBarcode != operatorBarcode);
		setScannedList(list);
	};

	const searchAndConsume = async (params: ConsumeController.SearchConsumeParams) => {
		const res = await postSearchAndConsume(params);
		if (res && res.code === 0) {
			const data: Record<string, any> = res.data;
			dataList.push(data);
			setDataList([...dataList]);
			setBarCode('');
		}
	};

	const handleSearchAndConsumeSubmit = (scanValue: string) => {
		let operatorBarcode = scanValue;
		let params = {
			operatorBarcode,
			related: false,
		};
		searchAndConsume(params);
	};

	const showMessage = (scannedList: ConsumeController.SearchGoodsInfo[]) => {
		let isAll = true; // 全部成功
		scannedList.forEach((item) => {
			if (item.success == false) {
				const msg: any = item.errorMessage;
				notification.error(msg);
				isAll = false;
			}
		});
		if (isAll) notification.success('操作成功');
	};

	// 提交扫码消耗
	const handleSubmit = async () => {
		if (scannedList.length <= 0) {
			notification.error('请选择扫码添加物品');
			return;
		}
		let operatorBarcode: string[] = [];
		scannedList.forEach((item) => {
			if (item.quantity && item.quantity > 1) {
				const data = Array.from({ length: Number(item.quantity) }, () => item.barcode);
				operatorBarcode = operatorBarcode.concat(data);
			} else {
				operatorBarcode.push(item.barcode);
			}
		});
		const params = { operatorBarcode, adviceId: adviceId };
		const res = await batchConsume(params);
		if (res && res.code === 0) {
			const list = res.data;
			if (!list || list.length == 0) {
				notification.error('请求异常');
				return;
			}

			const failList = list.filter((item) => !item.success);
			if (failList.length > 0) {
				let list: any[] = [];
				scannedList.forEach((itemList) => {
					failList.map((item) => {
						if (item.operatorBarcode == itemList.operatorBarcode) {
							list.push(itemList);
						}
					});
				});
				setScannedList(list);
				setScanValue('');
			} else {
				setScannedList([]);
			}
			showMessage(list);
			requestConsumeList({ adviceId });
		}
	};

	// 消耗列表
	const requestConsumeList = async (param: { adviceId?: number }) => {
		const params = {
			...patientConfig,
			...param,
		};
		const res = await getConsumedGoodsList(params);
		if (res && res.code === 0) setConsumeList(res.data.rows);
	};

	// 医嘱类型
	const getPatientType = async () => {
		const hospitalId: any = sessionStorage.getItem('hospital_id');
		const params = {
			feature: 'HIS',
			hospitalId,
			module: 'system',
		};
		// medical_advice_direction
		const directionRes = await getList({ name: 'medical_advice_direction', ...params });
		if (directionRes && directionRes.code == 0) {
			const spd2His: any = (directionRes.data || []).every((item) => item.value === 'SPD2HIS');
			setIsSpdToHis(spd2His);
		}
		// medical_advice_search
		const searchRes = await getList({ name: 'medical_advice_search', ...params });
		if (searchRes && searchRes.code == 0) {
			setPatientType(searchRes.data[0].value);
		}
	};

	// 查询病人信息
	const getPatientInfoByCode = async (scanValue: string) => {
		if (!scanValue) return;
		const params = {
			...patientConfig,
			[patientType]: scanValue,
		};
		// 获取医嘱数据
		const res = await queryMedicalAdvice(params);
		if (res && res.code === 0) {
			const { page, patient } = res.data;
			const adviceId = page.rows[0] ? page.rows[0].adviceId : '';
			setAdviceList(page.rows);
			setPatient({ ...patient });
			setAdviceId(adviceId);
			setScanValue(scanValue);
			if (adviceId) {
				requestConsumeList({ adviceId });
			} else {
				setScanValue('');
				notification.warning('未找到相关信息，请重新扫描');
			}
		}
		setScanValue('');
	};

	const adviceChange = (value: string) => {
		// 清空
		if (!value) {
			setAdviceId(undefined);
			setConsumeList([]);
			setAdviceList([]);
			setPatient({});
		}
		setScanValue(value);
	};

	// 选择医嘱
	const selectAdviceRow = (record: MedicalAdviceController.ListRecord, selected: boolean) => {
		if (selected) {
			const adviceId = record.adviceId;
			requestConsumeList({ adviceId });
			setAdviceId(adviceId);
		}
	};

	const handleQuantityChange = (record: ConsumeController.SearchGoodsInfo, value: number) => {
		const submitList = scannedList.map((item) => {
			if (item.operatorBarcode === record.operatorBarcode || item.id === record.id) {
				item.quantity = value;
				return item;
			}
			return item;
		});
		setScannedList(submitList);
	};

	const adviceColumns: ProColumns<MedicalAdviceController.ListRecord>[] = [
		{
			title: '收费序号',
			dataIndex: 'adviceNo',
			key: 'adviceNo',
			width: 120,
		},
		{
			title: '开单科室',
			dataIndex: 'departmentName',
			key: 'departmentName',
			width: 100,
		},
		{
			title: '医生姓名',
			dataIndex: 'doctorName',
			key: 'doctorName',
			width: 100,
		},
		{
			title: '医嘱内容',
			dataIndex: 'content',
			key: 'content',
			width: 120,
			ellipsis: true,
		},
		{
			title: '开单时间',
			dataIndex: 'orderCreatedTime',
			key: 'orderCreatedTime',
			width: 160,
			renderText: (text: number) =>
				text ? moment(new Date(text)).format('YYYY/MM/DD HH:mm') : '-',
		},
	];

	const columns: ProColumns<ConsumeController.SearchGoodsInfo>[] = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 60,
			align: 'center',
			renderText: (text: number, record, index: number) => index + 1,
		},
		{
			title: `${fields.goods}条码/UDI`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 180,
			ellipsis: true,
			renderText: (text, record) => judgeBarCodeOrUDI(record),
		},
		{
			title: fields.goodsName,
			dataIndex: 'name',
			key: 'name',
			width: 150,
			ellipsis: true,
			renderText: (text: string, record) => <span>{text || record.goodsName}</span>,
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
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 150,
			renderText: (text: string, record) => (
				<span>{`${text || '-'}/${record.serialNo || '-'}`}</span>
			),
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 120,
			renderText: (text: number, record, index) => {
				return record.editQuantity ? (
					<Popover
						visible={inputTipIndex === index}
						trigger='click'
						placement='topLeft'
						content={`仓库：${warehouseName} 该批号剩余数量：${
							record.remainQuantity - record.quantity
						}`}>
						<InputNumber
							value={Number(text) || 1}
							min={1}
							max={record.remainQuantity}
							disabled={false}
							onChange={(value: any) => handleQuantityChange(record, value)} // 管控到批号的物资
							onFocus={() => setInputTipIndex(index)}
							onBlur={() => setInputTipIndex(-1)}
							style={{ width: '100px' }}
						/>
					</Popover>
				) : (
					<span>1</span> // 非重点物资到序列号&重点物资，数量显示1 不可修改
				);
			},
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
			dataIndex: 'option',
			key: 'option',
			width: 62,
			render: (id, record) => {
				return (
					<div className='operation'>
						<span
							className='handleLink'
							onClick={() => handleRemove(record.operatorBarcode)}>
							删除
						</span>
					</div>
				);
			},
		},
	];
	const allColumns: ProColumns<ConsumeController.SearchGoodsInfo>[] = [
		{
			title: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 150,
		},
		{
			title: fields.goodsName,
			dataIndex: 'name',
			key: 'name',
			width: 150,
			ellipsis: true,
			renderText: (text: string, record) => <span>{text || record.goodsName}</span>,
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
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 120,
			ellipsis: true,
		},
		{
			title: '生产日期',
			dataIndex: 'productionDate',
			key: 'productionDate',
			width: 120,
			renderText: (text: number) => (text ? moment(new Date(text)).format('YYYY/MM/DD') : ''),
		},
		{
			title: '灭菌日期',
			dataIndex: 'sterilizationDate',
			key: 'sterilizationDate',
			width: 120,
			renderText: (text: number) => (text ? moment(new Date(text)).format('YYYY/MM/DD') : ''),
		},
		{
			title: '有效期至',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width: 120,
			renderText: (text: number) => (text ? moment(new Date(text)).format('YYYY/MM/DD') : ''),
		},
	];

	const adviceRowSelection = {
		selectedRowKeys: [adviceId],
		onSelect: selectAdviceRow,
		columnTitle: ' ',
		width: '50px',
	};

	const descriptionsOptions: DescriptionsItemProps[] = [
		{
			label: '病例号',
			dataIndex: 'patientNo',
		},
		{
			label: '住院号',
			dataIndex: 'hospitalizationNum',
		},
		{
			label: '姓名',
			dataIndex: 'name',
		},
		{
			label: '性别',
			dataIndex: 'gender',
			render: (text: string) => (text ? (text === 'F' ? '女' : '男') : ''),
		},
		{
			label: '年龄',
			dataIndex: 'birth',
			render: (text: number) => text && Math.ceil((Date.now() - text) / (365 * 24 * 3600 * 1000)),
		},
	];

	// 切换仓库
	const changeWarehouse = () => {
		if (!context) return;

		if (context.byUserWarehouses.length === 1) {
			return notification.error({
				message: '当前登录用户仅有单仓库权限，不可切换！',
			});
		}
		// 打开仓库选择弹窗
		context.setVisible();
	};

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<div
				className={styles.titleWrap}
				style={{ width: '100%' }}>
				{isSpdToHis === false && (
					<ScanInput
						value={barCode}
						placeholder='点击此处扫描'
						onSubmit={() => {}}
						onPressEnter={scanSubmit}
						onChange={(value: string) => setBarCode(value.replace(//g, ''))}
						style={{ width: '180px', height: '30px' }}
						autoFocus={true}
					/>
				)}
			</div>

			{/* 切换仓库 */}
			<div className={styles.changeWarehouse}>
				<Alert
					message={
						<span>
							当前选择：
							<span style={{ color: CONFIG_LESS['@c_starus_await'], fontWeight: 600 }}>
								{warehouseName}
							</span>
						</span>
					}
					type='info'
					showIcon
					style={{ padding: '4px 8px', marginRight: 8 }}
				/>
				<Button
					type={context && context.byUserWarehouses.length === 1 ? 'text' : 'primary'}
					className={context && context.byUserWarehouses.length === 1 && styles.disabledBottom}
					style={{
						padding: '4px 8px',
					}}
					onClick={() => changeWarehouse()}
					icon={<SyncOutlined />}>
					切换仓库
				</Button>
			</div>

			{/* 消耗列表 */}
			<div className={styles.pageWrap}>
				{isSpdToHis === true ? (
					<>
						<div className={styles.leftBox}>
							{/* <Card className={styles.card}>
                <p className={styles.title}>
                  医嘱信息
                  <ScanInput
                    value={scanValue}
                    onSubmit={() => {}}
                    onPressEnter={patientScanSubmit}
                    onChange={(value) => adviceChange(value)}
                    style={{ width: '180px', float: 'right' }}
                    allowClear
                    placeholder={`请扫描${scanConsumeTypeTextMap[patientType] || ''}`}
                  />
                </p>
                {Object.keys(patient).length ? (
                  <>
                    <p className={styles.title}>病例信息</p>
                    <Descriptions
                      options={descriptionsOptions}
                      data={patient}
                      optionEmptyText="-"
                    />
                    <ProTable
                      columns={adviceColumns}
                      dataSource={adviceList}
                      rowKey="adviceId"
                      rowSelection={adviceRowSelection as Record<string, any>}
                      pagination={false}
                      options={{ density: false, fullScreen: false, setting: false }}
                      tableAlertOptionRender={
                        <a onClick={() => setAdviceId(undefined)}>取消选择</a>
                      }
                    />
                  </>
                ) : null}
              </Card> */}
							<Card>
								<div className={styles.scanView}>
									<span className={styles.title}>{fields.goods}信息</span>
									<ScanInput
										value={barCode}
										placeholder='点击此处扫描'
										onSubmit={scanSubmit}
										onPressEnter={scanSubmit}
										onChange={(value: string) => setBarCode(value.replace(//g, ''))}
										style={{ width: '320px', marginBottom: 8 }}
										autoFocus={true}
									/>
								</div>
								<ProTable
									className={styles.title}
									columns={columns.filter((item) => item.dataIndex !== 'id')}
									rowKey='operatorBarcode'
									dataSource={scannedList}
									pagination={false}
									showHeader={!!scannedList.length}
									loadConfig={{ loadText: '暂无数据' }}
									scroll={{
										y: 200,
									}}
									options={{ density: false, fullScreen: false, setting: false }}
								/>
								<div className={styles.operationButtons}>
									<Button
										onClick={() => setScannedList([])}
										disabled={!scannedList.length}
										className={styles.button}>
										清空
									</Button>
									{access['consume'] && (
										<Button
											type='primary'
											onClick={handleSubmit}
											disabled={scannedList.length <= 0}
											className={`${styles.button} ml2`}>
											提交
										</Button>
									)}
								</div>
							</Card>
						</div>
						{consumeList.length ? (
							<Card>
								<ProTable
									columns={columns.filter((item) => item.dataIndex !== 'option')}
									headerTitle='已消耗列表'
									dataSource={consumeList}
									rowKey='operatorBarcode'
									pagination={false}
									scroll={{ y: 200 }}
									options={{ density: false, fullScreen: false, setting: false }}
								/>
							</Card>
						) : null}
					</>
				) : (
					<div className={styles.allWrap}>
						<Card>
							<ProTable
								columns={allColumns}
								dataSource={dataList as []}
								rowKey='operatorBarcode'
								pagination={false}
								scroll={{ y: 200 }}
								options={{ density: false, fullScreen: false, setting: false }}
							/>
						</Card>
					</div>
				)}
			</div>
		</div>
	);
};

export default connect(
	({
		loading,
		scanConsume,
	}: {
		scanConsume: ConsumeController.ScanConsumeDataType;
		loading: { effects: { [key: string]: boolean } };
	}) => ({
		loading: loading.effects['scanConsume/queryMedicalAdvice'],
		scanConsume,
	}),
)(ScanConsume);
