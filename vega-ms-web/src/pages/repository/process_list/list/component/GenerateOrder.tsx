import type { ProColumns } from '@/components//ProTable/typings';
import type { TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';

import ProTable from '@/components/ProTable';
import { processListStatusTextMap, processListTypeTextMap } from '@/constants/dictionary';
import { getList, submitPickUp } from '@/services/processingOrder';
import { accessNameMap } from '@/utils';
import { notification } from '@/utils/ui';
import '@ant-design/compatible/assets/index.css';
import { Badge, Button, message, Modal } from 'antd';
import moment from 'moment';
import React, { Key, useEffect, useState } from 'react';
export interface UpdateProps {
	setIsOpen: (value: boolean) => void;
	isOpen: boolean;
	close: () => void;
	status: string;
}
const GenerateOrderModal: React.FC<UpdateProps> = (props) => {
	const [list, setList] = useState<ProcessingOrderController.GetListRecord[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedKeys, setselectedKeys] = useState<(number | string)[]>([]);
	const { isOpen, setIsOpen, close, status } = props;
	const accessName = accessNameMap(); // 权限名称

	const changeSelectRowKey = (row: Key[]) => {
		setselectedKeys([...row]);
	};

	// 排序
	const handleChangeTable = (
		_pagination: TablePaginationConfig,
		_filters: Record<string, FilterValue | null>,
		sorter:
			| SorterResult<ProcessingOrderController.GetListRecord>
			| SorterResult<ProcessingOrderController.GetListRecord>[],
	) => {
		const { order, columnKey } = sorter as SorterResult<ProcessingOrderController.GetListRecord>;
		const sorters = order == null ? [] : [{ desc: order === 'descend', sortName: columnKey }];
		getGenrateOrder({ sortList: sorters, pageNum: 0 }, true);
	};

	const getGenrateOrder = async (val: any, isClickSort = false) => {
		let params = {
			...val,
			statusList: status,
			pageNum: 0,
			pageSize: 999,
		};
		setLoading(true);
		const res = await getList(params);
		if (res && res.code === 0 && res.data.rows.length) {
			setList(res.data.rows);
			if (!isClickSort) {
				setselectedKeys(res.data.rows.map((item: any) => item.id));
			}
			if (res.data.rows.length <= 0) {
				message.warn('当前待操作列表暂无待生成配货单加工单');
				close();
			}
		}
		setLoading(false);
	};

	useEffect(() => {
		if (isOpen) {
			getGenrateOrder('');
		}
	}, [isOpen]);

	const rowSelection = {
		selectedRowKeys: selectedKeys,
		onChange: changeSelectRowKey,
		getCheckboxProps(record: any) {
			return {
				disabled: record.checked,
			};
		},
	};

	const columns: ProColumns<ProcessingOrderController.GetListRecord>[] = [
		{
			title: '状态',
			dataIndex: 'status',
			key: 'status',
			width: 110,
			renderText: (val: string) => processListStatusTextMap[val],
		},
		{
			title: '来源',
			dataIndex: 'type',
			key: 'type',
			width: 110,
			renderText: (val: string) => processListTypeTextMap[val],
		},
		{
			title: '加工单号',
			dataIndex: 'code',
			key: 'code',
			width: 210,
			copyable: true,
		},
		{
			title: '加工详情',
			dataIndex: 'description',
			key: 'wpo.description',
			width: 180,
			ellipsis: true,
			sorter: true,
		},
		{
			title: '创建人员',
			dataIndex: 'createdName',
			key: 'createdName',
			width: 70,
		},
		{
			title: '创建时间',
			dataIndex: 'timeCreated',
			key: 'wpo.time_created',
			width: 180,
			renderText: (time) => (time ? moment(time).format('YYYY/MM/DD HH:mm:ss') : '-'),
			sorter: true,
		},
		{
			title: '生成结果',
			dataIndex: 'reason',
			key: 'reason',
			width: 300,
			render: (_val, record) => {
				return (
					<Badge
						color={
							record.reason
								? record.state === 0
									? CONFIG_LESS['@c_starus_warning']
									: CONFIG_LESS['@c_starus_done']
								: ''
						}
						text={record.reason ? record.reason : ''}
					/>
				);
			},
		},
	];

	const handleSubmit = async () => {
		if (!selectedKeys.length) {
			notification.warning('请选择一条以上进行操作');
			return;
		}
		setLoading(true);
		const res = await submitPickUp({ processingOrderId: selectedKeys, type: 'batch' });
		if (res && res.code === 0) {
			res.data.map((item) => {
				for (let index = 0; index < list.length; index++) {
					if (item.id === list[index].id) {
						list[index].reason = item.reason;
						list[index].state = item.status;
						if (item.status === 1) {
							list[index].checked = true;
						} else {
							list[index].checked = false;
						}
					} else {
						list;
					}
				}
			});
			setList(list);
			setselectedKeys([]);
		}
		setLoading(false);
	};

	const onClose = () => {
		close();
	};

	return (
		<Modal
			className='ant-detail-modal'
			destroyOnClose
			maskClosable={false}
			visible={isOpen && list.length > 0}
			title={accessName['process_make']}
			onCancel={() => setIsOpen(false)}
			footer={
				<>
					<Button
						key='back'
						onClick={onClose}>
						取消
					</Button>
					<Button
						key='submit'
						type='primary'
						onClick={handleSubmit}>
						确认操作
					</Button>
				</>
			}>
			<ProTable<ProcessingOrderController.GetListRecord>
				loading={loading}
				// tableInfoId="287"
				columns={columns}
				rowSelection={rowSelection}
				rowKey='id'
				dataSource={list}
				options={{ density: false, fullScreen: false, setting: false }}
				scroll={{ x: '100%', y: 300 }}
				pagination={false}
				onChange={handleChangeTable}
				tableAlertRender={false}
			/>
		</Modal>
	);
};

export default GenerateOrderModal;
