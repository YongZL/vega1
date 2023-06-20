import Breadcrumb from '@/components/Breadcrumb';
import type { ProColumns } from '@/components/ProTable';
import ProTable from '@/components/ResizableTable';
import ScanInput from '@/components/ScanInput/ScanInput';
import { batchConsume, searchDate } from '@/services/consume';
import { judgeBarCodeOrUDI, transformSBCtoDBC } from '@/utils';
import { notification } from '@/utils/ui';
import { formatStrConnect } from '@/utils/format';
import { ConsumeContext } from '@/wrappers/warehouseRadioSelect';
import { SyncOutlined } from '@ant-design/icons';
import { Alert, Button, InputNumber, Popover } from 'antd';
import { useContext, useState } from 'react';
import { useAccess, useModel } from 'umi';
import styles from './index.less';

// 消耗业务/扫码消耗
const scanCode = () => {
	const access = useAccess();
	const { fields } = useModel('fieldsMapping');
	const [barCode, setBarCode] = useState<string>('');
	const [inputTipIndex, setInputTipIndex] = useState<number>(-1); // 控制当前应该显示哪行的数量tip
	const [scannedList, setScannedList] = useState<ConsumeController.SearchGoodsInfo[]>([]);

	const context: Record<string, any> = useContext(ConsumeContext);
	const consumeWarehouse = sessionStorage.getItem('consumeWarehouse');
	const warehouseName = (consumeWarehouse && JSON.parse(consumeWarehouse).warehouseName) || '';

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

	const handleRemove = (operatorBarcode: string) => {
		const list = scannedList.filter((item) => item.operatorBarcode != operatorBarcode);
		setScannedList(list);
	};

	const columns: ProColumns<ConsumeController.SearchGoodsInfo>[] = [
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

	// 扫码提交
	const scanSubmit: any = (scanValue: string) => getInfoByCode(transformSBCtoDBC(scanValue));

	// 查询信息
	const getInfoByCode = async (scanValue: string) => {
		if (!scanValue) return;

		const params = {
			operatorBarcode: scanValue,
			related: false,
		};
		const res = await searchDate(params);
		if (res && res.code === 0) {
			const data = res.data;
			if (!data) return;

			// 保存扫描的码供提交
			data.barcode = scanValue;

			// 已上架/已下架/占用中 可消耗
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

	const showMessage = (scannedList: ConsumeController.SearchGoodsInfo[]) => {
		let isAll = true; // 全部成功
		scannedList.forEach((item) => {
			if (!item.success) {
				const msg: string = item.errorMessage || '';
				notification.error(msg);
				isAll = false;
			}
		});
		if (isAll) notification.success('操作成功');
	};

	// 提交扫码消耗
	const handleSubmit = async () => {
		if (scannedList.length <= 0) {
			notification.error('当前信息列表暂无扫码信息！');
			return;
		}
		// 多个数量生成多个条码提交
		let operatorBarcode: string[] = [];
		scannedList.forEach((item) => {
			if (item.quantity && item.quantity > 1) {
				const data = Array.from({ length: Number(item.quantity) }, () => item.barcode);
				operatorBarcode = operatorBarcode.concat(data);
			} else {
				operatorBarcode.push(item.barcode);
			}
		});

		const res = await batchConsume({ operatorBarcode });
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
			} else {
				setScannedList([]);
			}
			showMessage(list);
		}
	};

	return (
		<div className='main-page'>
			<div
				className='page-bread-crumb'
				style={{ position: 'relative' }}>
				<Breadcrumb config={['', '']} />
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
			</div>
			{/* 扫码框 */}
			<div className={styles['scanView']}>
				<span>扫描/输入条码：</span>
				<ScanInput
					value={barCode}
					placeholder='点击此处扫描'
					onSubmit={scanSubmit}
					// onPressEnter={scanSubmit}
					onChange={(value: string) => setBarCode(value)}
					style={{ width: '390px' }}
					autoFocus={true}
				/>
			</div>
			{/* 扫描信息列表 */}
			<div className={styles['scan-container']}>
				{/* 分割线 */}
				<div className={styles['split-line']} />

				<ProTable
					tableInfoCode='scan_consume'
					className={styles.scanCodeList}
					extraHeight={43}
					columns={columns}
					headerTitle='扫描信息列表'
					toolBarRender={() => [
						<Button
							onClick={() => setScannedList([])}
							disabled={!scannedList.length}
							style={{ padding: '0 20px', width: 72 }}>
							清空
						</Button>,
						access['consume'] && (
							<Button
								type='primary'
								onClick={handleSubmit}
								style={{ width: 72 }}>
								提交
							</Button>
						),
					]}
					rowKey='operatorBarcode'
					dataSource={scannedList}
					pagination={false}
					showHeader={!!scannedList.length}
					loadConfig={{ loadText: '请扫描商品' }}
				/>
			</div>
		</div>
	);
};

export default scanCode;
