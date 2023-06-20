import type { FC } from 'react';

import PaginationBox from '@/components/Pagination';
import TableBox from '@/components/TableBox';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { Descriptions, Modal } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import { deanStatisticDetail } from '../service';
import styles from './style.less';

const CheckModal: FC<Record<string, any>> = ({
	departmentType,
	timeFrom,
	timeTo,
	goodsType,
	detailid,
	visible,
	onCancel,
}) => {
	const { fields } = useModel('fieldsMapping');
	const [loading, setLoading] = useState<boolean>(false);
	const [goodsData, setGoodsData] = useState([]);
	const [pageConfig, setPageConfig] = useState({ pageNum: 0, pageSize: 50 });
	const [total, setTotal] = useState(0);
	const getDetail = async (pams?: any) => {
		let res = await deanStatisticDetail({
			departmentId: detailid.departmentId || 0,
			departmentType,
			timeFrom,
			timeTo,
			goodsType: detailid.goodsType,
			msType: detailid.goodsType == 'Inspection_materials' ? 'other' : detailid.msType,
			...pageConfig,
			...pams,
		});
		if (res && res.code === 0) {
			setGoodsData(res.data.rows || []);
			setPageConfig({ pageNum: res.data.pageNum, pageSize: res.data.pageSize });
			setTotal(res.data.totalCount);
		}
		setLoading(false);
	};
	useEffect(() => {
		if (detailid.departmentId || detailid.departmentId == 0) {
			setLoading(true);
			getDetail();
		}
	}, [detailid]);
	const goodsColumns = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			render: (text: any, redord: any, index: number) => <span>{index + 1}</span>,
			width: 60,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 150,
			render: (text: any) => {
				return text ? text : '-';
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 180,
			render: (text: any) => {
				return text ? text : '-';
			},
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			width: 150,
			ellipsis: true,
			render: (text: any, record: Record<string, any>) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '消耗数量',
			dataIndex: 'consumeNum',
			key: 'consumeNum',
			width: 180,
			render: (text: any) => {
				return text ? text : '-';
			},
		},
		{
			title: '消耗金额(元)',
			dataIndex: 'consumePrice',
			key: 'consumePrice',
			width: 180,
			render: (text: string | number | undefined) => {
				return text ? convertPriceWithDecimal(text) : '-';
			},
		},
		{
			title: '消耗同比',
			dataIndex: 'consumeYear',
			key: 'consumeYear',
			width: 180,
			render: (text: any, record: { consumeYear: number }) => {
				return record.consumeYear || record.consumeYear == 0
					? (record.consumeYear * 100).toFixed(2) + '%'
					: '-';
			},
		},
		{
			title: '消耗环比',
			dataIndex: 'consumeMonth',
			key: 'consumeMonth',
			width: 180,
			render: (text: any, record: { consumeMonth: number }) => {
				return record.consumeMonth || record.consumeMonth == 0
					? (record.consumeMonth * 100).toFixed(2) + '%'
					: '-';
			},
		},
		{
			title: '结算数量',
			dataIndex: 'statementNum',
			key: 'statementNum',
			width: 180,
			render: (text: any) => {
				return text ? text : '-';
			},
		},
		{
			title: '结算金额(元)',
			dataIndex: 'statementPrice',
			key: 'statementPrice',
			width: 180,
			render: (text: string | number | undefined) => {
				return text ? convertPriceWithDecimal(text) : '-';
			},
		},
		{
			title: '结算同比',
			dataIndex: 'statementYear',
			key: 'statementYear',
			width: 180,
			render: (text: any, record: { statementYear: number }) => {
				return record.statementYear || record.statementYear == 0
					? (record.statementYear * 100).toFixed(2) + '%'
					: '-';
			},
		},
		{
			title: '结算环比',
			dataIndex: 'statementMonth',
			key: 'statementMonth',
			width: 180,
			render: (text: any, record: { statementMonth: number }) => {
				return record.statementMonth || record.statementMonth == 0
					? (record.statementMonth * 100).toFixed(2) + '%'
					: '-';
			},
		},
	];

	return (
		<div>
			<Modal
				visible={visible}
				width={'80%'}
				maskClosable={false}
				title='报表详情'
				onCancel={onCancel}
				footer={false}>
				<div>
					<div style={{ display: 'flex', width: '100%' }}>
						<div style={{ flex: 'auto' }}>
							<Descriptions
								className={styles.headerList}
								size='small'>
								<Descriptions.Item label='科室类型'>
									{departmentType == 'operating_room'
										? '手术科室'
										: departmentType == 'Medical_technology'
										? '医技科室'
										: departmentType == 'administration'
										? '行政科室'
										: departmentType == 'non-surgical_department'
										? '非手术科室'
										: departmentType == 'all'
										? '全院'
										: '-'}
								</Descriptions.Item>
								<Descriptions.Item label='科室名称'>
									{detailid.departmentName || '-'}
								</Descriptions.Item>
								<Descriptions.Item label='结算周期'>
									{moment(timeFrom).format('YYYY/MM/DD') +
										'~' +
										moment(timeTo).format('YYYY/MM/DD')}
								</Descriptions.Item>
								<Descriptions.Item label={fields.goodsType}>
									{detailid.goodsType == 'Consumable_materials'
										? '消耗材料'
										: detailid.goodsType == 'Inspection_materials'
										? '检验材料'
										: detailid.goodsType == 'Other_materials'
										? '其他材料'
										: detailid.goodsType == 'Disinfection_material'
										? '消毒材料'
										: detailid.goodsType == 'all'
										? '全部'
										: '-'}
								</Descriptions.Item>
								<Descriptions.Item label='耗材类型'>
									{detailid.msType == 'fsf' ? '非收费' : detailid.msType == 'sf' ? '收费' : '-'}
								</Descriptions.Item>
							</Descriptions>
						</div>
					</div>
					<div>
						<TableBox
							loading={loading}
							size='middle'
							pagination={false}
							columns={goodsColumns}
							dataSource={goodsData}
							options={{ density: false, fullScreen: false, setting: false }}
							scroll={{ x: '100%', y: 300 }}
							tableInfoId='105'
						/>
					</div>
					{total > 0 && (
						<PaginationBox
							data={{ total, ...pageConfig }}
							pageChange={(pageNum: number, pageSize: number) => getDetail({ pageNum, pageSize })}
						/>
					)}
				</div>
			</Modal>
		</div>
	);
};
export default CheckModal;
