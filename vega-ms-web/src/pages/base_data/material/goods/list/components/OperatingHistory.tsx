import type { ProColumns } from '@/components/ProTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import type { FC, ReactElement } from 'react';

import ProTable from '@/components/ProTable';
import { accessNameMap, getDay } from '@/utils';
import { Form, Modal } from 'antd';
import moment from 'moment';
import { cloneElement, useEffect, useRef, useState } from 'react';

import { timeType3 } from '@/constants';
import { selectRecord } from '@/services/goodsOperatorRecord';

type GoodsOperatorRecord = GoodsOperatorRecordController.GoodsOperatorRecord;

const OperatingHistory: FC<{
	trigger: ReactElement;
	detail: NewGoodsTypesController.GoodsRecord;
	disabled?: boolean;
}> = ({ detail = {}, trigger, disabled }) => {
	const [visible, setVisible] = useState<boolean>(false);
	const isLoadedRef = useRef<boolean>(false);
	const [form] = Form.useForm();
	const accessName = accessNameMap(); // 权限名称

	useEffect(() => {
		if (visible && !isLoadedRef.current) {
			setTimeout(() => {
				form?.submit();
			}, 200);
		}
	}, [form, isLoadedRef.current, detail, visible]);

	const searchColumns: ProFormColumns = [
		{
			title: '操作日期',
			dataIndex: 'submitTime',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: timeType3,
			},
		},
		{
			title: '操作类别',
			dataIndex: 'operatorType',
			valueType: 'select',
			fieldProps: {
				options: [
					{
						value: 0,
						label: '禁用',
					},
					{
						value: 1,
						label: '启用',
					},
					{
						value: 2,
						label: '修改',
					},
				],
			},
		},
	];

	const columns: ProColumns<GoodsOperatorRecord>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			width: 80,
			render: (text, recoed, index) => index + 1,
		},
		{
			title: '操作类别',
			dataIndex: 'operatorTypeName',
			key: 'operatorTypeName',
			width: 100,
		},
		{
			title: '操作人',
			dataIndex: 'operatorName',
			key: 'operatorName',
			width: 100,
		},
		{
			title: '操作日期',
			dataIndex: 'timeCreated',
			key: 'vg.time_modified',
			sorter: true,
			width: 150,
			renderText: (text) => {
				return text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			title: '操作内容',
			dataIndex: 'operatorContent',
			key: 'operatorContent',
			width: 350,
			render: (text, record) => {
				const operatorContent: string[] = record?.operatorContent?.split('>') as string[];
				const textList: string[] = operatorContent[1].split('；');
				const len = textList.length;

				return (
					<>
						<span>{operatorContent[0] + '>'}</span>
						<br />
						{textList.map((ele, index) => {
							const isEnd = index === len - 1;
							return (
								<>
									<span>{ele + (!isEnd ? '；' : '')}</span>
									{!isEnd && <br />}
								</>
							);
						})}
					</>
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
				title={accessName['Operating_history_goods']}
				onCancel={() => {
					setVisible(false);
				}}
				footer={false}
				destroyOnClose
				className='ant-detail-modal'>
				<ProTable<GoodsOperatorRecord>
					api={selectRecord}
					searchConfig={{
						columns: searchColumns,
						form,
					}}
					beforeSearch={(values) => {
						const params = { ...values };
						const { submitTime } = params;
						if (submitTime) {
							if (submitTime.length && submitTime[0]) {
								params.startTime = getDay(submitTime[0]);
							}
							if (submitTime.length && submitTime[1]) {
								params.endTime = getDay(params.submitTime[1], 'end');
							}
							delete params.submitTime;
						}
						return params;
					}}
					loadConfig={{
						request: false,
					}}
					size='middle'
					columns={columns}
					scroll={{
						x: '100%',
						y: 300,
					}}
					params={{ goodsId: detail.id }}
					// tableInfoId="144"
					options={{
						density: false,
						fullScreen: false,
						setting: false,
					}}
				/>
			</Modal>
		</>
	);
};

export default OperatingHistory;
