import { Card, Button } from 'antd';
import React, { useState, useEffect } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import { UploadOutlined } from '@ant-design/icons';
import TableBox from '@/components/TableBox';
import PaginationBox from '@/components/Pagination';
import FormSearch from './formSearch';
import { connect, history, Link } from 'umi';
import { cloneDeep } from 'lodash';
import UploadModal from './modal/invoice_upload';

import { getSalesList, getWaybillList } from './service';
import { billColumns, salesColumns } from './columns';

const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');

const PickingList: React.FC<{}> = ({ global }) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [list, setList] = useState([]);
	const [searchParams, setSearchParams] = useState({});
	const [total, setTotal] = useState(0);
	const [pageConfig, setPageConfig] = useState({ pageNum: 0, pageSize: 50 });
	const [activeTab, setActiveTab] = useState('sales');
	const [selectedKeys, setSelectedKeys] = useState([]);
	const [selectedList, setSelectedList] = useState([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [isFirst, setIsFirst] = useState(true);
	const [selectSupplier, setSelectSupplier] = useState('');

	// 请求列表
	const getFormList = async (param: any) => {
		const params = {
			...pageConfig,
			...searchParams,
			...param,
		};
		setLoading(true);
		const query = activeTab === 'waybill' ? getWaybillList : getSalesList;
		const res = await query(params);
		if (res && res.code === 0) {
			setList(res.data.rows);
			setTotal(res.data.totalCount);
			setPageConfig({ pageNum: res.data.pageNum, pageSize: res.data.pageSize });
		}
		setLoading(false);
	};

	// 查询参数变化后更新列表
	useEffect(() => {
		if (!isFirst) {
			getFormList({});
		}
	}, [searchParams, activeTab, isFirst]);

	// 更新查询表单
	const searchTabeList = (value: Object) => {
		setSearchParams({ ...value });
		setIsFirst(false);
	};
	// 排序
	const handleChangeTable = (pagination: any, filter: any, sorter: any) => {
		const params = {
			sortList:
				sorter.order == null
					? undefined
					: [{ desc: sorter.order === 'descend', sortName: sorter.columnKey }],
		};
		getFormList({ ...params });
	};

	// 选择
	const selectRow = async (record: any, status: boolean) => {
		const key =
			activeTab === 'waybill' ? record.goodsItemId : `${record.goodsItemId}${record.statementId}`;
		let selectedRowKeys = cloneDeep(selectedKeys);
		let submitList = cloneDeep(selectedList);

		if (status) {
			selectedRowKeys.push(key);
			submitList.push(record);
		} else {
			selectedRowKeys = selectedRowKeys.filter((item) => item !== key);
			submitList = submitList.filter(
				(item) =>
					(activeTab === 'waybill'
						? item.goodsItemId
						: `${item.goodsItemId}${item.statementId}`) !== key,
			);
		}
		submitList.length > 0 ? setSelectSupplier(submitList[0].supplierName) : setSelectSupplier('');
		setSelectedKeys(selectedRowKeys);
		setSelectedList(submitList);
	};

	// 单行点击选中
	const selectRowOfClick = (record: any) => {
		if (selectSupplier && record.supplierName !== selectSupplier) {
			return;
		}
		const key =
			activeTab === 'waybill' ? record.goodsItemId : `${record.goodsItemId}${record.statementId}`;
		if (selectedKeys.includes(key)) {
			selectRow(record, false);
		} else {
			selectRow(record, true);
		}
	};

	// 全选过滤
	const selectRowAll = (status: boolean, selectedRows: any, changeRows: any) => {
		let selectedRowKeys = cloneDeep(selectedKeys);
		let submitList = cloneDeep(selectedList);
		if (status) {
			changeRows.forEach((itemSelect: any) => {
				if (
					!selectedRowKeys.some(
						(item) =>
							item ===
							(activeTab === 'waybill'
								? itemSelect.goodsItemId
								: `${itemSelect.goodsItemId}${itemSelect.statementId}`),
					)
				) {
					activeTab === 'waybill'
						? selectedRowKeys.push(itemSelect.goodsItemId)
						: selectedRowKeys.push(`${itemSelect.goodsItemId}${itemSelect.statementId}`);
					submitList.push(itemSelect);
				}
			});
		} else {
			changeRows.forEach((itemSelect: any) => {
				selectedRowKeys = selectedRowKeys.filter(
					(item) =>
						item !==
						(activeTab === 'waybill'
							? itemSelect.goodsItemId
							: `${itemSelect.goodsItemId}${itemSelect.statementId}`),
				);
				activeTab === 'waybill'
					? (submitList = submitList.filter(
							(item: any) => item.goodsItemId !== itemSelect.goodsItemId,
					  ))
					: (submitList = submitList.filter(
							(item: any) =>
								`${item.goodsItemId}${item.statementId}` !==
								`${itemSelect.goodsItemId}${itemSelect.statementId}`,
					  ));
			});
		}

		submitList.length > 0 ? setSelectSupplier(submitList[0].supplierName) : setSelectSupplier('');
		setSelectedKeys(selectedRowKeys);
		setSelectedList(submitList);
	};

	const updateList = () => {
		setSelectSupplier('');
		setSearchParams({});
		setSelectedKeys([]);
		setSelectedList([]);
	};

	const tabList = [
		{
			key: 'waybill',
			name: '货票同行',
			columns: billColumns(),
			tableInfoId: '62',
		},
		{
			key: 'sales',
			name: '销后结算',
			columns: salesColumns(),
			tableInfoId: '63',
		},
	];
	const rowSelection = {
		selectedRowKeys: selectedKeys,
		onSelect: selectRow,
		onSelectAll: selectRowAll,
		// getCheckboxProps: (record) => ({
		//   disabled: selectSupplier && record.supplierName !== selectSupplier,
		// }),
	};
	return (
		<div>
			<div className='flex flex-between'>
				<Breadcrumb config={['', '']} />
				{permissions.includes('do_commit_invoice_manual') && (
					<Button
						icon={<UploadOutlined />}
						type='primary'
						ghost
						onClick={() => {
							history.push('/finance/make_invoice_list/invoice_modify');
						}}>
						上传红冲票
					</Button>
				)}
			</div>
			<Card bordered={false}>
				{/* <Tabs activeKey={activeTab} onChange={(key) => {
          setActiveTab(key)
          updateList()
        }}>
          {tabList.map(itemTab => {
            return <TabPane key={itemTab.key} tab={itemTab.name}>
              <FormSearch searchTabeList={searchTabeList} activeTab={activeTab} />
              <TableBox
                headerTitle="待开票列表"
                toolBarRender={() => [
                  (itemTab.key == 'waybill' && permissions.includes('do_commit_invoice_sync') ||
                    itemTab.key == 'sales' && permissions.includes('do_commit_invoice_state')) && (
                    <Button icon={<UploadOutlined />}
                      type="primary"
                      disabled={selectedKeys.length <= 0}
                      onClick={() => setModalVisible(true)}>
                      上传发票
                    </Button>
                  )
                ]}
                tableInfoId={itemTab.tableInfoId}
                options={{
                  reload: () => getFormList({}),
                }}
                rowSelection={rowSelection}
                rowKey={(record, index) => itemTab.key === 'waybill' ? record.goodsItemId : `${record.goodsItemId}${record.statementId}`}
                scroll={{
                  x: '100%',
                  y: global.scrollY - 30,
                }}
                onRow={(record) => ({
                  onClick: () => {
                    selectRowOfClick(record);
                  },
                })}
                onChange={handleChangeTable}
                dataSource={list}
                loading={loading}
                columns={itemTab.columns}
              />
            </TabPane>
          })}
        </Tabs>
        */}

				<FormSearch
					searchTabeList={searchTabeList}
					activeTab={activeTab}
					isFirst={() => setIsFirst(false)}
				/>
				<TableBox
					isFirst={isFirst}
					headerTitle='待开票列表'
					toolBarRender={() => [
						permissions.includes('do_commit_invoice_state') && (
							<Button
								icon={<UploadOutlined style={{ marginLeft: -4 }} />}
								type='primary'
								disabled={selectedKeys.length <= 0}
								onClick={() => setModalVisible(true)}
								className='iconButton'>
								上传发票
							</Button>
						),
					]}
					tableInfoId='63'
					options={{
						reload: () => getFormList({}),
					}}
					rowSelection={rowSelection}
					rowKey={(record, index) =>
						activeTab === 'waybill'
							? record.goodsItemId
							: `${record.goodsItemId}${record.statementId}`
					}
					scroll={{
						x: '100%',
						y: global.scrollY - 30,
					}}
					onRow={(record) => ({
						onClick: () => {
							selectRowOfClick(record);
						},
					})}
					onChange={handleChangeTable}
					dataSource={list}
					loading={loading}
					columns={salesColumns()}
					tableAlertOptionRender={
						<a
							onClick={() => {
								setSelectedKeys([]);
								setSelectedList([]);
							}}>
							取消选择
						</a>
					}
				/>
				{total > 0 && (
					<PaginationBox
						data={{ total, ...pageConfig }}
						pageChange={(pageNum: number, pageSize: number) => getFormList({ pageNum, pageSize })}
					/>
				)}
			</Card>
			<UploadModal
				visible={modalVisible}
				setVisible={setModalVisible}
				list={selectedList}
				updateList={updateList}
				activeTab={activeTab}
			/>
		</div>
	);
};

export default connect(({ global }) => ({ global }))(PickingList);
