import Descriptions, { DescriptionsItemProps } from '@/components/Descriptions';
import ProTable, { ProColumns } from '@/components/ProTable';
import { queryDetail } from '@/services/acceptance';
import { DealDate } from '@/utils/DealDate';
import { Badge, Col, Modal, Row, Statistic } from 'antd';
import { FC, useEffect, useState } from 'react';
import { useModel } from 'umi';
import styles from './style.less';
import { accessNameMap } from '@/utils';
import { formatStrConnect } from '@/utils/format';

const approvaStatus = {
	pending: { text: '未验收', color: CONFIG_LESS['@c_starus_await'] },
	receiving: { text: '验收中', color: CONFIG_LESS['@c_starus_await'] },
	partial_pass: { text: '部分通过', color: CONFIG_LESS['@c_starus_underway'] },
	all_pass: { text: '验收通过', color: CONFIG_LESS['@c_starus_done'] },
	all_reject: { text: '验收不通过', color: CONFIG_LESS['@c_starus_warning'] },
};

type Detail = AcceptanceController.AllDetail;
type DataItem = AcceptanceController.DataItem;

const CheckModal: FC<AcceptanceController.Props> = ({ visible, detail, onCancel = () => {} }) => {
	const { fields } = useModel('fieldsMapping');
	const [loading, setLoading] = useState<boolean>(false);
	const [details, setDetails] = useState<AcceptanceController.AcceptanceDetail>();
	const [goodsData, setGoodsData] = useState<Detail[]>([]);
	// const [bulksData, setBulksData] = useState([]);
	const [ordinaryData, setOrdinaryData] = useState<Detail[]>([]);
	// const [surgicalsData, setSurgicalsData] = useState([]);
	const accessNameMaplist: Record<string, any> = accessNameMap();
	useEffect(() => {
		const getDetail = async (id: number) => {
			let details = await queryDetail({
				acceptanceOrderId: id,
			});
			if (details.code === 0) {
				setDetails(details.data);
				setGoodsData(details.data.acceptanceGoodsDetail || []);
				// setBulksData(details.data.acceptancePackageBulkDetail || []);
				// 获取后端传过来的医耗套包信息的数组
				setOrdinaryData(details.data.acceptanceOrdinaryDetail || []);
				// setSurgicalsData(details.data.acceptancePackageSurgicalDetail || []);
			}
			setLoading(false);
		};
		if (visible && detail.id) {
			setLoading(true);
			getDetail(detail.id);
		}
	}, [visible, detail]);

	const options: DescriptionsItemProps<DataItem>[] = [
		{
			label: '验收单号',
			dataIndex: 'code',
		},
		{
			label: '科室',
			dataIndex: 'departmentName',
		},
	];

	const goodsColumns: ProColumns<Detail>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			width: 'XXXS',
			render: (text, recoed, index) => index + 1,
		},
		{
			title: '状态',
			dataIndex: 'status',
			width: 'XS',
			render: (text: any) => {
				let statusText, statusColor;
				switch (text) {
					case true:
						statusText = '验收通过';
						statusColor = CONFIG_LESS['@c_starus_done'];
						break;
					case false:
						statusText = '验收不通过';
						statusColor = CONFIG_LESS['@c_starus_warning'];
						break;
					default:
						statusText = '未验收';
						statusColor = CONFIG_LESS['@c_starus_await'];
						break;
				}
				return (
					<Badge
						color={statusColor}
						text={statusText}
					/>
				);
			},
		},
		{
			title: `${fields.goods}条码/编码/UDI`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 'XXL',
			ellipsis: true,
			renderText: (text, record) => {
				const { isBarcodeControlled, printed, udiCode } = record;
				if (isBarcodeControlled) {
					return printed ? text : udiCode;
				} else {
					return text;
				}
			},
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			width: 'XL',
			ellipsis: true,
		},
		{
			title: '通用名',
			dataIndex: 'commonName',
			key: 'commonName',
			width: 'XS',
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			width: 'L',
			ellipsis: true,
			renderText: (text: string, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 'L',
			ellipsis: true,
		},
		{
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 'S',
			renderText: (text: string, record) => `${text || '-'}/${record.serialNo || '-'}`,
		},
		{
			title: '生产日期',
			dataIndex: 'productionDate',
			key: 'productionDate',
			width: 'S',
			renderText: (text) => DealDate(text),
		},
		{
			title: '灭菌日期',
			dataIndex: 'sterilizationDate',
			key: 'sterilizationDate',
			width: 'S',
			renderText: (text) => DealDate(text),
		},
		{
			title: '有效期至',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width: 'S',
			renderText: (text) => DealDate(text),
		},
		{
			title: '本单数',
			dataIndex: 'quantity_unit',
			key: 'quantity_unit',
			width: 'XXS',
			render: (text, record) => {
				return (
					<span>
						{record.quantity}
						{record.packageBulkUnit || record.unit}
					</span>
				);
			},
		},
		{
			title: '验收不通过原因',
			dataIndex: 'acceptanceConclusion',
			key: 'acceptanceConclusion',
			width: 'L',
			ellipsis: true,
			render: (text) => text || '-',
		},
		{
			title: '是否需要补货',
			dataIndex: 'needToReplenish',
			key: 'needToReplenish',
			width: 'S',
			render: (text, record) => {
				return record.status == false ? (text ? '是' : '否') : '-';
			},
		},
	];
	// const columnsBulks = [
	//   {
	//     title: '序号',
	//     dataIndex: 'index',
	//     key: 'index',
	//     align: 'center',
	//     width: 60,
	//     render: (text, recoed, index) => index + 1,
	//   },
	//   {
	//     title: '状态',
	//     dataIndex: 'status',
	//     width: 100,
	//     render: (text: any) => {
	//       let statusText, statusColor;
	//       switch (text) {
	//         case true:
	//           statusText = '验收通过';
	//           statusColor = CONFIG_LESS['@c_starus_done'];
	//           break;
	//         case false:
	//           statusText = '验收不通过';
	//           statusColor = CONFIG_LESS['@c_starus_warning'];
	//           break;
	//         default:
	//           statusText = '未验收';
	//           statusColor = CONFIG_LESS['@c_starus_await'];
	//           break;
	//       }
	//       return <Badge color={statusColor} text={statusText} />;
	//     },
	//   },
	//   {
	//     title: `${fields.goods}条码`,
	//     dataIndex: 'operatorBarcode',
	//     key: 'operatorBarcode',
	//     width: 150,
	//   },
	//   {
	//     title: '定数包名称',
	//     dataIndex: 'packageBulkName',
	//     width: 150,
	//     ellipsis: true,
	//   },
	//   {
	//     title: fields.goodsName,
	//     dataIndex: 'goodsName',
	//     key: 'goodsName',
	//     width: 150,
	//     ellipsis: true,
	//   },
	//   {
	//     title: '通用名',
	//     dataIndex: 'commonName',
	//     key: 'commonName',
	//     width: 100,
	//     ellipsis: true,
	//   },
	//   {
	//     title: '规格/型号',
	//     dataIndex: 'specification',
	//     key: 'specification',
	//     width: 150,
	//     ellipsis: true,
	//     render: (text, record) => {
	//       const info = `${record.specification || ''} ${(record.specification && record.model && '/') || ''
	//         } ${record.model || ''}`;
	//       return <span>{info}</span>;
	//     },
	//   },
	//   {
	//     title: '包装数',
	//     dataIndex: 'packageBulkUnitNum',
	//     key: 'packageBulkUnitNum',
	//     align: 'center',
	//     width: 80,
	//     render: (text, record) => {
	//       return <span>{text + record.unit + '/' + record.packageBulkUnit}</span>;
	//     },
	//   },
	//   {
	//     title: '本单数',
	//     dataIndex: 'quantity_unit',
	//     key: 'quantity_unit',
	//     width: 80,
	//     render: (text, record) => {
	//       return (
	//         <span>
	//           {record.quantity}
	//           {record.packageBulkUnit ? record.packageBulkUnit : record.unit}
	//         </span>
	//       );
	//     },
	//   },
	//   {
	//     title: '验收不通过原因',
	//     dataIndex: 'acceptanceConclusion',
	//     key: 'acceptanceConclusion',
	//     width: 150,
	//     ellipsis: true,
	//     render: (text) => {
	//       return <span>{text ? text : '-'}</span>;
	//     },
	//   },
	//   {
	//     title: '是否需要补货',
	//     dataIndex: 'needToReplenish',
	//     key: 'needToReplenish',
	//     width: 120,
	//     render: (text, record) => {
	//       return record.status == false ? (text ? '是' : '否') : '-';
	//     },
	//   },
	// ];
	const columnsOrdinary: ProColumns<Detail>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			width: 'XXXS',
			render: (text, recoed, index) => index + 1,
		},
		{
			title: '状态',
			dataIndex: 'status',
			width: 'XS',
			render: (text: any) => {
				let statusText, statusColor;
				switch (text) {
					case true:
						statusText = '验收通过';
						statusColor = CONFIG_LESS['@c_starus_done'];
						break;
					case false:
						statusText = '验收不通过';
						statusColor = CONFIG_LESS['@c_starus_warning'];
						break;
					default:
						statusText = '未验收';
						statusColor = CONFIG_LESS['@c_starus_await'];
						break;
				}
				return (
					<Badge
						color={statusColor}
						text={statusText}
					/>
				);
			},
		},
		{
			title: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 'L',
		},
		{
			title: '医耗套包名称',
			dataIndex: 'ordinaryName',
			width: 'XL',
			ellipsis: true,
		},
		{
			title: '医耗套包说明',
			dataIndex: 'detailGoodsMessage',
			width: 'L',
			render: (text, record) => {
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
			title: '本单数',
			dataIndex: 'quantity_unit',
			key: 'quantity_unit',
			width: 'XXS',
			render: (text, record) => {
				return (
					<span>
						{record.quantity}
						{record.packageBulkUnit || record.unit}
					</span>
				);
			},
		},
		{
			title: '验收不通过原因',
			dataIndex: 'acceptanceConclusion',
			key: 'acceptanceConclusion',
			width: 'L',
			ellipsis: true,
			render: (text) => {
				return <span>{text ? text : '-'}</span>;
			},
		},
		{
			title: '是否需要补货',
			dataIndex: 'needToReplenish',
			key: 'needToReplenish',
			width: 'S',
			render: (text, record) => {
				return record.status == false ? (text ? '是' : '否') : '-';
			},
		},
	];
	return (
		<div>
			<Modal
				visible={visible}
				width={'80%'}
				maskClosable={false}
				title={accessNameMaplist.warehouse_queries_detail}
				onCancel={onCancel}
				className='ant-detail-modal'
				footer={false}>
				<Row className='detailsBorder five'>
					<Col className='left'>
						<Descriptions<DataItem>
							options={options}
							data={details || ({} as DataItem)}
							optionEmptyText={'-'}
						/>
					</Col>
					<Col className='right'>
						<Statistic
							title='当前状态'
							value={details?.status ? approvaStatus[details?.status].text : ''}
						/>
					</Col>
				</Row>
				<div>
					<div>
						{goodsData.length > 0 && (
							<ProTable<Detail>
								headerTitle={<h3>{fields.baseGoods}</h3>}
								size='middle'
								pagination={false}
								columns={goodsColumns}
								dataSource={goodsData}
								options={{ density: false, fullScreen: false, setting: false }}
								scroll={{ y: 300 }}
								loading={loading}
							/>
						)}
						{/* {bulksData.length > 0 && (
              <TableBox
                headerTitle={<h3>定数包</h3>}
                size="middle"
                pagination={false}
                columns={columnsBulks}
                dataSource={bulksData}
                options={{ density: false, fullScreen: false, setting: false }}
                scroll={{ x: '100%', y: 300 }}
                loading={loading}
                tableInfoId="223"
              />
            )} */}
						{/* 判断存贮医耗套包的状态里有没有数据若是由则证明是医耗套包  采用这里的表格 */}
						{ordinaryData.length > 0 && (
							<ProTable<Detail>
								headerTitle={<h3 className={styles.detailTableTitle}>医耗套包</h3>}
								size='middle'
								pagination={false}
								columns={columnsOrdinary}
								dataSource={ordinaryData}
								scroll={{
									y: 300,
								}}
								options={{ density: false, fullScreen: false, setting: false }}
							/>
						)}
					</div>
				</div>
			</Modal>
		</div>
	);
};
export default CheckModal;
