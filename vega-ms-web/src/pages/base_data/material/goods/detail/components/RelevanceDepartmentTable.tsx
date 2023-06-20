import { FC, useState, useContext } from 'react';
import ProTable, { ProColumns } from '@/components/ProTable';
import { Button } from 'antd';
import style from '../index.less';
import { getGoodsDepartmentWithPage } from '@/services/newGoodsTypes';
import { batchUnbindDepartmentGoods } from '@/services/department';
import { Popconfirm } from 'antd';
import { Context } from '../index';

/**
 * @description 关联科室表格组件
 */

const RelevanceDepartmentTable: FC<{ id: number | string }> = ({ id }) => {
	const [showPagination, setShowPagination] = useState(true);

	const contextValue = useContext(Context);

	function requestCompleted(rows: any[], params: Record<string, any>, data: Record<string, any>) {
		if (data.totalCount > 10) {
			setShowPagination(true);
		} else {
			setShowPagination(false);
		}
	}

	// 解除绑定
	async function relieve(departmentId: number) {
		const res = await batchUnbindDepartmentGoods({
			departmentId,
			goodsIds: [Number(id)],
		});
		if (res.code === 0) {
			contextValue?.relevanceDepartmentTableRef?.current?.reload();
		}
	}

	function selectionSelect(record: any, selected: boolean) {
		const { selectList = [], setSelectList } = contextValue;
		if (setSelectList) {
			if (selected) {
				setSelectList([...selectList, record.id]);
			} else {
				setSelectList(selectList.filter((item) => item !== record.id));
			}
		}
	}
	function selectionSelectAll(selected: boolean, selectedRows: any[], changeRows: any[]) {
		const { selectList = [], setSelectList } = contextValue;
		const ids = changeRows.filter((item) => !!item).map((item) => item.id);
		if (setSelectList) {
			if (selected) {
				setSelectList(Array.from(new Set(selectList.concat(ids))));
			} else {
				setSelectList(selectList.filter((item) => !ids.includes(item)));
			}
		}
	}

	const columns: ProColumns<any>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			width: 60,
			align: 'center',
			renderText: (text, record, index) => index + 1,
		},
		{
			title: '科室名称',
			dataIndex: 'name',
			width: 'auto',
		},
		{
			title: '操作',
			dataIndex: 'option',
			width: 120,
			fixed: 'right',
			render: (id, record) => {
				return (
					<Popconfirm
						placement='left'
						title='确定解绑吗？'
						onConfirm={() => relieve(record.id)}>
						<Button
							size='small'
							type='link'>
							解绑
						</Button>
					</Popconfirm>
				);
			},
		},
	];

	return (
		<ProTable<Record<string, any>>
			rowKey={'id'}
			className={style.relevanceTable}
			// headerTitle={'关联科室'}
			tableRef={contextValue.relevanceDepartmentTableRef}
			params={{ goodsId: id }}
			api={getGoodsDepartmentWithPage}
			pagination={
				showPagination
					? {
							defaultPageSize: 10,
							defaultCurrent: 1,
							pageSize: 10,
							size: 'small',
					  }
					: false
			}
			scroll={{
				y: 'auto',
			}}
			rowSelection={{
				selectedRowKeys: contextValue.selectList,
				onSelect: selectionSelect,
				onSelectAll: selectionSelectAll,
			}}
			requestCompleted={requestCompleted}
			columns={columns}
			search={false}
			options={{ density: false, fullScreen: false, setting: false, reload: false }}
		/>
	);
};

export default RelevanceDepartmentTable;
