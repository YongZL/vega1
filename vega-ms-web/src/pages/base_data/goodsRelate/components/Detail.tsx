import React, { useState } from 'react';
import { connect, Dispatch } from 'umi';
import { Button, Modal, Form } from 'antd';
import { notification } from '@/utils/ui';
import { convertPriceWithDecimal } from '@/utils/format';
import type { ProColumns } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import ProTable from '@/components/ProTable';
import { queryHisGoods } from '@/services/relateGoods';
import { optionsToValueEnum } from '@/utils/dataUtil';

type DetailModalPropsType = {
	loading: boolean;
	submitLoading: boolean;
	dispatch: Dispatch;
	modalVisible: boolean;
	setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
	fetchList: () => void;
	goodsIds: number[];
	resetParentList: () => void;
	pageType: boolean;
};
const bindingStatus = {
	['']: { text: '全部', status: '' },
	false: { text: '暂未绑定', status: 'false' },
	true: { text: '已有绑定', status: 'true' },
};
const bindingStatusValueEnum = [
	{ label: '已有绑定', value: true, color: CONFIG_LESS['@c_starus_done'] },
	{ label: '暂未绑定', value: false, color: CONFIG_LESS['@c_starus_disabled'] },
];

const DetailModal = ({ loading, submitLoading, dispatch, ...props }: DetailModalPropsType) => {
	let [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
	let [selectList, setSelectList] = useState<RelateGoodsController.QueryHisGoodsRecord[]>([]);
	const { modalVisible, setModalVisible, fetchList, goodsIds, resetParentList, pageType } = props;
	const [showPrompt, setShowPrompt] = useState<boolean>(false);
	const [promptList, setPromptList] = useState<string[]>([]);
	const [form] = Form.useForm();

	// 关闭弹窗后的处理
	const closeModal = () => {
		form.resetFields();
		fetchList();
		setModalVisible(false);
		setSelectList([]);
		setSelectedRowKeys([]);
		resetParentList();
	};

	// 提交
	const modalCommit = () => {
		if (selectList.length <= 0) {
			notification.error('请选择收费项！');
			return;
		}
		let params, requestUrl;
		if (goodsIds.length > 1) {
			params = {
				goodsIdList: goodsIds,
				hisChargeId: selectList[0]['id'],
				type: 'HIS',
			};
			requestUrl = 'relateGoods/batchRelateGoods';
		} else {
			params = {
				goodsId: goodsIds[0],
				relateGoodsId: selectList[0]['id'],
				type: 'HIS',
			};
			requestUrl = 'relateGoods/relateGoods';
		}
		dispatch({
			type: requestUrl,
			payload: params,
			callback: (res) => {
				if (res && res.code === 0) {
					const data = res.data || [];
					if (data && data.length > 0) {
						setPromptList(data);
						setShowPrompt(true);
					} else {
						notification.success('操作成功！');
						closeModal();
					}
				}
			},
		});
	};

	// 选择
	const changeRow = (rowKey: React.Key[], row: RelateGoodsController.QueryHisGoodsRecord[]) => {
		setSelectedRowKeys([...rowKey] as number[]);
		setSelectList([...row]);
	};

	// 点击行
	const onRow = (record: RelateGoodsController.QueryHisGoodsRecord) => {
		setSelectedRowKeys([record.id]);
		setSelectList([record]);
	};

	const cancelModal = () => {
		setModalVisible(false);
		setSelectList([]);
		setSelectedRowKeys([]);
		form.resetFields();
	};

	const columns: ProColumns<RelateGoodsController.QueryHisGoodsRecord>[] = [
		{
			title: '绑定状态',
			dataIndex: 'bound',
			width: 'XXS',
			filters: false,
			valueEnum: optionsToValueEnum(bindingStatusValueEnum),
		},
		{
			title: '收费项编号',
			dataIndex: 'chargeCode',
			key: 'chargeCode',
			width: 130,
			renderText: (text: string) => (text ? text : '-'),
		},
		{
			title: '收费项名称',
			dataIndex: 'chargeName',
			key: 'chargeName',
			width: 130,
			renderText: (text: string) => (text ? text : '-'),
		},
		{
			title: '规格',
			width: 150,
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			renderText: (text: string) => (text ? text : '-'),
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 180,
			ellipsis: true,
		},
		{
			title: '收费项单价（元）',
			dataIndex: 'chargePrice',
			key: 'chargePrice',
			align: 'right',
			width: 130,
			renderText: (text: string) => convertPriceWithDecimal(text),
		},
	];

	const searchColumns: ProFormColumns = [
		{
			title: '绑定状态',
			dataIndex: 'bound',
			valueType: 'radioButton',
			initialValue: '',
			valueEnum: bindingStatus,
			fieldProps: {
				className: 'search-radio-button',
			},
		},
		{
			title: '收费项编号',
			dataIndex: 'chargeCode',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: '收费项名称',
			dataIndex: 'chargeName',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: '规格',
			dataIndex: 'specification',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			fieldProps: {
				placeholder: '请输入',
			},
		},
	];

	return (
		<Modal
			width='80%'
			visible={modalVisible}
			maskClosable={false}
			destroyOnClose={true}
			title='HIS收费项选择'
			onCancel={cancelModal}
			footer={[
				<Button
					key='cancel'
					onClick={() => cancelModal()}
					disabled={submitLoading}>
					取消
				</Button>,
				<Button
					type='primary'
					key='submit'
					onClick={() => modalCommit()}
					loading={submitLoading}>
					绑定选中项
				</Button>,
			]}
			className='modalDetails'>
			<ProTable<RelateGoodsController.QueryHisGoodsRecord>
				rowKey='id'
				searchConfig={{
					columns: searchColumns,
					form,
				}}
				options={{ density: false, fullScreen: false, setting: false }}
				scroll={{ y: 300 }}
				api={queryHisGoods}
				columns={columns}
				rowSelection={{ selectedRowKeys, onChange: changeRow, type: 'radio' }}
				onRow={(record: any) => ({
					onClick: (e) => {
						e.stopPropagation();
						onRow(record);
					},
				})}
				tableAlertOptionRender={
					<a
						onClick={() => {
							setSelectedRowKeys([]);
							setSelectList([]);
						}}>
						取消选择
					</a>
				}
				beforeSearch={(values) => {
					return {
						...values,
						filterGoodsIds: pageType ? goodsIds : undefined,
						type: 'HIS',
					};
				}}
			/>
			{/* 绑定提示 */}
			{showPrompt && (
				<Modal
					width={400}
					visible={true}
					maskClosable={true}
					destroyOnClose={true}
					title='操作成功'
					footer={[
						<Button
							type='primary'
							onClick={() => {
								setShowPrompt(false);
								closeModal();
							}}>
							关闭
						</Button>,
					]}>
					<div>
						{(promptList || []).map((item, index) => (
							<p key={index}>{item}</p>
						))}
					</div>
				</Modal>
			)}
		</Modal>
	);
};

export default connect(({ loading }: { loading: { effects: { [key: string]: boolean } } }) => ({
	loading: loading.effects['relateGoods/queryHisGoods'],
	submitLoading: loading.effects['relateGoods/relateGoods'],
}))(DetailModal);
