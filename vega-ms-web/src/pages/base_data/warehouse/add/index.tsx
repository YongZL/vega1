import type { ProFormColumns } from '@/components/SchemaForm';

import Breadcrumb from '@/components/Breadcrumb';
import FooterToolbar from '@/components/FooterToolbar';
import SchemaForm from '@/components/SchemaForm';
import { colItem3, searchFormItem6 } from '@/constants/formLayout';
import { ByIdGetParent, getTreeData } from '@/services/department';
import {
	addWarehouse,
	editWarehouse,
	getGroupList,
	getWarehouseDetail,
} from '@/services/warehouse';
import { transformSBCtoDBC } from '@/utils';
import { genCascaderData } from '@/utils/dataUtil';
import { notification } from '@/utils/ui';
import { Button, Card, Form } from 'antd';
import { FC, SetStateAction, useEffect, useState } from 'react';
import { history, useModel } from 'umi';

interface Props {
	match: { params: { id: number; handleType: string } };
	history: { location: { state: { params: string } } };
}

type GroupListItem = WarehouseController.GroupListItem;

const AddList: FC<Props> = (props) => {
	const { id } = props?.match?.params;
	const { params } = props?.history?.location?.state;
	const handleType = id ? 'edit' : 'add';
	const [form] = Form.useForm();
	const [selectLevel, setSelectLevel] = useState(0);
	const [submitLoading, setSubmitLoading] = useState<boolean>(false);
	const [treeData, setTreeData] = useState<Record<string, any>[]>([]);
	const [groupList, setGroupList] = useState<GroupListItem[]>([]);
	const { loading: fieldLoading, fieldsMap, getWarehouseField } = useModel('warehouseField');

	useEffect(() => {
		getWarehouseField();
	}, []);

	// 提交
	const listSubmit = () => {
		form.validateFields().then(async (values) => {
			const { departmentId } = values;
			values.departmentId = departmentId[departmentId.length - 1];
			if (handleType === 'edit') {
				values.id = id;
				const res = await editWarehouse(transformSBCtoDBC(values));
				if (res && res.code === 0) {
					notification.success('编辑成功！');
					history.push({ pathname: `/base_data/warehouse`, state: 'warehouse' });
				}
			} else {
				const res = await addWarehouse(transformSBCtoDBC(values));
				if (res && res.code === 0) {
					notification.success('新增成功！');
					history.push(`/base_data/warehouse`);
				}
			}
			setSubmitLoading(false);
		});
	};

	// 推送组
	const getGroupListData = async () => {
		const res = await getGroupList();
		if (res && res.code === 0) {
			setGroupList(res.data);
		}
	};

	const getDep = (treeData: any = []) => {
		for (let index = 0; index < treeData.length; index++) {
			if (treeData[index].label === params) {
				if (JSON.stringify(treeData[index]) !== '{}') {
					getDepartmentsParent(treeData[index].key);
					setSelectLevel(1);
					form.setFieldsValue({
						name: `${params}仓库`,
						level: 1,
					});
				}
			} else {
				getDep(treeData[index].children);
			}
		}
	};

	// 获取科室树形结构数据
	const getDepartments = async () => {
		const res = await getTreeData();
		if (res && res.code === 0) {
			let departmentsTreeData = genCascaderData(res.data);
			setTreeData(departmentsTreeData);

			if (typeof params === 'string') {
				getDep(departmentsTreeData);
			}
		}
	};

	const getDepartmentsAllId = (data, ids: number[]) => {
		data.forEach((el: { id: number; children: null }) => {
			ids.push(el.id);
			if (el.children !== null) {
				return getDepartmentsAllId(el.children, ids);
			}
		});
		return ids;
	};

	const getDepartmentsParent = async (id: number) => {
		const res = await ByIdGetParent(id);
		if (res && res.code === 0) {
			const departmentCode = getDepartmentsAllId([res.data], []);
			form.setFieldsValue({
				departmentId: departmentCode,
			});
		}
	};

	// 详情
	const getDetailInfo = async () => {
		const res = await getWarehouseDetail(id);
		if (res && res.code === 0) {
			const data = res.data;
			form.setFieldsValue({
				name: data?.name,
				level: data?.level,
				isVirtual: data?.isVirtual,
				priority: data.priority ?? undefined,
				deliveryGroupId: data?.deliveryGroupId,
			});
			data.level && setSelectLevel(data.level);
			data.departmentId && getDepartmentsParent(data.departmentId);
		}
	};

	useEffect(() => {
		getGroupListData();
		getDepartments();
		if (handleType === 'edit') {
			getDetailInfo();
		}
	}, [handleType]);

	const goBack = () => {
		history.push({ pathname: `/base_data/warehouse`, state: 'warehouse' });
	};

	const columns: ProFormColumns = [
		{
			title: '仓库名称',
			dataIndex: 'name',
			colProps: colItem3,
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: '仓库类型',
			dataIndex: 'level',
			valueType: 'radio',
			colProps: colItem3,
			fieldProps: {
				name: 'radiogroup',
				disabled: handleType === 'edit',
				onChange: (e: { target: { value: SetStateAction<number> } }) =>
					setSelectLevel(e.target.value),
				options: [
					{
						label: '中心仓库',
						value: 0,
					},
					{
						label: '二级仓库',
						value: 1,
					},
				],
			},
		},
		{
			title: '所属科室',
			dataIndex: 'departmentId',
			colProps: colItem3,
			valueType: 'cascader',
			fieldProps: {
				getPopupContainer: (node: HTMLElement) => node.parentNode,
				placeholder: '请选择所属科室',
				options: treeData,
				showSearch: {
					filter: (input, path) => {
						return path.some(
							(option: Record<string, any>) =>
								option?.label?.toLowerCase().indexOf(input.toLowerCase()) > -1,
						);
					},
				},
			},
		},
		{
			title: '是否为虚拟库',
			dataIndex: 'isVirtual',
			valueType: 'radio',
			colProps: colItem3,
			hideInForm: selectLevel !== 1,
			fieldProps: {
				name: 'radiogroup',
				disabled: handleType === 'edit',
				options: [
					{
						label: '是',
						value: true,
					},
					{
						label: '否',
						value: false,
					},
				],
			},
		},
		{
			title: '推送组别',
			dataIndex: 'deliveryGroupId',
			valueType: 'select',
			hideInForm: selectLevel !== 1,
			colProps: colItem3,
			fieldProps: {
				allowClear: true,
				options: groupList.map((item) => ({ label: item.name, value: item.id, key: item.id })),
			},
		},
		{
			title: '推送优先级别',
			dataIndex: 'priority',
			valueType: 'inputUnit',
			colProps: colItem3,
			hideInForm: selectLevel !== 1,
			fieldProps: {
				min: 1,
				max: 99,
				style: { width: '50%' },
			},
			formItemProps: {
				extra: '数值越低，优先级别越高',
			},
		},
		{
			title: 'ePS仓库编号',
			dataIndex: 'epsWarehouseCode',
			colProps: colItem3,
			hideInForm: WEB_PLATFORM !== 'DS',
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: '平台仓库码',
			dataIndex: 'platformCode',
			colProps: colItem3,
			hideInForm: WEB_PLATFORM !== 'DS',
			fieldProps: {
				maxLength: 30,
			},
		},
	];

	let finalColumns: ProFormColumns = [];
	if (!fieldLoading) {
		let initSort = 9999;
		finalColumns = columns
			.filter((item: any) => {
				let aKey = item.dataIndex || item.key;
				if (aKey === 'departmentId') {
					aKey = 'departmentName';
				}
				const aField = fieldsMap[aKey] || {};
				return aField.enabled;
			})
			.map((col: Record<string, any>) => {
				let key = col.dataIndex || col.key;
				if (key === 'departmentId') {
					key = 'departmentName';
				}
				const field = fieldsMap[key as string] || {};
				const isSelect = col.valueType;
				return {
					...col,
					title: field.displayFieldLabel || col.title,
					formItemProps: {
						...(col.formItemProps || {}),
						rules: [
							{
								required: field.required,
								message: `${isSelect ? '请选择' : '请输入'}${field.displayFieldLabel}`,
							},
						],
					},
				};
			})
			.sort((a: any, b: any) => {
				let aKey = a.dataIndex || a.key;
				let bKey = b.dataIndex || b.key;
				if (aKey === 'departmentId') {
					aKey = 'departmentName';
				}
				if (bKey === 'departmentId') {
					bKey = 'departmentName';
				}
				const aField = fieldsMap[aKey] || {};
				const bField = fieldsMap[bKey] || {};
				// 如果没有排序则放到最后
				return (aField.sort || ++initSort) - (bField.sort || ++initSort);
			});
	}

	return (
		<div className='detail-page'>
			<div className='detail-breadcrumb'>
				<Breadcrumb
					config={['', ['', { pathname: '/base_data/warehouse', state: { key: '1' } }], '']}
				/>
			</div>

			<Card
				bordered={false}
				className='mb6 card-mt2'>
				<SchemaForm
					layoutType='Form'
					columns={finalColumns}
					form={form}
					scrollToFirstError
					{...searchFormItem6}
					grid
					justifyLabel={false}
					layout='horizontal'
					submitter={{
						render: () => (
							<FooterToolbar>
								<Button
									onClick={goBack}
									className='returnButton'>
									返回
								</Button>
								<Button
									type='primary'
									loading={submitLoading}
									onClick={listSubmit}
									className='verifyButton'>
									确认操作
								</Button>
							</FooterToolbar>
						),
					}}
				/>
			</Card>
		</div>
	);
};

export default AddList;
