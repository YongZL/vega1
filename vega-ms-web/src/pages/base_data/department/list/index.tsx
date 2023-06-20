import Breadcrumb from '@/components/Breadcrumb';
import { useDepartmentList } from '@/hooks/useDepartmentList';
import { getTreeData } from '@/services/department';
import { genTreeData } from '@/utils/dataUtil';
import { EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Select, Tree } from 'antd';

import searchLogo from '@/assets/images/search.svg';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { connect, history, useAccess } from 'umi';
import TableList, { UpdateProps } from './components/TableList';
import style from './index.less';
const List: React.FC<UpdateProps> = ({ global, ...props }) => {
	const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
	const [expandedKeys, setExpandedKeys] = useState<string[]>([]); // 指定树节点
	const [selectedKeys, setSelectedKeys] = useState<string[]>([]); // 选中数据
	const [departmentLevel, setDepartmentLevel] = useState(false); // tree末端是否为一级科室
	const [selectedDepartmentId, setSelectedDepartmentId] = useState<number>(); // 选中的科室id
	const [selectedDepartmentName, setSelectedDepartmentName] = useState<string | undefined>(''); // 选中的科室name
	const [treeData, setTreeData] = useState<DepartmentController.TreeList>([]); // 树数据
	const [batchOpen, setBatchOpen] = useState<boolean>(false);
	const [isClear, setIsClear] = useState<number>(0);
	const access = useAccess();

	const departmentList = useDepartmentList();

	// 搜索科室
	const depSearch = (val: DepartmentController.TreeSearch) => {
		const key = [String(val.key)];
		setSelectedDepartmentId(val.value);
		setSelectedDepartmentName(val.label);
		setExpandedKeys([...key]);
		setSelectedKeys([...key]);
		setAutoExpandParent(true);
	};

	const onExpand = (keys: any) => {
		setExpandedKeys(keys);
		setAutoExpandParent(false);
	};

	// 选择科室
	const onSelectDepartment = (selectedKeys: any[], e: any) => {
		setIsClear(isClear + 1);

		// 首先根据是否展开判断是进行展开操作还是查询具体科室基础物资数据
		if (e.node.props.expanded && e.node.props.children) {
			const keys = expandedKeys.filter((item) => item !== e.node.props.eventKey);
			setExpandedKeys(keys);
			setAutoExpandParent(false);
		} else {
			// 当点击选项包含children时，说明科室包含子科室，只做展开或折叠操作
			if (e.node.props.children) {
				// 当点击项未展开时，添加当前点击项到已展开中，否则将点击选项从已展开中移除
				let keys;
				if (!e.node.props.expanded) {
					keys = [e.node.props.eventKey];
				} else {
					keys = expandedKeys.filter((item: any) => item !== e.node.props.eventKey);
				}
				setExpandedKeys(keys);
				setAutoExpandParent(true);
			} else {
				let posList = e.node.props.pos.split('-');
				if (posList.length <= 2) {
					// 点击的子级是一级科室，显示提示
					const item = treeData.filter((item: any) => item.key == e.node.props.eventKey);
					setDepartmentLevel(false);
					setSelectedDepartmentName(item[0].children[0].title);
					setSelectedDepartmentId(item[0].children[0].key);
					let expandedKey = expandedKeys;
					if (expandedKey.indexOf(item[0].key + '') === -1) {
						expandedKey.push(item[0].key + '');
						setTimeout(() => {
							setSelectedKeys([item[0].children[0].key + '']);
						}, 200);
					} else {
						expandedKey.splice(expandedKey.indexOf(item[0].key + ''), 1);
						setTimeout(() => {
							setSelectedKeys([]);
						}, 200);
					}
					setExpandedKeys([...expandedKey]);
					setAutoExpandParent(true);
				} else {
					// 点击选项是子级科室，可直接查询科室基础物资数据
					setSelectedDepartmentId(e.node.props.eventKey);
					setSelectedDepartmentName(e.node.props.title.props.children[2]);
					setDepartmentLevel(false);
				}
			}
		}

		setSelectedKeys(selectedKeys);
	};

	// newElement是要追加的元素 targetElement 是指定元素的位置
	const insertAfter = (newElement: any, targetElement: any) => {
		let parent = targetElement;
		// 如果目标元素是<span class='ant-tree-title'>title</span>的话就加到该元素的父元素
		if (targetElement.getAttribute('class') === 'ant-tree-title') {
			parent = targetElement.parentNode;
		}
		parent.appendChild(newElement, targetElement);
	};

	const onMouseLeave = (info: any) => {
		const oldSpan = document.getElementById('newSpan');
		setTimeout(() => {
			oldSpan?.parentNode?.removeChild(oldSpan);
		}, 2000);
	};
	// 鼠标移过显示
	const onMouseEnter = (info: any) => {
		// // 移入一级科室不追加编辑查看
		// let posList = info.node.props.pos.split('-');
		// if (posList.length <= 2) {
		//   return;
		// }
		const oldSpan = document.getElementById('newSpan');
		if (oldSpan) {
			// 删除已添加
			oldSpan.parentNode?.removeChild(oldSpan);
		}
		const cmContainer = document.createElement('span');
		cmContainer.id = 'newSpan';
		const toolTip = (
			<span className={style.operatorWrap}>
				{access.department_view && (
					<EyeOutlined
						title='查看'
						className={style.operateIcon}
						onClick={() => history.push(`/base_data/department/detail/${info.node.props.eventKey}`)}
					/>
				)}
				{access.edit_department && (
					<EditOutlined
						title='编辑'
						className={style.operateIcon}
						onClick={() => history.push(`/base_data/department/edit/${info.node.props.eventKey}`)}
					/>
				)}
			</span>
		);
		insertAfter(cmContainer, info.event.target);
		ReactDOM.render(toolTip, cmContainer);
	};

	// 获取树数据
	const getDepartmentsTreeData = async () => {
		const res = await getTreeData();
		if (res && res.code === 0) {
			let treeData = genTreeData(res.data);
			if (treeData === undefined || treeData.length === 0) {
				treeData = [];
			}
			let treeLevel = 0;
			function getChildDepartment(treeData: DepartmentController.TreeList): any {
				let filteredTreeData = treeData.filter(
					(item: any) => item.children && item.children.length > 0,
				);
				if (!filteredTreeData.length && treeLevel === 0) {
					return [undefined, undefined, undefined];
				} else if (!filteredTreeData.length && treeLevel !== 0) {
					return [[String(treeData[0]['key'])], treeData[0]['key'], treeData[0]['title']];
				} else {
					treeLevel += 1;
					return getChildDepartment(filteredTreeData[0]['children']);
				}
			}
			const [expandedKeys, selectedDepartmentId, selectedDepartmentName] =
				getChildDepartment(treeData);

			setTreeData(treeData);
			setExpandedKeys(expandedKeys);
			setSelectedDepartmentId(selectedDepartmentId);
			setSelectedDepartmentName(selectedDepartmentName);
		}
	};

	useEffect(() => {
		getDepartmentsTreeData();
	}, []);

	const loop = (record: DepartmentController.TreeList) =>
		record.map((item) => {
			const index = item.title.search('');
			const beforeStr = item.title.substr(0, index);
			const afterStr = item.title.substr(index);
			const title =
				index > -1 ? (
					<span>
						{beforeStr}
						<span style={{ color: CONFIG_LESS['@c_EF394F'] }}>{''}</span>
						{afterStr}
					</span>
				) : (
					<span tabIndex={item.key}>{item.title}</span>
				);
			if (item.children && item.children.length) {
				return (
					<Tree.TreeNode
						key={item.key}
						title={title}>
						{loop(item.children)}
					</Tree.TreeNode>
				);
			}
			return (
				<Tree.TreeNode
					key={item.key}
					title={title}
				/>
			);
		});

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
				<div style={{ textAlign: 'right', height: 8, borderTop: '1px solid #D9D9D9' }}>
					{access.bind_material && (
						<Button
							style={{
								display: 'inline-block',
								width: 100,
								padding: 0,
								position: 'relative',
								top: -36,
							}}
							icon={<PlusOutlined />}
							type='primary'
							onClick={() => setBatchOpen(true)}>
							批量绑定
						</Button>
					)}
				</div>
			</div>
			<Card bordered={false}>
				<div className={style.departmentWrap}>
					<div className='flex'>
						<div style={{ width: 200, padding: '0 8px' }}>
							<div
								className={style.tree}
								style={{ height: global.scrollY + 248 }}>
								<Select
									labelInValue
									showSearch
									// filterOption={(input, option: any) =>
									//   option.props.children
									//     .toLowerCase()
									//     .indexOf(transformSBCtoDBC(input).toLowerCase()) >= 0
									// }
									filterOption={(input, option: any) =>
										option.key.toLowerCase().indexOf(input.toLowerCase()) >= 0
									}
									onSelect={depSearch}
									getPopupContainer={(node) => node.parentNode}
									placeholder='搜索科室'
									style={{ width: '100%', marginBottom: '8px' }}
									suffixIcon={
										<img
											src={searchLogo}
											style={{ width: '20px', height: '20px' }}
										/>
									}>
									{departmentList.map((el: any) => {
										return (
											// <Select.Option value={el.id} key={el.id}>
											//   {el.name}
											// </Select.Option>
											<Select.Option
												value={el.id}
												key={(el.nameAcronym || '') + '' + el.name}>
												{el.name}
											</Select.Option>
										);
									})}
								</Select>
								{access.add_department && (
									<Button
										icon={<PlusOutlined />}
										type='primary'
										className='mb1xiao5'
										style={{ width: '100%' }}
										onClick={() => {
											history.push(`${props?.match.url}/add`);
										}}>
										新增科室
									</Button>
								)}
								{treeData?.length ? (
									<Tree
										className='draggable-tree'
										onExpand={onExpand}
										selectedKeys={selectedKeys}
										expandedKeys={expandedKeys}
										autoExpandParent={autoExpandParent}
										onSelect={onSelectDepartment}
										onMouseEnter={onMouseEnter}
										onMouseLeave={onMouseLeave}>
										{loop(treeData)}
									</Tree>
								) : (
									''
								)}
							</div>
						</div>

						<div
							style={{
								borderRight: `1px solid ${CONFIG_LESS['@bd_D9D9D9']}`,
								backgroundColor: CONFIG_LESS['@c_starus_warning'],
							}}
						/>

						{selectedDepartmentId && (
							<TableList
								departmentLevel={departmentLevel}
								departmentName={selectedDepartmentName}
								departmentId={selectedDepartmentId}
								batchOpen={batchOpen}
								setBatchOpen={setBatchOpen}
								isClear={isClear}
							/>
						)}
					</div>
				</div>
			</Card>
		</div>
	);
};

export default connect(({ global }: { global: Record<string, any> }) => ({ global }))(List);
