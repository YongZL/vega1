import Descriptions from '@/components/Descriptions';
import type { DescriptionsItemProps } from '@/components/Descriptions/typings';
import TableBox from '@/components/TableBox';
import { Col, Modal, Row } from 'antd';
import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import { queryRecordDetails } from './service';
import { accessNameMap } from '@/utils';
import { formatStrConnect } from '@/utils/format';

interface DataItem {
	materialCode: string;
	operatorBarcode: string;
	packageName: string;
	departmentName: string;
	warehouseName: string;
	timeCreated: string;
	operatorName: string;
}
const Detail = ({ ...props }) => {
	const [list, setList] = useState([]);
	const { fields } = useModel('fieldsMapping');
	const { modalVisible, setModalVisible, detailInfo } = props;
	const accessNameMaplist: Record<string, any> = accessNameMap();
	useEffect(() => {
		const { operatorBarcode } = detailInfo;
		const getList = async () => {
			let res = await queryRecordDetails({ operatorBarcode });
			if (res && res.code == 0) {
				setList(res.data);
			}
		};
		getList();
	}, []);

	const modalColumns = [
		{
			title: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 180,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 240,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			render: (text: string, record: { specification: string; model: string }) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 120,
			renderText: (text: string, record: { serialNum: string }) => (
				<span>{`${text || '-'}/${record.serialNum || '-'}`}</span>
			),
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 100,
		},
		{
			title: fields.distributor,
			dataIndex: 'distributorName',
			key: 'distributorName',
			width: 180,
		},
	];

	const modal = {
		visible: modalVisible,
		title: accessNameMaplist.unpack_record_detail,
		onCancel: () => {
			setModalVisible(false);
		},
		width: '80%',
		footer: null,
		maskClosable: false,
	};

	const options: DescriptionsItemProps<DataItem>[] = [
		{
			label: fields.goodsCode,
			dataIndex: 'materialCode',
		},
		{
			label: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
		},
		{
			label: '套包名称',
			dataIndex: 'packageName',
		},
		{
			label: '科室',
			dataIndex: 'departmentName',
		},
		{
			label: '仓库',
			dataIndex: 'warehouseName',
		},
		{
			label: '操作时间',
			dataIndex: 'timeCreated',
		},
		{
			label: '操作人',
			dataIndex: 'operatorName',
		},
	];

	return (
		<div>
			<Modal
				{...modal}
				className='ant-detail-modal'>
				<Row className='detailsBorderAndMargin four'>
					<Col className='left'>
						<Descriptions<DataItem>
							options={options}
							data={detailInfo}
							defaultColumn={4}
						/>
					</Col>
				</Row>
				<TableBox
					columns={modalColumns}
					rowKey='id'
					dataSource={list}
					pagination={false}
					options={{ density: false, fullScreen: false, setting: false }}
					scroll={{ x: '100%', y: 300 }}
					tableInfoId='194'
				/>
			</Modal>
		</div>
	);
};

export default Detail;
