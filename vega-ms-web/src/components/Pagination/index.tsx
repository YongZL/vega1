import type { FC } from 'react';

import { Pagination } from 'antd';

import style from './index.less';

const PaginationBox: FC<{
	data: {
		total?: number;
		pageNum?: number;
		pageSize?: number;
		showSizeChanger?: boolean;
	};
	pageChange?: (pageNum: number, pageSize: number) => void;
}> = ({ data, pageChange }) => {
	const options = ['10', '20', '50', '100'];
	const { total, pageNum, pageSize, showSizeChanger = true } = data;
	const onChange = (num: number, size: number) => {
		if (typeof pageChange === 'function') {
			pageChange(num - 1, size);
		}
	};
	return (
		<div className={style.paginationBox}>
			<div>共 {total} 条</div>
			<Pagination
				showSizeChanger={showSizeChanger}
				showQuickJumper
				pageSizeOptions={options}
				total={total}
				current={pageNum + 1}
				pageSize={pageSize}
				onChange={onChange}
				// onShowSizeChange={pageChange}
				size='small'
			/>
		</div>
	);
};

export default PaginationBox;
