import type { ProColumns, ProTableAction } from '@/components//ProTable/typings';
import ExportFile from '@/components/ExportFile';
import ProTable from '@/components/ResizableTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import api from '@/constants/api';
import { enabledEnum, enabledStatusTextMap } from '@/constants/dictionary';
import { useGoodsType } from '@/hooks/useGoodsType';
import { batchUnbindDepartmentGoods, searchGoodsList } from '@/services/department';
import { getOrdinary } from '@/services/ordinary';
import { unbindSurgical } from '@/services/ordinaryDepartment';
import { formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import '@ant-design/compatible/assets/index.css';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Form, Popconfirm, Tabs } from 'antd';
import { cloneDeep } from 'lodash';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { connect, useAccess, useModel } from 'umi';
import style from '../index.less';
import AddGoods from './AddGoods';
import AddModal from './AddModal';
import AddPackageOridinary from './AddPackageOridinary';
import BatchAddModal from './BatchAddModal';

const TabPane = Tabs.TabPane;

export interface UpdateProps {
	departmentLevel: boolean;
	departmentName: string;
	departmentId: number;
	batchOpen: boolean;
	setBatchOpen: () => void;
	global: Record<string, any>;
	match: Record<string, any>;
	isClear: boolean;
}

type goodsOrOrdinaryList =
	| DepartmentController.DepartmentGoodsAdd
	| OrdinaryController.OrdinaryList;

