import type { ProColumns } from '@/components/ProTable';
import { Transfer } from 'antd';
import { notification } from '@/utils/ui';
import TransferBox from '@/components/TransferBox';
import {
	getFindAllDistributorByGoodsId,
	setOperateDistributorByGoodsId,
} from '@/services/distributor';
import { Badge, Button, Modal, Spin } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useModel } from 'umi';

const DistributorChannelModel = ({
	visible,
	handleVisible,
	goodsId,
	allDistributorList,
	handleSubmit,
}: {
	visible: boolean;
	handleVisible: () => void;
	goodsId: number;
	allDistributorList: DistributorController.DistributorsRecord[];
	handleSubmit?: () => void; // 保存成功后执行
}) => {
	const { fields } = useModel('fieldsMapping');
	const [dataSource, setDataSource] = useState<DistributorController.DistributorsRecord[]>([]);
	const [targetKeys, setTargetKeys] = useState<string[]>([]); // 显示在右侧的数据
	const [prefs, setPrefs] = useState<DistributorController.DistributorsRecord>(); // 当选中只有一项且启用的时候，设为首选按钮高亮（这里记录选中符合的数据）
	const [prefsId, setPrefsId] = useState<number>();
	const [loading, setLoading] = useState(false);
	const [submitLoading, setSubmitLoading] = useState(false);
	const TransferBoxRef = useRef<Transfer<DistributorController.DistributorsRecord>>(null);
	const onChange = (nextTargetKeys: string[]) => {
		setTargetKeys(nextTargetKeys);
	};
	const onSelectChange = (sourceSelectedKeys: string[]) => {
		const leftDataSource = TransferBoxRef.current?.separateDataSource().leftDataSource || [];
		// 此段useEf代码的作用：当选中只有一项且启用的时候，设为首选按钮高亮
		if (sourceSelectedKeys.length === 1) {
			const sourceSelected = leftDataSource.find(
				(item) => String(item.id) === sourceSelectedKeys[0] && item.isEnabled && !item.isTop,
			);
			if (sourceSelected) {
				setPrefs(sourceSelected);
			} else {
				setPrefs(undefined);
			}
		} else {
			setPrefs(undefined);
		}
	};
	const leftTableColumns: ProColumns<DistributorController.DistributorsRecord>[] = [
		{
			dataIndex: 'isTop',
			title: '排序',
			width: 'XXS',
			renderText: (value) => {
				const text = value ? '首选' : '备选';
				return <span style={{ fontWeight: value ? 800 : 400 }}>{text}</span>;
			},
		},
		{
			dataIndex: 'isEnabled',
			title: '状态',
			width: 'XXS',
			render: (value, record) => {
				const color = value ? CONFIG_LESS['@c_starus_await'] : CONFIG_LESS['@c_starus_disabled'];
				const textFont = value ? '已启用' : '已禁用';
				return (
					<Badge
						style={{ fontWeight: record.isTop ? 800 : 400 }}
						color={color}
						text={textFont}
					/>
				);
			},
		},
		{
			dataIndex: 'companyName',
			title: fields.distributor,
			width: 'XXXL',
			render: (value, record) => {
				return <span style={{ fontWeight: record.isTop ? 800 : 400 }}>{value}</span>;
			},
		},
	];

	const rightTableColumns: ProColumns<DistributorController.DistributorsRecord>[] = [
		{
			dataIndex: 'isEnabled',
			title: '状态',
			width: 'XXS',
			render: (value) => {
				const color = value ? CONFIG_LESS['@c_starus_await'] : CONFIG_LESS['@c_starus_disabled'];
				const textFont = value ? '已启用' : '已禁用';
				return (
					<Badge
						color={color}
						text={textFont}
					/>
				);
			},
		},
		{
			dataIndex: 'companyName',
			title: fields.distributor,
			width: 'XXXL',
		},
	];

	const getFindAllDistributorByGoodsIdList = useCallback(async () => {
		setLoading(true);
		let newAllDistributorList: DistributorController.DistributorsRecord[] = [];
		const newTargetKeys: string[] = [];
		let FindAllDistributorByGoodsIdList: DistributorController.DistributorsRecord[] = [];
		try {
			const res = await getFindAllDistributorByGoodsId(goodsId);
			if (res && res.code === 0) {
				FindAllDistributorByGoodsIdList = res.data;
			}
		} finally {
			setLoading(false);
		}
		allDistributorList.forEach((item) => {
			const distributor = { ...item };
			const isGoodsDistributorIndex = FindAllDistributorByGoodsIdList.findIndex(
				(value) => value.distributorId === item.id,
			);
			if (isGoodsDistributorIndex < 0) {
				newTargetKeys.push(String(item.id));
			}
			if (
				isGoodsDistributorIndex >= 0 &&
				FindAllDistributorByGoodsIdList[isGoodsDistributorIndex].isTop
			) {
				distributor.isTop = true;
				// 首选项永远要在第一行
				newAllDistributorList = [distributor, ...newAllDistributorList];
				setPrefsId(item.id);
			} else {
				newAllDistributorList.push(distributor);
			}
		});
		setDataSource(newAllDistributorList);
		setTargetKeys(newTargetKeys);
	}, [allDistributorList]);

	useEffect(() => {
		getFindAllDistributorByGoodsIdList();
	}, [getFindAllDistributorByGoodsIdList]);

	const handleSetPrefs = () => {
		const newDataSource = dataSource.filter((item) => {
			item.isTop = false;
			return prefs!.id !== item.id;
		});
		prefs!.isTop = true;
		// 首选项永远要在第一行
		setDataSource([prefs!, ...newDataSource]);
		setPrefsId(prefs!.id);
		setPrefs(undefined);
	};

	const submit = async () => {
		const distributorIds = (TransferBoxRef.current?.separateDataSource().leftDataSource || []).map(
			(item) => item.id,
		);
		const topId = prefsId && distributorIds.includes(prefsId) ? prefsId : undefined;
		setSubmitLoading(true);
		try {
			const res = await setOperateDistributorByGoodsId({
				goodsId,
				topId,
				distributorIds,
			});
			if (res && res.code === 0) {
				notification.success(res.msg);
			}
			if (handleSubmit) {
				handleSubmit();
			}
		} finally {
			setSubmitLoading(false);
		}
		handleVisible();
	};

	return (
		<Modal
			className='ant-detail-modal'
			maskClosable={false}
			destroyOnClose={true}
			visible={visible}
			title='供货渠道编辑'
			onCancel={() => {
				handleVisible();
			}}
			footer={
				<>
					<Button onClick={handleVisible}>取消</Button>
					<Button
						type='primary'
						loading={submitLoading}
						onClick={submit}>
						保存
					</Button>
				</>
			}>
			<Spin spinning={loading}>
				<TransferBox<DistributorController.DistributorsRecord>
					titles={[
						<>
							<span className='title'>默认{fields.distributor}</span>
							<Button
								type='primary'
								onClick={handleSetPrefs}
								disabled={!prefs}>
								设为首选
							</Button>
						</>,
						<span className='title'>其他{fields.distributor}</span>,
					]}
					TransferBoxRef={TransferBoxRef}
					dataSource={dataSource}
					targetKeys={targetKeys}
					rowKey={(record) => String(record.id)}
					showSearch={true}
					onChange={onChange}
					onSelectChange={onSelectChange}
					filterOption={(inputValue, item) => item.companyName!.indexOf(inputValue) !== -1}
					leftColumns={leftTableColumns}
					rightColumns={rightTableColumns}
					showSelectAll={false}
					proTableProps={{
						size: 'small',
						scroll: {
							y: 300,
						},
						options: { density: false, fullScreen: false, setting: false },
					}}
				/>
			</Spin>
		</Modal>
	);
};
export default DistributorChannelModel;
