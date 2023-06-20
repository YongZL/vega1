import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';

import Breadcrumb from '@/components/Breadcrumb';
import messageConfig from '@/components/GlobalHeader/messageConfig';
import ProTable from '@/components/ResizableTable';
import { timeType3 } from '@/constants';
import { doneStatus, isReadStatus, isReadStatusValueEnum } from '@/constants/dictionary';
import {
	doBatchDelete,
	doBatchRead,
	doReadAll,
	getMessageList,
	getMessageType,
} from '@/services/message';
import { notification } from '@/utils/ui';
import { Button, Card, Form, Popconfirm } from 'antd';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { FC, useEffect, useRef, useState } from 'react';
import { history } from 'umi';

const MessageList: FC<{}> = () => {
	const [form] = Form.useForm();
	const tableRef = useRef<ProTableAction>();
	const [typeList, setTypeList] = useState<MessageController.TypeList[]>([]);
	const [loadingType, setLoadingType] = useState<string>('');
	const [unReadNum, setUnReadNum] = useState<number>(0);
	const [isAllRead, setIsAllRead] = useState<boolean>(true);
	const [selectedList, setSelectedList] = useState<MessageController.ListRecord[]>([]);

	// 获取类型list
	const getTypeList = async () => {
		const res = await getMessageType();
		if (res && res.code === 0) {
			const dataList = (res.data || []).map((item) => ({
				value: item.category,
				label: item.name,
			}));
			setTypeList(dataList);
		}
	};

	useEffect(() => {
		// 未读消息数量
		const unReadMessageNumber: any = window.localStorage.getItem('unreadNum') || 0;
		setUnReadNum(unReadMessageNumber);
		// 获取类型list
		getTypeList();
		// 查询
		setTimeout(() => {
			form.submit();
		}, 200);
	}, []);

	// 批量标为已读
	const handleBatchRead = async () => {
		setLoadingType('batchRead');
		const ids = selectedList.map((item) => item.id);
		const res = await doBatchRead({ ids });
		if (res && res.code === 0) {
			notification.success('操作成功');
			setSelectedList([]);
			tableRef.current?.reload();
		}
		setLoadingType('');
	};

	// 批量删除
	const handleBatchDelete = async () => {
		setLoadingType('batchDelete');
		const ids = selectedList.map((item) => item.id);
		const res = await doBatchDelete({ ids });
		if (res && res.code === 0) {
			notification.success('操作成功');
			setSelectedList([]);
			tableRef.current?.reload();
		}
		setLoadingType('');
	};

	// 全部已读
	const handleReadAll = async () => {
		setLoadingType('readAll');
		const res = await doReadAll();
		if (res && res.code === 0) {
			notification.success('操作成功');
			setUnReadNum(0);
			tableRef.current?.reload();
		}
		setLoadingType('');
	};

	// 单行点击选中
	const selectRowOfClick = (record: MessageController.ListRecord) => {
		let selectList = cloneDeep(selectedList);
		if (selectList.some((item) => item.id === record.id)) {
			selectList = selectList.filter((item) => item.id !== record.id);
		} else {
			selectList.push(record);
		}
		const isReadAll = selectList.every((item) => item.read);
		setIsAllRead(isReadAll);
		setSelectedList(selectList);
	};

	// 选择
	const selectRow = (selectData: MessageController.ListRecord, status: boolean) => {
		let selectList = cloneDeep(selectedList);
		if (status) {
			selectList.push(selectData);
		} else {
			selectList = selectList.filter((item) => item.id !== selectData.id);
		}
		const isReadAll = selectList.every((item) => item.read);
		setIsAllRead(isReadAll);
		setSelectedList(selectList);
	};

	// 全选
	const onSelectAll = (
		selected: boolean,
		selectedRecords: MessageController.ListRecord[],
		changeRecords: MessageController.ListRecord[],
	) => {
		let selectList = cloneDeep(selectedList);
		if (selected) {
			selectList = selectList.concat(changeRecords);
			selectList = selectList.reduce((item: any, next: any) => {
				return !item.includes(next) ? item.concat(next) : item;
			}, []);
		} else {
			changeRecords.forEach((item) => {
				selectList = selectList.filter((el) => el.id !== item.id);
			});
		}
		const isReadAll = selectList.every((item) => item.read);
		setIsAllRead(isReadAll);
		setSelectedList(selectList);
	};

	// 表格行是否可选择的配置项
	const rowSelection = {
		selectedRowKeys: selectedList.map((item) => item.id),
		onSelect: selectRow,
		onSelectAll: onSelectAll,
	};

	// 「查看详情」的点击回调
	const handleGoDetail = async (record: MessageController.ListRecord) => {
		const { msgContent, id, readOnly, status } = record;
		const { messageTypeStr, id: targetId, code } = msgContent || {};
		let msgConfig = messageConfig(messageTypeStr, false);
		let { path, state }: Record<string, any> = msgConfig;
		if (!code && (!targetId || targetId === 0)) {
			// 不支持查看详情
			return;
		}
		// 路由跳转到目标路径 TODO 手术请领界面待流程跑通后处理
		if (
			messageTypeStr === 'goods_request_commit' ||
			messageTypeStr === 'goods_request_refuse' ||
			messageTypeStr === 'goods_request_pass' ||
			messageTypeStr === 'warehouse_request_approval_review' ||
			messageTypeStr === 'goods_request_review_refuse' ||
			messageTypeStr === 'goods_request_review_pass'
		) {
			// 进入请领界面
			let str = `${readOnly ? true : false}/${messageTypeStr}`;
			history.push(`${path}/${targetId}/${str}`);
		} else {
			if (status && doneStatus.some((item) => item.value === status)) {
				path = msgConfig.searchPath;
			}
			if (state) {
				history.push({ pathname: `${path}/${targetId}/${readOnly ? true : false}`, state });
			} else {
				history.push(`${path}/${targetId}/${readOnly ? true : false}`);
			}
		}

		// 消息已读
		await doBatchRead({ ids: [id] });
	};

	const searchColumns: ProFormColumns = [
		{
			title: '状态',
			dataIndex: 'read',
			valueType: 'tagSelect',
			fieldProps: {
				options: isReadStatus,
			},
		},
		{
			title: '时间',
			dataIndex: 'time',
			valueType: 'dateRangeWithTag',
			initialValue: [
				moment(Date.now() - 1000 * 60 * 60 * 24).subtract(1, 'months'),
				moment(Date.now()),
			],
			fieldProps: {
				defaultTagValue: 'month', // 初始化一个月
				options: timeType3,
			},
		},
		{
			title: '类型',
			dataIndex: 'category',
			valueType: 'select',
			fieldProps: {
				options: typeList,
				placeholder: '请选择类型',
			},
		},
		{
			title: '详情',
			dataIndex: 'keywords',
			fieldProps: {
				placeholder: '请输入',
			},
		},
	];

	const columns: ProColumns<MessageController.ListRecord>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			width: 70,
			render: (text, record, index: number) => index + 1,
		},
		{
			title: '状态',
			dataIndex: 'read',
			filters: false,
			width: 70,
			valueEnum: isReadStatusValueEnum,
		},
		{
			title: '类型',
			dataIndex: 'type',
			key: 'type',
			width: 100,
			renderText: (text: string, record) => {
				const { category } = record.msgContent;
				return (
					<span
						style={{ color: record.read ? CONFIG_LESS['@c_disabled'] : CONFIG_LESS['@c_body'] }}>
						{category}
					</span>
				);
			},
		},
		{
			title: '时间',
			dataIndex: 'timeCreated',
			key: 'timeCreated',
			width: 100,
			renderText: (text: Date) => (text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-'),
		},
		{
			title: '详情',
			dataIndex: 'title',
			key: 'title',
			width: 620,
			renderText: (text: string, record) => {
				const { msgContent } = record;
				const { context, code, id } = msgContent;
				const content = !code && (!id || id === 0) ? context : `${context}(${code})`;
				return (
					<span>
						<span dangerouslySetInnerHTML={{ __html: content }}></span>
						<span
							onClick={() => handleGoDetail(record)}
							style={{ color: CONFIG_LESS['@c_starus_await'], paddingLeft: 8, cursor: 'pointer' }}>
							{!code && (!id || id === 0) ? '' : '查看详情'}
						</span>
					</span>
				);
			},
		},
	];

	const beforeSearch = (params: Record<string, any>) => {
		const readStatus = params.read && params.read.split(',');
		return {
			...params,
			read: readStatus && readStatus.length > 1 ? undefined : params.read,
		};
	};

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb
					config={['消息列表']}
					isDynamic={true}
				/>
			</div>
			<Card bordered={false}>
				<ProTable<MessageController.ListRecord>
					tableInfoCode='message_list'
					api={getMessageList}
					columns={columns}
					rowKey='id'
					beforeSearch={beforeSearch}
					toolBarRender={() => [
						<Popconfirm
							placement='left'
							title='确定全部已读？'
							disabled={unReadNum <= 0 || ['batchDelete', 'batchRead'].includes(loadingType)}
							okButtonProps={{
								loading: loadingType === 'readAll',
							}}
							onConfirm={handleReadAll}>
							<Button
								disabled={unReadNum <= 0 || ['batchDelete', 'batchRead'].includes(loadingType)}
								type='primary'>
								全部已读
							</Button>
						</Popconfirm>,
						<Popconfirm
							placement='left'
							title='确定标为已读？'
							disabled={
								isAllRead ||
								selectedList.length <= 0 ||
								['batchDelete', 'readAll'].includes(loadingType)
							}
							okButtonProps={{
								loading: loadingType === 'batchRead',
							}}
							onConfirm={handleBatchRead}>
							<Button
								disabled={
									isAllRead ||
									selectedList.length <= 0 ||
									['batchDelete', 'readAll'].includes(loadingType)
								}
								type='primary'>
								标为已读
							</Button>
						</Popconfirm>,
						<Popconfirm
							placement='left'
							title='确定删除？'
							disabled={selectedList.length <= 0 || ['batchRead', 'readAll'].includes(loadingType)}
							okButtonProps={{
								loading: loadingType === 'batchDelete',
							}}
							onConfirm={handleBatchDelete}>
							<Button
								disabled={
									selectedList.length <= 0 || ['batchRead', 'readAll'].includes(loadingType)
								}
								type='primary'>
								删除
							</Button>
						</Popconfirm>,
					]}
					onRow={(record) => ({
						onClick: (e) => {
							e.stopPropagation();
							selectRowOfClick(record);
						},
					})}
					rowSelection={rowSelection as Record<string, any>}
					tableAlertOptionRender={<a onClick={() => setSelectedList([])}>取消选择</a>}
					searchConfig={{
						form,
						columns: searchColumns,
					}}
					dateFormat={{
						time: {
							startKey: 'start',
							endKey: 'end',
						},
					}}
					tableRef={tableRef}
					loadConfig={{ request: false }}
				/>
			</Card>
		</div>
	);
};

export default MessageList;
