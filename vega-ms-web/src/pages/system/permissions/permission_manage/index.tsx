import Breadcrumb from '@/components/Breadcrumb';
import * as formLayout from '@/constants/formLayout';
import {
	getPermissionsList,
	getPermissionsListid,
	postAdd,
	putUpdate,
	queryPermissionTree,
} from '@/services/permissions';
import { transformSBCtoDBC, accessNameMap } from '@/utils';
import { notification } from '@/utils/ui';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import searchLogo from '@/assets/images/search.svg';

import { Button, Card, Form, Input, InputNumber, Modal, Radio, Tree, TreeSelect } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { useAccess } from 'umi';
const App: FC<{}> = () => {
	const [treeData, setTreeData] = useState<PermissionsController.QueryPermissionTree[]>([]);
	const [data, setData] = useState<PermissionsController.QueryPermissionTree[]>([]);
	const [expandedKeys, setExpandedKeys] = useState<[string] | undefined>(['']);
	const [searchValue, setSearchValue] = useState<string>('');
	const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
	const [detail, setDetail] = useState<PermissionsController.QuerygetPermissionsListid>({});
	const [addBoxVisible, setAddBoxVisible] = useState<boolean>(false);
	const [addBoxVisibleKey, setAddBoxVisibleKey] = useState<number>(0);
	const [sortBoxVisible, setSortBoxVisible] = useState<boolean>(false);
	const [sortBoxVisibleKey, setSortBoxVisibleKey] = useState<number>(10000);
	const [selectedInfo, setSelectedInfo] = useState<{ id: number; sort: string }>({
		id: 0,
		sort: '',
	});
	const [cmContainer, setCmContainer] = useState<number>(0);
	const [type, setType] = useState<string>('');

	const formRef: Record<string, any> = React.createRef();
	const access = useAccess();
	const TreeNode = Tree.TreeNode;
	const RadioGroup = Radio.Group;
	const Search = Input.Search;
	const FormItem = Form.Item;
	const accessNameMaplist: Record<string, any> = accessNameMap();
	const formItemLayoutAll = {
		labelCol: {
			xs: { span: 24 },
			sm: { span: 5 },
		},
		wrapperCol: {
			xs: { span: 24 },
			sm: { span: 12 },
		},
	};
	useEffect(() => {
		getPermissionList();
	}, []);

	/**
	 * 遍历权限数据,返回treeData
	 * @param   withchildren  是否将type=function的children变为不可点
	 */
	const transformTreeData = (data: any, withchildren = true) => {
		let rtnData =
			data && data.length
				? data.map(function (o: { name?: string; id?: number; type?: string; children?: [] }) {
						var oNew = {
							title: o.name,
							key: o.id,
							value: o.id,
							type: o.type,
							children: transformTreeData(o.children),
						};
						if (oNew.children === undefined) delete oNew.children;
						return oNew;
				  })
				: undefined;
		if (withchildren) {
			//包含所有children
			return rtnData;
		} else {
			//只有父元素
			let parentNode = getSignedData(rtnData, 0);
			return parentNode;
		}
	};

	//标识
	const getSignedData = (treeData: PermissionsController.QueryPermissionTree[], grade: number) => {
		if (!treeData || treeData.length === 0) {
			return [];
		}
		for (let i = 0; i < treeData.length; i++) {
			let item = treeData[i];
			if (item.type === 'function') {
				item.disabled = true;
			}
			item.children = getSignedData(item.children, grade + 1);
		}
		return treeData;
	};

	// 遍历权限数据,获取所有id
	const getPermissionAllId = (data: Record<string, any>, ids: Record<string, any>) => {
		data.map((el: { children: []; id: string }) => {
			ids.push(el.id.toString());
			if (el.children.length !== 0) {
				return getPermissionAllId(el.children, ids);
			}
		});
		return ids;
	};

	//权限数据，全部的
	const getPermissionList = async () => {
		let res = await queryPermissionTree();
		if (res && res.code == 0) {
			let treeData = transformTreeData(res.data);
			let data = getSignedData(treeData, 0);
			setTreeData(treeData);
			setData(data);
		}
	};

	const handleEdit = async (key: string | number) => {
		let ress = await getPermissionsListid(key);
		if (ress && ress.code == 0) {
			setDetail(ress.data);
			// formRef.current.resetFields();
			setType(ress.data.type as string);
		}
		let res = await getPermissionsList();
		if (res && res.code == 0) {
			setData(transformTreeData(res.data, false));
		}
		setAddBoxVisible(true);
		setAddBoxVisibleKey(addBoxVisibleKey + 1);
	};

	const handleCancel = () => {
		setAddBoxVisible(false);
		setAddBoxVisibleKey(addBoxVisibleKey + 1);
		setDetail({});
		setType('');
	};

	const getKey = (value: string, arr: Record<string, any>, keys: [string]) => {
		arr.map((item: { key: string; title: string; children: [] }) => {
			if (item.title.indexOf(value) > -1) {
				keys.push(item.key);
			}
			if (item.children && item.children.length) {
				getKey(value, item.children, keys);
			}
		});
		return keys;
	};

	// 搜索
	const onSearch = (e: any) => {
		const value = e.target.value;

		const expandedKeys = getKey(value, treeData, ['']);
		setExpandedKeys(expandedKeys);
		setSearchValue(value);
		setAutoExpandParent(true);
	};

	const onExpand = (expandedKeys?: [string]) => {
		setExpandedKeys(expandedKeys);
		setAutoExpandParent(false);
	};

	// 点击添加权限
	// 获取不含最底层权限的数据
	const handleAddButtonClick = () => {
		setAddBoxVisible(true);
		setAddBoxVisibleKey(addBoxVisibleKey + 1);
		setDetail({});
	};
	const onFinish = async (values: { parentId: number }) => {
		if (values.parentId) {
			values.parentId = Math.floor(values.parentId);
		} else {
			values.parentId = 0;
		}
		if (detail.id) {
			let res = await putUpdate(detail.id, transformSBCtoDBC(values));
			if (res && res.code == 0) {
				notification.success('更新成功');
				getPermissionList();
				setAddBoxVisible(false);
				setAddBoxVisibleKey(addBoxVisibleKey + 1);
			}
		} else {
			let res = await postAdd(values);
			if (res && res.code == 0) {
				notification.success('保存成功');
				getPermissionList();
				setAddBoxVisible(false);
				setAddBoxVisibleKey(addBoxVisibleKey + 1);
			}
		}
	};
	// 提交权限操作
	const handleSubmit = () => {
		formRef.current.submit();
		setType('');
	};

	// 取消更改排序
	const handleCancelEditSort = () => {
		setSortBoxVisible(false);
		setSortBoxVisibleKey(sortBoxVisibleKey + 1);
	};

	const formItemLayout = formLayout.formItemModal;
	const loop = (record: any[]) =>
		record.map((item) => {
			const index = item.title.search(searchValue);
			let title;
			if (index > -1) {
				const beforeStr = item.title.substr(0, index);
				const afterStr = item.title.substr(index + searchValue.length);
				title = () => (
					<span
						// 增加外层span标签宽度避免出现移入移出两种事件同时触发
						style={{
							display: 'inline-block',
							paddingRight: '5px',
						}}
						onMouseLeave={(e) => {
							e.stopPropagation();
							setCmContainer(0);
							// 这里不需要延时器，若移入移出事件同时触发由于移出方法加了延时器，编辑铅笔就会出现移入后显示一下然后消失
							// setTimeout(() => {
							// }, 2000);
						}}
						onMouseOver={(e) => {
							e.stopPropagation();
							setCmContainer(item.key);
						}}>
						{beforeStr}
						<span style={{ color: CONFIG_LESS['@c_starus_warning'] }}>{searchValue}</span>
						{afterStr}
						{access.edit_permission_manage && cmContainer === item.key && (
							<span className='operator-wrap'>
								<EditOutlined
									style={{ marginLeft: '10px' }}
									className='operate-icon'
									onClick={() => {
										handleEdit(item.key);
									}}
								/>
							</span>
						)}
					</span>
				);
			} else {
				title = () => (
					<span
						onMouseLeave={(e) => {
							e.stopPropagation();
							setTimeout(() => {
								setCmContainer(0);
							}, 2000);
						}}
						onMouseOver={(e) => {
							e.stopPropagation();
							setCmContainer(item.key);
						}}>
						{item.title}
						{access.edit_permission_manage && cmContainer === item.key && (
							<span className='operator-wrap'>
								<EditOutlined
									style={{ marginLeft: '10px' }}
									className='operate-icon'
									onClick={() => {
										handleEdit(item.key);
									}}
								/>
							</span>
						)}
					</span>
				);
			}
			if (item.children && item.children.length) {
				return (
					<TreeNode
						key={item.key}
						title={title}>
						{loop(item.children)}
					</TreeNode>
				);
			}
			return (
				<TreeNode
					key={item.key}
					title={title}
				/>
			);
		});
	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<div className='pageHeaderWrapper'>
				<Card bordered={false}>
					<div style={{ display: 'flex', flexDirection: 'column' }}>
						<Input
							onChange={onSearch}
							placeholder='搜索权限名'
							style={{ width: 184, marginLeft: '8px' }}
							suffix={
								<img
									src={searchLogo}
									style={{ width: '20px', height: '20px' }}
								/>
							}
						/>

						{access.add_permission_manage && (
							<Button
								type='primary'
								style={{ width: '184px', marginTop: '10px', marginLeft: '8px' }}
								onClick={handleAddButtonClick}
								className='btnOperator iconButton'>
								<PlusOutlined style={{ marginLeft: -4 }} />
								添加权限
							</Button>
						)}
					</div>

					<Tree
						className='draggable-tree'
						defaultExpandAll={true}
						onExpand={onExpand}
						expandedKeys={expandedKeys}
						autoExpandParent={autoExpandParent}>
						{loop(treeData)}
					</Tree>
				</Card>
			</div>
			<Modal
				visible={addBoxVisible}
				key={addBoxVisibleKey}
				title={
					detail.id
						? accessNameMaplist.edit_permission_manage
						: accessNameMaplist.add_permission_manage
				}
				okText='确认操作'
				cancelText='取消'
				onCancel={handleCancel}
				onOk={handleSubmit}>
				<Form
					{...formItemLayoutAll}
					ref={formRef}
					onFinish={onFinish}>
					<FormItem
						label='权限名称'
						name='name'
						rules={[{ required: true, message: '请输入权限名称!' }]}
						initialValue={detail.name}>
						<Input
							placeholder='请输入权限名称'
							maxLength={20}
						/>
					</FormItem>
					<FormItem
						label='权限编码'
						name='code'
						rules={[
							{ required: true, message: '请输入权限编码!' },
							{ max: 50, message: '请不要超过50个字符！' },
						]}
						initialValue={detail.code}>
						<Input
							placeholder='请输入权限编码'
							maxLength={50}
						/>
					</FormItem>
					<FormItem
						label='排序'
						name='sort'
						rules={[{ type: 'number', message: '必须为数字!' }]}
						initialValue={detail.sort}>
						<InputNumber
							min={0}
							max={99999}
							precision={0}
							placeholder='请输入排序方式'
						/>
					</FormItem>
					<FormItem
						label='权限类型'
						name='type'
						rules={[{ required: true, message: '请选择权限类型!' }]}
						initialValue={detail.type}>
						<RadioGroup
							onChange={(item) => {
								setType(item.target.value);
							}}>
							<Radio value='menu'>菜单</Radio>
							<Radio value='function'>功能</Radio>
						</RadioGroup>
					</FormItem>
					<FormItem
						label='上级菜单'
						name='parentId'
						initialValue={detail.parentId}>
						<TreeSelect
							dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
							treeData={data}
							treeDataSimpleMode={false}
							treeNodeFilterProp='title'
							placeholder='请选择上级菜单'
							allowClear
							showSearch
						/>
					</FormItem>
					<FormItem
						label='图标'
						name='icon'
						initialValue={detail.icon}>
						<Input
							placeholder='请输入图标'
							maxLength={50}
						/>
					</FormItem>
					<Form.Item
						noStyle
						shouldUpdate={(prevValues, currentValues) =>
							prevValues.gender !== currentValues.gender
						}>
						{type === 'menu' ? (
							<FormItem
								label='路由'
								{...formItemLayout}
								name='route'
								initialValue={detail.route}>
								<Input
									placeholder='请输入路由'
									maxLength={100}
								/>
							</FormItem>
						) : null}
					</Form.Item>
					<FormItem
						label='备注'
						name='remark'
						initialValue={detail.remark}>
						<Input
							placeholder='最多可输入50个字'
							type='textarea'
							maxLength={50}
						/>
					</FormItem>
				</Form>
			</Modal>
			<Modal
				title='更改排序'
				key={sortBoxVisibleKey}
				visible={sortBoxVisible}
				wrapClassName='vertical-center-modal'
				okText='修改'
				cancelText='取消'
				onCancel={handleCancelEditSort}>
				<Form layout='vertical'>
					<FormItem
						label='序列号'
						rules={[
							{
								type: 'number',
								message: '必须为数字',
							},
						]}
						initialValue={selectedInfo.sort}>
						<InputNumber
							size='large'
							min={1}
							max={99999}
							precision={0}
						/>
					</FormItem>
				</Form>
			</Modal>
		</div>
	);
};
export default App;
