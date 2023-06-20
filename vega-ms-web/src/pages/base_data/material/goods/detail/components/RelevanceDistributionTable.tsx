import { FC, useState } from 'react';
import ProTable, { ProColumns } from '@/components/ProTable';
import { useModel } from 'umi';
import style from '../index.less';
import { getGoodsDistributorWithPage } from '@/services/newGoodsTypes';
import { Tooltip } from 'antd';

/**
 * @description 关联配送商业表格组件
 */

const RelevanceDistributionTable: FC<{ id: number | string }> = ({ id }) => {
	const { fields } = useModel('fieldsMapping');

	const [showPagination, setShowPagination] = useState(true);

	function requestCompleted(rows: any[], params: Record<string, any>, data: Record<string, any>) {
		if (data.totalCount > 10) {
			setShowPagination(true);
		} else {
			setShowPagination(false);
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
			title: '厂家授权',
			dataIndex: 'distributorName',
			width: 'auto',
		},
		{
			title: '授权配送商业',
			dataIndex: 'authorizingDistributorNameList',
			width: 'auto',
			ellipsis: true,
			render: (_text, record) => {
				const { authorizingDistributorNameList } = record;
				const len = authorizingDistributorNameList.length;
				const title = authorizingDistributorNameList.map((item: any, index: number) => {
					return <div>{`${item}`}</div>;
				});
				return len ? (
					<span>
						<Tooltip
							placement='topLeft'
							title={title}>
							{authorizingDistributorNameList.join(';')}
						</Tooltip>
					</span>
				) : (
					'-'
				);
			},
		},
	];

	return (
		<ProTable<Record<string, any>>
			rowKey={'id'}
			className={style.relevanceTable}
			// headerTitle={`关联${fields.distributor}`}
			params={{ goodsId: id }}
			api={getGoodsDistributorWithPage}
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
			requestCompleted={requestCompleted}
			columns={columns}
			search={false}
			options={{ density: false, fullScreen: false, setting: false, reload: false }}
		/>
	);
};

export default RelevanceDistributionTable;
