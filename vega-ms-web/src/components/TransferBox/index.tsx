import { Transfer } from 'antd';
import type { TableRowSelection } from 'antd/es/table/interface';
import type { TransferProps } from 'antd/es/transfer';
import { TransferItem } from 'antd/lib/transfer';
import difference from 'lodash/difference';
import { MutableRefObject, useImperativeHandle, useRef } from 'react';
import ProTable, { ProColumns, ProTableProps } from '../ProTable';
import './index.less';
interface TableTransferProps<T extends TransferItem> extends TransferProps<T> {
	dataSource: T[]; // 两边表格数据集合，即所有数据
	leftColumns: ProColumns<T>[];
	rightColumns: ProColumns<T>[];
	itemDisabled?: (item: T) => boolean; // 根据条件是否禁用
	proTableProps?: ProTableProps<T>; // proTable的所有参数
	proTableWidth?: string; //每个表格的宽度
	TransferBoxRef?: MutableRefObject<Transfer<T> | null> | ((actionRef: Transfer<T> | null) => void);
}
const TransferBox = <T extends Record<string, any>>({
	leftColumns,
	rightColumns,
	itemDisabled = (item: T) => false,
	proTableProps = {},
	proTableWidth = '100%',
	TransferBoxRef,
	...restProps
}: TableTransferProps<T>) => {
	const transferRef = useRef<Transfer<T>>(null);
	// 暴露方法
	useImperativeHandle(TransferBoxRef, () => transferRef.current);
	return (
		<div className='transferBox'>
			<Transfer
				{...restProps}
				ref={transferRef}>
				{({
					direction,
					filteredItems,
					onItemSelectAll,
					onItemSelect,
					selectedKeys: listSelectedKeys,
					disabled: listDisabled,
				}) => {
					const columns = direction === 'left' ? leftColumns : rightColumns;
					const rowSelection: TableRowSelection<T> = {
						getCheckboxProps: (item) => ({
							disabled: listDisabled || itemDisabled(item),
						}),
						onSelectAll(selected, selectedRows) {
							const treeSelectedKeys = selectedRows
								.filter((item) => !itemDisabled(item))
								.map(({ key }) => key);
							const diffKeys = selected
								? difference(treeSelectedKeys, listSelectedKeys)
								: difference(listSelectedKeys, treeSelectedKeys);
							onItemSelectAll(diffKeys as string[], selected);
						},
						onSelect({ key }, selected) {
							onItemSelect(key as string, selected);
						},
						selectedRowKeys: listSelectedKeys,
					};
					return (
						<div style={{ width: proTableWidth }}>
							<ProTable<T>
								{...proTableProps}
								rowSelection={rowSelection}
								rowKey={restProps.rowKey}
								columns={columns}
								dataSource={filteredItems}
								style={{ pointerEvents: listDisabled ? 'none' : undefined }}
								onRow={(item) => ({
									onClick: () => {
										if (listDisabled || itemDisabled(item)) return;
										const selected = !listSelectedKeys.includes(item.key as string);
										onItemSelect(item.key as string, selected);
									},
								})}
								tableAlertOptionRender={
									<a
										onClick={() => {
											onItemSelectAll(listSelectedKeys, false);
										}}>
										取消选择
									</a>
								}
							/>
						</div>
					);
				}}
			</Transfer>
		</div>
	);
};

export default TransferBox;
