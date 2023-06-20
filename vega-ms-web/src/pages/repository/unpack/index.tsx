import type { ProColumns } from '@/components//ProTable/typings';
import Breadcrumb from '@/components/Breadcrumb';
import ProTable from '@/components/ProTable';
import ScanInput from '@/components/ScanInput';
import { goodsItemStatusTextMap } from '@/constants/dictionary';
import { searchGoods } from '@/services/stock';
import { batchUnpack } from '@/services/unpacking';
import { transformSBCtoDBC } from '@/utils';
import { formatToGS1 } from '@/utils/format';
import { notification } from '@/utils/ui';
import { Button } from 'antd';
import { cloneDeep } from 'lodash';
import { FormEvent, useState } from 'react';
import { useAccess, useModel } from 'umi';
import styles from './index.less';
type GoodsType = 'packageBulk' | 'packageSurgical' | 'ordinaryBulk';
type ScanedItemType = {
	packageBulk: ReturnGoodsController.ReturnGoodsRecord[];
	packageSurgical: ReturnGoodsController.ReturnGoodsRecord[];
	ordinaryBulk: ReturnGoodsController.ReturnGoodsRecord[];
};
type SelectedCodeType = {
	packageBulk: string[];
	packageSurgical: string[];
	ordinaryBulk: string[];
};
const Unpack = () => {
	const { fields } = useModel('fieldsMapping');
	const [scanValue, setScanValue] = useState('');
	const [scanedCodeStrList, setScanedCodeStrList] = useState<
		(
			| string
			| {
					gs1Code: string;
					items: number[];
			  }
		)[]
	>([]);
	const [scanedItemList, setScanedItemList] = useState<ScanedItemType>({
		packageBulk: [],
		packageSurgical: [],
		ordinaryBulk: [],
	});
	const [selectedCodeList, setSelectedCodeList] = useState<SelectedCodeType>({
		packageBulk: [],
		packageSurgical: [],
		ordinaryBulk: [],
	});
	const [dataMap, setDataMap] = useState({});
	const access = useAccess();

	const handleSubmit = () => {
		let operatorBarcodeArr = Object.values(selectedCodeList).flat();
		if (!operatorBarcodeArr.length) {
			notification.error('请选择待拆包物品');
			return;
		}
		let params = {
			operatorBarcode: operatorBarcodeArr,
		};
		return batchUnpack(params).then((res) => {
			if (res && res.code == 0) {
				//请求后数据处理
				let resList = res.data;
				if (!resList || resList.length == 0) {
					notification.error('请求异常');
					return;
				}
				let isAllSuccess = resList.every((item) => item.success);
				if (isAllSuccess) {
					//全部成功，清空
					setScanValue('');
					clear();
				} else {
					//没有全部成功，不清空，成功消息不选中
					updateScanedList(resList);
				}
				showMessage(resList);
			}
		});
	};

	const updateScanedList = (list: UnpackingController.BatchUnpackRecord[]) => {
		//数据
		if (!list || list.length === 0) {
			return;
		}
		let scanedItemListCopy = cloneDeep(scanedItemList);
		for (let i = 0; i < list.length; i++) {
			let key = 'ordinaryBulk';
			let targetList = scanedItemListCopy[key];
			for (let j = 0; j < targetList.length; j++) {
				if (targetList[j].operatorBarcode === list[i].operatorBarcode && list[i].success) {
					targetList[j].consumed = true; //已经消耗，不可选
					break;
				}
			}
		}
		let selectedCode: SelectedCodeType = { packageSurgical: [], packageBulk: [], ordinaryBulk: [] };
		list.forEach((item) => {
			if (!item.success) {
				selectedCode['ordinaryBulk'].push(item.operatorBarcode);
				// if (item.operatorBarcode.startsWith('PS')) {
				//   selectedCode['packageSurgical'].push(item.operatorBarcode);
				// }
			}
		});
		setScanedItemList({ ...scanedItemListCopy });
		setSelectedCodeList(selectedCode);
	};

	const showMessage = (list: UnpackingController.BatchUnpackRecord[]) => {
		let isAll = true; //全部成功
		list.forEach((item) => {
			if (!item.success) {
				notification.error(`[${item.operatorBarcode}] ${item.errorMessage}`);
				isAll = false;
			}
		});
		if (isAll) {
			notification.success('操作成功');
		}
	};

	const handleRemoveOneById = (operatorBarcode: string, key: GoodsType) => {
		delete dataMap[operatorBarcode];
		let tartItemList = scanedItemList[key];
		tartItemList = tartItemList.filter((item) => item.operatorBarcode !== operatorBarcode);
		let codeList = selectedCodeList[key].filter((item) => item !== operatorBarcode);
		scanedItemList[key] = tartItemList;
		selectedCodeList[key] = codeList;
		setDataMap({ ...dataMap });
		setScanedItemList(cloneDeep(scanedItemList));
		setScanedCodeStrList([...scanedCodeStrList.filter((item) => item != operatorBarcode)]);
		setSelectedCodeList(cloneDeep(selectedCodeList));
	};

	const handleSelectAll = (
		selected: boolean,
		selectedRows: ReturnGoodsController.ReturnGoodsRecord[],
	) => {
		let handleKey = 'ordinaryBulk';
		let targetList: string[];
		if (selected) {
			targetList = selectedRows.map((item) => {
				return item.operatorBarcode!;
			});
		} else {
			targetList = [];
		}
		selectedCodeList[handleKey] = targetList;
		setSelectedCodeList(cloneDeep(selectedCodeList));
	};

	const clear = () => {
		setScanedItemList({ packageSurgical: [], packageBulk: [], ordinaryBulk: [] });
		setScanedCodeStrList([]);
		setSelectedCodeList({ packageSurgical: [], packageBulk: [], ordinaryBulk: [] });
		setDataMap({});
	};
	const rowSelection = (handleKey: GoodsType) => {
		return {
			selectedRowKeys: selectedCodeList[handleKey],
			onSelect: handleSelectItem,
			onSelectAll: handleSelectAll,
			getCheckboxProps: (record: ReturnGoodsController.ReturnGoodsRecord) => {
				return {
					disabled: record.consumed === true,
				};
			},
		};
	};

	// 扫码提交
	const scanSubmit = (scanValue: FormEvent<HTMLInputElement> | string) => {
		scanValue = transformSBCtoDBC(scanValue);
		getInfoByCode(scanValue as string);
	};

	// 判断是否已扫码过
	const hasScaned = (value: string) => {
		return scanedCodeStrList.indexOf(value as never) > -1;
	};

	//单项选中
	//record:被选中的记录
	//selected 是否被选中
	const handleSelectItem = (record: ReturnGoodsController.ReturnGoodsRecord, selected: boolean) => {
		const handleKey = 'ordinaryBulk';
		let targetList = selectedCodeList[handleKey];
		if (selected) {
			//选中
			targetList.push(record.operatorBarcode!);
		} else {
			//取消选中
			targetList = targetList.filter((item) => {
				return item != record.operatorBarcode;
			});
		}
		selectedCodeList[handleKey] = targetList;
		setSelectedCodeList(cloneDeep(selectedCodeList));
	};

	//查询信息
	const getInfoByCode = (scanValue: string) => {
		// 添加支持gs1扫码消耗
		const gs1Code = scanValue.indexOf('_') > -1 ? scanValue : formatToGS1(scanValue);
		//重复扫码验证
		if (hasScaned(scanValue)) {
			//已经扫过
			notification.warning('此物品已经扫过码');
			return;
		}
		let params = {
			operatorBarcode: gs1Code,
		};
		searchGoods(params).then((res) => {
			if (res && res.code == 0) {
				let data = res.data;
				//对数据分类和保存
				if (!data) {
					console.log('请求异常:', data);
					return;
				}
				//基础物资不支持拆包
				if (!data.ordinaryId) {
					notification.error('该物品不是医耗套包');
					return;
				}
				if (!['put_on_shelf_pending', 'put_on_shelf', 'put_off_shelf'].includes(data.status!)) {
					let statusN = goodsItemStatusTextMap[data.status!];
					notification.error(`该${fields.goods}状态为${statusN}，不可拆包`);
					return;
				}
				scanedCodeStrList.push(gs1Code);
				setScanedCodeStrList([...scanedCodeStrList]);
				setScanValue(scanValue);
				let key = 'ordinaryBulk';
				scanedItemList[key].push(data);
				setDataMap({ ...Object.assign(dataMap, { gs1Code: data }) });
				setScanedItemList(cloneDeep(scanedItemList));
				setScanValue('');
				handleSelectItem(data, true);
			}
		});
	};

	const handleChange = (value: string) => {
		setScanValue(value.trim());
	};

	const columns: ProColumns<ReturnGoodsController.ReturnGoodsRecord>[] = [
		{
			title: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 180,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 180,
		},
		{
			title: '套包名称',
			dataIndex: 'name',
			key: 'name',
			width: 160,
		},
		{
			title: '操作',
			width: 60,
			dataIndex: 'option',
			key: 'option',
			align: 'left',
			render: (id, record) => {
				return (
					<div className='operation'>
						<span
							className='handleLink'
							onClick={() => handleRemoveOneById(record.operatorBarcode!, 'ordinaryBulk')}>
							删除
						</span>
					</div>
				);
			},
		},
	];

	return (
		<div className='main-page'>
			<div
				className='page-bread-crumb'
				style={{ position: 'relative' }}>
				<Breadcrumb config={['', '']} />
			</div>
			{/* 扫码框 */}
			<div className={styles['scanView']}>
				<span>扫描/输入条码：</span>
				<ScanInput
					value={scanValue}
					placeholder='点击此处扫描'
					onSubmit={scanSubmit}
					// onPressEnter={scanSubmit}
					onChange={(value: string) => handleChange}
					style={{ width: '390px' }}
					autoFocus={true}
				/>
			</div>
			{/* 扫描信息列表 */}
			<div className={styles['scan-container']}>
				{/* 分割线 */}
				<div className={styles['split-line']} />

				<ProTable<ReturnGoodsController.ReturnGoodsRecord>
					className={styles.scanCodeList}
					columns={columns}
					headerTitle='医耗套包'
					extraHeight={43}
					toolBarRender={() => [
						<Button
							onClick={() => clear()}
							disabled={scanedItemList['ordinaryBulk'].length === 0}
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
					dataSource={scanedItemList['ordinaryBulk']}
					pagination={false}
					showHeader={!!scanedItemList['ordinaryBulk'].length}
					loadConfig={{ loadText: '请扫描医耗套包' }}
					rowSelection={rowSelection('ordinaryBulk')}
				/>
			</div>
		</div>
	);
};
export default Unpack;
