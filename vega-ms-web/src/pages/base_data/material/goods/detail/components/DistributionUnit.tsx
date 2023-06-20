import type { ProColumns } from '@/components/ProTable';
import type { SelectProps } from 'antd';

import InputUnit from '@/components/InputUnit';
import ProTable from '@/components/ProTable';
import { notification } from '@/utils/ui';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Form, Input, Popconfirm, Select } from 'antd';
import { cloneDeep } from 'lodash';
import React, { useEffect, useState } from 'react';

import {
	addDistributionUnit,
	deleteDistributionUnitById,
	getList,
	setDefault,
	unsetDefault,
	updateDistributionUnit,
} from '@/services/distributionUnit';

type DistributionUnitRecord = Omit<DistributionUnitController.DistributionUnitRecord, 'id'> & {
	id: number;
};

const dictionary = JSON.parse(sessionStorage.getItem('dictionary') || '{}');
const numList = ['length', 'width', 'height', 'volume'];
// 校验
const validateNum = (_rule: any, value: string | number) => {
	if (value === 0 || value === '') {
		return Promise.resolve();
	}
	const reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
	if (value && !reg.test(`${value}`)) {
		return Promise.reject('请输入正确数值');
	}
	return Promise.resolve();
};
const validateQuantity = (_rule: any, value: string) => {
	if (!value) {
		return Promise.resolve();
	}
	const reg = /^[1-9]\d*$/;
	if (value && !reg.test(value)) {
		return Promise.reject('请输入正确数值');
	}
	return Promise.resolve();
};

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
	editing: boolean;
	dataIndex: string;
	title: string;
	record: DistributionUnitRecord;
	index: number;
	children: React.ReactNode;
}

const UnitSelect = (props: SelectProps) => {
	return (
		<Select
			showSearch
			filterOption={(input, option) =>
				option?.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
			}
			placeholder=''
			options={(dictionary.unit_type || []).map((item: Record<string, string>) => ({
				...item,
				label: item.text,
			}))}
			{...props}
		/>
	);
};