const TableList: React.FC<UpdateProps> = ({ global, ...props }) => {
	const { departmentLevel, departmentName, departmentId, setBatchOpen, batchOpen, isClear } = props;
	const access = useAccess();
	const { fields } = useModel('fieldsMapping');
	const [form] = Form.useForm();
	const tableRef = useRef<ProTableAction>();
	const [activeTab, setActiveTab] = useState<string>('goods');
	const [addOpen, setAddOpen] = useState<boolean>(false);
	const [detailInfo, setDetailInfo] = useState({});
	const [handleType, setHandleType] = useState<string>('');
	const [goodsOpen, setGoodsOpen] = useState<boolean>(false);
	const [isExportFile, setIsExportFile] = useState(false);
	const tabsData = useGoodsType();
	const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
	const [selectList, setSelectList] = useState<goodsOrOrdinaryList[]>([]); //已选中的数组
	const [extraHeight, setExtraHeight] = useState(0); // 用于修正table表格的高度

	const handleOpenModal = (type: string, info = {}) => {
		if ((activeTab == 'goods' || activeTab == 'package_ordinary') && type == 'add') {
			setGoodsOpen(true);
		} else {
			setHandleType(type);
			setAddOpen(true);
			setDetailInfo(info);
		}
	};

	const getSearchData = () => {
		return tableRef.current?.getParams() as Record<string, any>;
	};

	const searchColumns: ProFormColumns = [
		{
			title: '状态',
			dataIndex: 'isEnabled',
			valueType: 'radioButton',
			initialValue: '',
			valueEnum: enabledEnum,
			fieldProps: {
				className: 'search-radio-button',
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
		},
	];

	const ordinarySearchColumns: ProFormColumns = [
		{
			title: '状态',
			dataIndex: 'isEnabled',
			valueType: 'radioButton',
			initialValue: '',
			valueEnum: enabledEnum,
			fieldProps: {
				className: 'search-radio-button',
			},
		},
		{
			title: '套包编号/名',
			dataIndex: 'keyword',
		},
	];

	// 列表
	const getFormList = () => {
		tableRef.current?.onReset();
	};

	useEffect(() => {
		clearSelect();
	}, [isClear]);

	const clearSelect = () => {
		setSelectList([]);
		setSelectedRowKeys([]);
	};

	const tabChange = (key: string) => {
		setActiveTab(key);
		form.resetFields();
		getFormList();
		setIsExportFile(false);
		clearSelect();
	};

	// 解绑
	const onUnbind = async (record: any) => {
		let res;
		let params;
		switch (activeTab) {
			case 'goods':
				params = {
					departmentId,
					goodsIds: record ? [record.goodsId] : selectedRowKeys,
				};
				res = await batchUnbindDepartmentGoods(params);
				break;
			case 'package_ordinary':
				params = {
					departmentId,
					ordinaryIds: record ? [record.id] : selectedRowKeys,
				};
				res = await unbindSurgical(params);
				break;
			default:
				break;
		}
		if (res && res.code === 0) {
			notification.success('操作成功');
			getFormList();
			clearSelect();
		}
	};

	// 选择
	const selectRow = (selectData: goodsOrOrdinaryList, status: boolean) => {
		const tabVal = activeTab === 'goods';
		const filed = tabVal ? 'goodsId' : 'id';
		let newSelectList = [...selectList];
		if (status) {
			newSelectList.push(selectData);
		} else {
			newSelectList.map((val, index) => {
				if (String(val[filed]) === String(selectData[filed])) {
					newSelectList.splice(index, 1);
				}
			});
		}
		let newSelectedRowKeys: any = newSelectList.map((item) => item[filed]);

		setSelectList([...newSelectList]);
		setSelectedRowKeys([...newSelectedRowKeys]);
	};

	// 全选过滤
	const selectRowAll = (
		selected: boolean,
		selectedRecords: number[],
		changeRecords: goodsOrOrdinaryList[],
	) => {
		const tabVal = activeTab === 'goods';
		const filed = tabVal ? 'goodsId' : 'id';

		let select = cloneDeep(selectList);
		if (selected) {
			select = select.concat(changeRecords);
			select = select.reduce((item, next: any) => {
				if (!item.includes(next)) {
					return item.concat(next);
				} else {
					return item;
				}
			}, []);
		} else {
			changeRecords.forEach((item) => {
				select = select.filter((el) => el[filed] !== item[filed]);
			});
		}
		const selectedRow: number[] = select.map((item) => item[filed]);
		setSelectedRowKeys(selectedRow);
		setSelectList(select);
	};

	let goodsColumns: ProColumns<DepartmentController.DepartmentGoodsAdd>[] = [
		{
			width: 'L',
			title: fields.goodsCode,
			dataIndex: 'materialCode',
		},
		{
			width: 'L',
			title: fields.goodsName,
			dataIndex: 'goodsName',
		},
		{
			width: 'L',
			title: '通用名',
			dataIndex: 'commonName',
			ellipsis: true,
		},

		{
			width: 'L',
			title: '规格/型号',
			dataIndex: 'specification',
			ellipsis: true,
			render: (_text: ReactNode, record: DepartmentController.DepartmentGoodsAdd) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			width: 'S',
			title: '计价单位',
			dataIndex: 'minGoodsUnitName',
		},
		// {
		// 	width: 'S',
		// 	title: '请领单位',
		// 	dataIndex: 'conversionUnitName',
		// },
		{
			width: 'S',
			title: '转换比',
			dataIndex: 'conversionRate',
		},
		{
			width: 'S',
			title: fields.goodsProperty,
			dataIndex: 'highValue',
			renderText: (text: boolean) => (typeof text === 'boolean' ? (text ? '高值' : '低值') : '-'),
		},
		{
			title: '状态',
			dataIndex: 'isEnabled',
			key: 'isEnabled',
			width: 'XS',
			renderText: (text: boolean) => enabledStatusTextMap[`${text}`],
		},
	];

	let ordinaryColumns: ProColumns<OrdinaryController.OrdinaryList>[] = [
		{
			width: 'L',
			title: '医耗套包编号',
			dataIndex: 'ordinaryCode',
		},
		{
			width: 'L',
			title: '医耗套包名称',
			dataIndex: 'name',
			ellipsis: true,
		},
		{
			width: 'L',
			title: '医耗套包说明',
			dataIndex: 'detailGoodsMessage',
			render: (_text: ReactNode, record: OrdinaryController.OrdinaryList) => {
				const { description, detailGoodsMessage } = record;
				return (
					<div
						className='detailGoodsMessage'
						title={description || detailGoodsMessage}>
						{description || detailGoodsMessage}
					</div>
				);
			},
		},
		{
			width: 'S',
			title: '状态',
			dataIndex: 'menabled',
			renderText: (text: boolean) => enabledStatusTextMap[`${text}`],
		},
	];

	const operation = {
		width: 'XS',
		title: '操作',
		fixed: 'right',
		dataIndex: 'option',
		render: (
			_text: ReactNode,
			record: DepartmentController.DepartmentGoodsAdd & OrdinaryController.OrdinaryList,
		) => {
			return (
				<div className='operation'>
					{activeTab === 'package_ordinary' && record.consumeType === 'push' ? null : activeTab ===
							'package_ordinary' ||
					  (activeTab === 'goods' && record.barcodeControlled) ? (
						<React.Fragment>
							<span
								className='handleLink'
								onClick={() => handleOpenModal('edit', record)}>
								{activeTab === 'package_ordinary' ? '设置自动推送' : '编辑'}
							</span>
							<Divider type='vertical' />
						</React.Fragment>
					) : (
						global.configuration && (
							<React.Fragment>
								<span
									className='handleLink'
									onClick={() => handleOpenModal('edit', record)}>
									{activeTab === 'package_ordinary' ? '设置自动推送' : '编辑'}
								</span>
								<Divider type='vertical' />
							</React.Fragment>
						)
					)}
					<Popconfirm
						placement='left'
						title='确定解绑吗？'
						onConfirm={() => onUnbind(record)}>
						<span className='handleLink'>解绑</span>
					</Popconfirm>
				</div>
			);
		},
	};

	if (access.bind_material) {
		goodsColumns.push(operation as ProColumns<Record<string, any>>);
		ordinaryColumns.push(operation as ProColumns<Record<string, any>>);
	}
	// 修正高度
	useEffect(() => {
		setExtraHeight(
			(document.querySelector('.ant-layout-custom-content-cls')?.clientHeight || 0) -
				(document.querySelector('.antd-pro-pages-base_data-department-list-index-tableWrap')
					?.children[0]?.clientHeight || 0) -
				101,
		);
	}, [
		document.querySelector('.ant-layout-custom-content-cls')?.clientHeight,
		document.querySelector('.antd-pro-pages-base_data-department-list-index-tableWrap')?.children[0]
			?.clientHeight,
	]);
	const ProTableContent = () => {
		const tabVal = activeTab === 'goods';
		const getList = tabVal ? searchGoodsList : getOrdinary;
		const columns = tabVal ? goodsColumns : ordinaryColumns;
		const searchColumn = tabVal ? searchColumns : ordinarySearchColumns;
		return (
			<ProTable<goodsOrOrdinaryList>
				rowKey={tabVal ? 'goodsId' : 'id'}
				api={getList}
				tableInfoCode={tabVal ? 'department_goods_list' : 'department_ordinary_list'}
				columns={columns}
				tableRef={tableRef}
				extraHeight={0 - extraHeight}
				rowSelection={{
					selectedRowKeys: selectedRowKeys,
					onSelect: selectRow,
					onSelectAll: selectRowAll,
				}}
				tableAlertOptionRender={
					<a
						onClick={() => {
							clearSelect();
						}}>
						取消选择
					</a>
				}
				loadConfig={{
					request: false,
				}}
				requestCompleted={(rows) => {
					tabVal && setIsExportFile(rows.length > 0);
				}}
				searchConfig={{
					columns: searchColumn,
				}}
				beforeSearch={(value: Record<string, any>) => {
					const { isEnabled } = value;
					const data = isEnabled
						? {
								isEnabled: isEnabled,
								enabled: isEnabled,
								menabled: isEnabled,
						  }
						: {};

					const params = {
						...value,
						...data,
					};
					return params;
				}}
				params={{ isCombined: false, departmentId, departmentAdd: tabVal ? undefined : false }}
				toolBarRender={() => [
					<Button
						type='primary'
						onClick={() => onUnbind('')}
						className='iconButton'
						disabled={!selectedRowKeys.length}>
						批量解绑
					</Button>,
					access.bind_material && (
						<Button
							icon={<PlusOutlined />}
							type='primary'
							onClick={() => handleOpenModal('add')}
							className='iconButton'>
							添加
						</Button>
					),
					tabVal && access.export_material && (
						<ExportFile
							data={{
								filters: {
									...getSearchData(),
									departmentId,
									goodsDepartmentCombined: false,
								},
								getForm: getSearchData,
								link: api.departments.exportGoods,
							}}
							disabled={!isExportFile}
						/>
					),
				]}
			/>
		);
	};
	return (
		<>
			<div className={style.tableWrap}>
				{departmentLevel ? (
					<div className={style.tableList}>
						<p className={style.title}>{departmentName}</p>
						<p className='fz18 cl_FF110B'>*所选科室为一级科室，不能关联{fields.goods}</p>
					</div>
				) : (
					<Card bordered={false}>
						<div className={style.title}>{departmentName || ''}</div>
						<Tabs
							defaultActiveKey='goods'
							animated={false}
							onChange={tabChange}>
							{tabsData.map((item) => {
								return (
									<TabPane
										tab={item.label}
										key={item.value}>
										{activeTab === item.value && ProTableContent()}
									</TabPane>
								);
							})}
						</Tabs>
					</Card>
				)}
			</div>
			<AddModal
				isOpen={addOpen}
				setIsOpen={setAddOpen}
				getFormList={getFormList}
				departmentId={departmentId}
				activeTab={activeTab}
				handleType={handleType}
				departmentName={departmentName}
				detailInfo={detailInfo}
			/>
			{batchOpen && activeTab !== 'diagonsis_project' && (
				<BatchAddModal
					isOpen={batchOpen}
					setIsOpen={setBatchOpen}
					getFormList={getFormList}
					activeTab={activeTab}
				/>
			)}
			{goodsOpen && activeTab === 'goods' && (
				<AddGoods
					departmentName={departmentName}
					isOpen={goodsOpen}
					departmentId={departmentId}
					setIsOpen={setGoodsOpen}
					getFormList={getFormList}
				/>
			)}
			{goodsOpen && activeTab === 'package_ordinary' && (
				<AddPackageOridinary
					departmentName={departmentName}
					isOpen={goodsOpen}
					departmentId={departmentId}
					setIsOpen={setGoodsOpen}
					getFormList={getFormList}
				/>
			)}
		</>
	);
};

export default connect(({ global }: { global: Record<string, any> }) => ({ global }))(TableList);
