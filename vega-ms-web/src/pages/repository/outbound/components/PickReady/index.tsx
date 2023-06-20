import { useGoodsType } from '@/hooks/useGoodsType';
import { useWarehouseList } from '@/hooks/useWarehouseList';
import { notification } from '@/utils/ui';
import { message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useAccess, useModel } from 'umi';
import DetailModal from './components/Add';
import BatchPickUpModal from './components/BatchAdd';
import Goods from './components/Goods';
import PackageOrdinary from './components/PackageOrdinary';
import { queryCreatPickOrder } from '@/services/pickOrder';

const addAllocation: React.FC<{ activeKey: string }> = ({ activeKey }) => {
	const { fields } = useModel('fieldsMapping');
	// 选中的数据
	const [selectedItemList, setSelectedItemList] = useState<{
		'1': PickPendingController.QueryRuleRecord[];
		'3': PickPendingController.QueryRuleRecord[];
	}>({
		'1': [], // 基础物资: 被选中的项组成的数组
		'3': [], // 医耗套包: 被选中的项组成的数组
	});
	// 类型切换索引
	const [currentIndex, setCurrentIndex] = useState<'1' | '3'>('1');
	// 控制一键生成配货单面板
	const [isBatchPickOpen, setIsBatchPickOpen] = useState(false);
	const [type, setType] = useState<'goods' | 'package_ordinary'>('goods');
	const goodsRef = useRef<{ getFormList: () => void }>();
	const packageOrdinaryRef = useRef<{ getFormList: () => void }>();
	const warehouseList = useWarehouseList({}); //获取用户下所有仓库
	const access = useAccess();
	const tagsData = useGoodsType(); //类型
	const [switchoverNum, setSwitchoverNum] = useState(0); //用于判断是否切换过类型
	const [loading, setLoading] = useState<boolean>(false);
	useEffect(() => {
		if (type === 'package_ordinary' && switchoverNum === 0) {
			setSwitchoverNum(switchoverNum + 1);
		}
		const selectType =
			selectedItemList['1'].length === 0 && selectedItemList['3'].length === 0
				? undefined
				: selectedItemList['1'].length > 0
				? 'goods'
				: 'package_ordinary';
		if (selectType && type !== selectType) {
			message.warn('当前采购类型已有勾选 & 不可跨采购类型生成配货单！');
		}
	}, [type]);
	// 收集选中的id
	const selectedIDList = {
		'1': selectedItemList['1'].length ? selectedItemList['1'].map((item) => item.id) : [], // 基础物资: 被选中的id组成的数组
		'3': selectedItemList['3'].length ? selectedItemList['3'].map((item) => item.id) : [], // 医耗套包: 被选中的id组成的数组
	};
	// // 通过id移除选中项数组中的一项
	// const removeOneFromSelectedListById = (id: number) => {
	//   setSelectedItemList((pre) => ({
	//     '1': pre['1'].filter((item) => item.id !== id),
	//     '3': pre['3'].filter((item) => item.id !== id),
	//   }));
	// };
	// 清空之前收集的选中项
	const resetSelectedList = () => setSelectedItemList({ '1': [], '3': [] });

	const getTableList = () => {
		(type === 'goods' ? goodsRef : packageOrdinaryRef).current?.getFormList();
		setSelectedItemList({
			'1': [],
			'3': [],
		});
	};
	// 选中的总个数
	const totalNumber = selectedItemList['1'].length + selectedItemList['3'].length;
	// 单选
	const handleSelectItem = (record: PickPendingController.QueryRuleRecord) => {
		// 状态过滤
		if (record.status !== 'generate_pick_order_pending') {
			return;
		}
		const { id, warehouseId, storageAreaId, goodsId } = record;
		// 判断当前选择的item是否已经被选中
		const isSelected = selectedIDList[currentIndex].includes(id);

		if (isSelected) {
			setSelectedItemList((preList) => ({
				...preList,
				[currentIndex]: preList[currentIndex].filter((item: { id: number }) => item.id !== id),
			}));
		} else {
			const a = selectedItemList['1'][0] || {};
			const c = selectedItemList['3'][0] || {};
			// 当前选则的item必须和前面已经选择过的item的warehouseId保持一致
			// 简单说就是第一个可以随便选，之后再要选择就需要判断 warehouseId 了
			// const canSelect = totalNumber === 0 || warehouseId === firstOne.warehouseId;
			const sourcess = totalNumber === 0 || [a, c].some((item) => warehouseId === item.warehouseId);
			//判断是否是相同采购类型
			const canSelect =
				totalNumber === 0 ||
				[a, c].some((item) => item.goodsId && (goodsId === 99999) === (item.goodsId === 99999));
			const storageArea =
				totalNumber === 0 || [a, c].some((item) => storageAreaId === item.storageAreaId);
			if (!canSelect) {
				notification.warning('请选择相同采购类型生成配货单');
				return;
			}
			if (!storageArea) {
				notification.warning(`不同库房${fields.goods}无法合并配货单！`);
				return;
			}
			if (!sourcess) {
				notification.warning('请选择相同仓库生成配货单');
				return;
			}
			// 更新选中的数据列表
			setSelectedItemList((preList) => ({
				...preList,
				[currentIndex]: [...preList[currentIndex], record],
			}));
		}
	};
	// 全选
	const handleSelectAll = (
		selected: boolean,
		_selectedRows: PickPendingController.QueryRuleRecord[],
		changeRows: PickPendingController.QueryRuleRecord[],
	) => {
		const goodsSelectedList = selectedItemList[currentIndex]; //当前查询筛选类型已勾选的物资或套包
		const ordinarySelectedList = selectedItemList[currentIndex === '1' ? '3' : '1']; //反之
		if (selected) {
			if (ordinarySelectedList.length > 0) {
				notification.warning('请选择相同采购类型生成配货单');
				return;
			}
			const storageAreaIdList = [...new Set(changeRows.map((item) => item.storageAreaId))];
			const warehouseIdList = [...new Set(changeRows.map((item) => item.warehouseId))];
			const isStorageArea = goodsSelectedList[0]
				? changeRows.some((item) => item.storageAreaId !== goodsSelectedList[0].storageAreaId)
				: storageAreaIdList.length > 1;
			const isWarehouse = goodsSelectedList[0]
				? changeRows.some((item) => item.warehouseId !== goodsSelectedList[0].warehouseId)
				: warehouseIdList.length > 1;
			if (isStorageArea) {
				notification.warning(`不同库房${fields.goods}无法合并配货单！`);
				return;
			}
			if (isWarehouse) {
				notification.warning('请选择相同仓库生成配货单');
				return;
			}
			setSelectedItemList((pre) => ({
				...pre,
				[currentIndex]: [...pre[currentIndex], ...changeRows],
			}));
		} else {
			setSelectedItemList((pre) => {
				return {
					...pre,
					[currentIndex]: pre[currentIndex].filter((item) => !changeRows.includes(item)),
				};
			});
		}
	};
	// 点击行
	const handleRowEvent = (record: PickPendingController.QueryRuleRecord) => ({
		onClick: (e: { stopPropagation: () => void }) => {
			e.stopPropagation();
			if (!access['add_pick_order']) {
				return;
			}
			handleSelectItem(record);
		},
	});
	// 提交配货单
	const handleSubmit = async () => {
		setLoading(true);
		const selectedData = [...selectedItemList['1'], ...selectedItemList['3']];
		const selectedIds = [...selectedIDList['1'], ...selectedIDList['3']];
		const res = await queryCreatPickOrder({
			pendingIds: selectedIds,
			storageAreaId: selectedData[0].storageAreaId,
		});
		if (res && res.code === 0) {
			notification.success('提交成功');
			resetSelectedList();
			getTableList();
		}
		setLoading(false);
	};
	//生成配货
	const openModal = () => {
		handleSubmit();
	};
	const handlProps = {
		openModal,
		selectedItemList,
		setSelectedItemList,
		selectedIDList,
		currentIndex,
		setCurrentIndex,
		setIsBatchPickOpen,
		type,
		setType,
		isBatchPickUpModal: warehouseList && warehouseList.length > 0,
		totalNumber,
		handleSelectItem,
		handleSelectAll,
		handleRowEvent,
		tagsData,
		loading,
	};
	return (
		<>
			{tagsData.some((item) => item.value === 'goods') && (
				<Goods
					{...handlProps}
					comRef={goodsRef}
					style={type === 'goods' ? {} : { display: 'none' }}
					activeKey={activeKey}
				/>
			)}
			{(!tagsData.some((item) => item.value === 'goods') || switchoverNum > 0) &&
				tagsData.some((item) => item.value === 'package_ordinary') && (
					<PackageOrdinary
						{...handlProps}
						comRef={packageOrdinaryRef}
						style={type === 'package_ordinary' ? {} : { display: 'none' }}
					/>
				)}
			{warehouseList && warehouseList.length > 0 && (
				<BatchPickUpModal
					isOpen={isBatchPickOpen}
					setIsOpen={setIsBatchPickOpen}
					updateListPage={getTableList}
					warehouseList={warehouseList}
					type={type}
				/>
			)}
		</>
	);
};

export default addAllocation;