const DistributionUnit: React.FC<{ goodsId: number; unit: string }> = ({ goodsId, unit }) => {
	const [form] = Form.useForm();
	const [data, setData] = useState<DistributionUnitRecord[]>([]);
	const [selectedKeys, setSelectedKeys] = useState<number[]>([]);
	const [editingId, setEditingId] = useState<number>();
	const [editLoadingMap, setEditLoadingMap] = useState<Record<string, boolean>>({});
	const [delLoadingMap, setDelLoadingMap] = useState<Record<string, boolean>>({});
	const [setDefaultLoadingMap, setSetDefaultLoadingMap] = useState<Record<string, boolean>>({});

	const EditableCell: React.FC<EditableCellProps> = ({
		editing,
		dataIndex,
		title,
		record,
		index,
		children,
		...restProps
	}) => {
		const inputNode =
			dataIndex === 'quantity' ? (
				<InputUnit
					unit={unit}
					min={1}
					max={999999}
				/>
			) : dataIndex === 'unitId' ? (
				<UnitSelect />
			) : (
				<Input
					placeholder='请输入'
					maxLength={9}
				/>
			);

		return (
			<td {...restProps}>
				{editing ? (
					<Form.Item
						name={dataIndex}
						rules={[
							{
								required: ['unitId', 'quantity'].includes(dataIndex) ? true : false,
								message: '请选择',
							},
							{
								validator:
									dataIndex === 'quantity'
										? validateQuantity
										: numList.includes(dataIndex)
										? validateNum
										: undefined,
							},
						]}
						className='mg0'>
						{inputNode}
					</Form.Item>
				) : (
					children
				)}
			</td>
		);
	};

	const isEditing = (record: DistributionUnitRecord) => record?.id === editingId;

	const getData = async () => {
		const res = await getList({ goodsId });
		if (res && res.code === 0) {
			let data = res.data;

			data.map((itemDate) => {
				// 后端字经过处理返回结果并无*10000
				numList.forEach((val) => {
					itemDate[val] = itemDate[val] ? (itemDate[val] / 1000).toFixed(2) : '';
				});
			});
			setData(data as DistributionUnitRecord[]);
			const select = data.filter((item) => item.inuse);
			const key = select[0] ? [select[0].id] : [];
			setSelectedKeys(key as number[]);
			setEditingId(undefined);
		}
	};

	const handleEdit = (record: DistributionUnitRecord) => {
		setEditingId(record.id);
		form.setFieldsValue({ ...record, unitId: String(record.unitId) });
	};

	// 保存
	const save = async (id: number) => {
		if (editLoadingMap[id]) {
			return;
		}
		setEditLoadingMap({ ...editLoadingMap, [id]: true });
		try {
			const values = (await form.validateFields()) as DistributionUnitRecord;
			numList.forEach((key) => {
				values[key] = values[key] * 1000;
			});
			const api = id === -1 ? addDistributionUnit : updateDistributionUnit;
			const res = await api({ ...values, goodsId, ...(id === -1 ? {} : { id }) } as any);
			if (res && res.code === 0) {
				notification.success('操作成功');
				getData();
			}
		} finally {
			if (id === -1) {
				delete editLoadingMap[-1];
			} else {
				editLoadingMap[id] = false;
			}
			setEditLoadingMap({ ...editLoadingMap });
		}
	};

	// 删除
	const deleteItem = async (id: number) => {
		if (id === -1) {
			const newData = data.filter((item) => item.id !== -1);
			setData(newData);
		} else {
			setDelLoadingMap({ ...delLoadingMap, [id]: true });
			try {
				const res = await deleteDistributionUnitById(id);
				if (res && res.code === 0) {
					notification.success('操作成功');
					setEditingId(undefined);
					getData();
				}
			} finally {
				setDelLoadingMap({ ...delLoadingMap, [id]: false });
			}
		}
	};

	const handleAdd = () => {
		if (data.some((item) => item.id === -1)) {
			notification.warning('一次只可新增一条数据');
			return;
		}
		const newData = cloneDeep(data);
		const item = {
			height: '',
			length: '',
			quantity: '',
			unitId: '',
			volume: '',
			width: '',
			id: -1,
		};
		newData.push(item as unknown as DistributionUnitRecord);
		handleEdit(item as unknown as DistributionUnitRecord);
		setData(newData);
	};

	const selectRow = async (selectData: DistributionUnitRecord, status: boolean) => {
		const { id } = selectData;
		setSetDefaultLoadingMap({ ...setDefaultLoadingMap, [id]: true });
		try {
			const api = status ? setDefault : unsetDefault;
			const res = await api({ goodsId, id });
			if (res && res.code === 0) {
				notification.success('操作成功！');
				getData();
			}
		} finally {
			setSetDefaultLoadingMap({ ...setDefaultLoadingMap, [id]: false });
		}
	};

	useEffect(() => {
		getData();
	}, []);

	const columns: ProColumns<DistributionUnitRecord>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			width: 'XXXS',
			render: (_, _record, index) => index + 1,
		},
		{
			title: '包装单位',
			dataIndex: 'unitId',
			width: 'S',
			// @ts-ignore
			editable: true,
			render: (text, record) => record.unitName,
		},
		{
			title: '与计价单位的转换率',
			dataIndex: 'quantity',
			width: 'L',
			// @ts-ignore
			editable: true,
			render: (text) => (text ? text + unit : '-'),
		},
		{
			title: '长(cm)',
			dataIndex: 'length',
			width: 'XS',
			// @ts-ignore
			editable: true,
		},
		{
			title: '宽(cm)',
			dataIndex: 'width',
			width: 'XS',
			// @ts-ignore
			editable: true,
		},
		{
			title: '高(cm)',
			dataIndex: 'height',
			width: 'XS',
			// @ts-ignore
			editable: true,
		},
		{
			title: '体积(cm³)',
			dataIndex: 'volume',
			width: 'XS',
			// @ts-ignore
			editable: true,
		},
		{
			title: '操作',
			width: 'XS',
			fixed: 'right',
			dataIndex: 'operation',
			render: (_: any, record) => {
				const editable = isEditing(record);
				return (
					<>
						{editable ? (
							<span
								onClick={() => save(record.id)}
								className='handleLink'>
								保存
							</span>
						) : (
							<span
								className='handleLink'
								onClick={() => handleEdit(record)}>
								编辑
							</span>
						)}
						<Divider type='vertical' />
						<Popconfirm
							placement='left'
							title='确定删除？'
							onConfirm={() => deleteItem(record.id)}
							disabled={delLoadingMap[record.id]}>
							<span className='handleLink'>删除</span>
						</Popconfirm>
					</>
				);
			},
		},
	];

	const rowSelection = {
		columnTitle: '用作赋码',
		columnWidth: 90,
		selectedRowKeys: selectedKeys,
		onSelect: selectRow,
		getCheckboxProps: (record: DistributionUnitRecord) => ({
			disabled: record.id === -1,
		}),
	};

	const mergedColumns = columns.map((col) => {
		if (!col.editable) {
			return col;
		}
		return {
			...col,
			onCell: (record: DistributionUnitRecord) => ({
				record,
				dataIndex: col.dataIndex,
				title: col.title,
				editing: isEditing(record),
				key: col.key,
			}),
		};
	}) as ProColumns<DistributionUnitRecord>[];

	return (
		<Form
			form={form}
			component={false}
			style={{ margin: -40 }}>
			<ProTable<DistributionUnitRecord>
				headerTitle={<h3 className='ant-descriptions-title'>赋码单位</h3>}
				toolBarRender={() => [
					<Button
						type='primary'
						onClick={handleAdd}
						className='iconButton'>
						<PlusOutlined />
						新增
					</Button>,
				]}
				components={{
					body: {
						cell: EditableCell,
					},
				}}
				columns={mergedColumns}
				dataSource={data}
				pagination={false}
				scroll={{
					y: '100%',
					x: 300,
				}}
				rowKey='id'
				rowSelection={rowSelection}
				tableAlertOptionRender={<a onClick={() => setSelectedKeys([])}>取消选择</a>}
			/>
		</Form>
	);
};

export default DistributionUnit;
