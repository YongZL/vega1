import Descriptions, { DescriptionsItemProps } from '@/components/Descriptions';
import ProTable, { ProColumns } from '@/components/ProTable';
import ScanInput from '@/components/ScanInput';
import {
	queryCheck,
	queryCheckOneItem,
	queryDetail,
	querySubmitOrder,
	queryUncheck,
} from '@/services/acceptance';
import { transformSBCtoDBC } from '@/utils';
import { DealDate } from '@/utils/DealDate';
import { formatToGS1, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { ScanOutlined } from '@ant-design/icons';
import { Badge, Button, Modal, Statistic } from 'antd';
import React, { FC, FormEvent, useEffect, useState } from 'react';
import { useModel } from 'umi';
import styles from '../cheack/style.less';
import ApproveModal from './sureReviewModal';

const approvaStatus = {
	pending: { text: '未验收', color: CONFIG_LESS['@c_starus_await'] },
	receiving: { text: '验收中', color: CONFIG_LESS['@c_starus_await'] },
	partial_pass: { text: '部分通过', color: CONFIG_LESS['@c_starus_underway'] },
	all_pass: { text: '验收通过', color: CONFIG_LESS['@c_starus_done'] },
	all_reject: { text: '验收不通过', color: CONFIG_LESS['@c_starus_warning'] },
};

interface Props {
	visible?: boolean;
	onCancel?: () => void;
	detail: { id?: number };
	getTabeList: () => void;
}

type Detail = AcceptanceController.AllDetail;
type DataItem = AcceptanceController.DataItem;

interface Config {
	<T>(value: T): T;
}

const CheckModal: FC<Props> = ({ visible, detail, onCancel = () => {}, getTabeList }) => {
	const { fields } = useModel('fieldsMapping');
	const [loading, setLoading] = useState<boolean>(false);
	const [approveVisible, setApproveVisible] = useState<boolean>(false);
	const [details, setDetails] = useState<Record<string, any>>({});
	const [goodsData, setGoodsData] = useState<Detail[]>([]);
	// const [bulksData, setBulksData] = useState([]);
	// const [surgicalsData, setSurgicalsData] = useState([]);
	const [ordinaryData, setOrdinaryData] = useState<Detail[]>([]);
	const [scanValue, setScanValue] = useState<string>('');
	const [selectedGoodsRowKeys, setSelectedGoodsRowKeys] = useState<number[]>([]);
	// const [selectedBulksRowKeys, setSelectedBulksRowKeys] = useState([]);
	const [selectedordinaryRowKeys, setSelectedOrdinaryRowKeys] = useState<number[]>([]);
	// const [selectedSurgicalsRowKeys, setSelectedSurgicalsRowKeys] = useState([]);
	const [goodsId, setGoodsId] = useState<number>();
	const [idList, setIdList] = useState<Record<string, any>>();
	const [visiblesm, setVisiblesm] = useState<boolean>(false);
	const [quantity, setQuantity] = useState<string>('');
	const [sumtparams, setSumtparams] = useState({});

	const handleCancel = () => {
		setGoodsId(0);
		setApproveVisible(false);
	};
	const getDetail = async (id?: number) => {
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
	const scanChange = (value: string) => {
		setScanValue(value);
	};
	// 扫码提交
	const scanSubmit = async (valueInput: FormEvent<HTMLInputElement> | string) => {
		if (!valueInput) {
			return;
		}
		valueInput = transformSBCtoDBC(valueInput);
		let gs1Code =
			(valueInput as string).indexOf('_') > -1 ? valueInput : formatToGS1(valueInput as string);
		let params = {
			code: gs1Code,
			acceptanceOrderId: detail.id,
		};
		checkDelivery(params);
		setSumtparams(params);
	};
	// 扫码验收
	const checkDelivery = async (params: object) => {
		let res = await queryCheckOneItem(params);
		if (res && res.code === 0) {
			if (res.data && res.data.length > 0) {
				setVisiblesm(true);
				setQuantity(res.data);
			} else {
				setVisiblesm(false);
				setSelectedGoodsRowKeys([]);
				// setSelectedBulksRowKeys([]);
				setSelectedOrdinaryRowKeys([]);
				getDetail(detail.id);
				notification.success('验收成功');
				setScanValue('');
			}
		}
	};
	const modalSubmit = async () => {
		setLoading(true);
		let res = await querySubmitOrder({ id: detail.id });
		if (res && res.code === 0) {
			notification.success('操作成功');
			// getDetail(detail.id);
			getTabeList();
			onCancel();
		}
		setLoading(false);
	};
	useEffect(() => {
		if (visible && detail.id) {
			setLoading(true);
			getDetail(detail.id);
			setScanValue('');
		}
	}, [visible, detail]);

	// 撤回
	const unCheck = async (record: Detail) => {
		let params = {
			acceptanceOrderId: detail.id,
			id: record.id,
			idList: record.idList,
		};
		let res = await queryUncheck(params);
		if (res && res.code === 0) {
			notification.success('操作成功！');
			getDetail(detail.id);
		}
	};

	// 验收弹窗
	const buttonCheck = (record: Record<string, any>) => {
		let goodsId = record ? record.id : '';
		setGoodsId(goodsId);
		setIdList(record);
		setApproveVisible(true);
	};

	// 验收
	const goodsAcceptSubmit = async (values: AcceptanceController.AcceptanceResult) => {
		let params;
		if (goodsId) {
			// 单个验收
			params = {
				id: detail.id,
				items: [
					{
						id: goodsId,
						idList: idList?.idList,
						inspectorId: values.acceptance,
						status: values.auditType == 'Y',
						acceptanceConclusion: values.auditType == 'Y' ? '' : values.acceptanceConclusion,
						needToReplenish: values.needToReplenish,
					},
				],
			};
		} else {
			// 批量验收
			let array = [...goodsData, ...ordinaryData];
			let item: AcceptanceController.Item = [];
			let idListn: number[] | undefined = [];
			[...selectedGoodsRowKeys, ...selectedordinaryRowKeys].forEach((val) => {
				array.map((item) => {
					if (item.id == val) {
						idListn = item.idList;
					}
				});
				item.push({
					id: val,
					idList: idListn,
					inspectorId: values.acceptance,
					status: values.auditType == 'Y',
					acceptanceConclusion: values.auditType == 'Y' ? '' : values.acceptanceConclusion,
					needToReplenish: values.needToReplenish,
				});
			});
			params = {
				id: detail.id,
				items: item,
			};
		}
		setLoading(true);
		let res = await queryCheck(params);
		if (res && res.code === 0) {
			notification.success('操作成功！');
			getDetail(detail.id);
			setApproveVisible(false);
			setScanValue('');
			setSelectedGoodsRowKeys([]);
			// setSelectedBulksRowKeys([]);
			setSelectedOrdinaryRowKeys([]);
			setLoading(false);
		}
	};
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
			title: `${fields.goods}条码/编码`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 'L',
			ellipsis: true,
			render: (text: any) => <div onClick={(e) => e.stopPropagation()}>{text}</div>,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			width: 'XL',
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 'L',
			renderText: (text: string, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 'S',
			ellipsis: true,
		},
		{
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 'S',
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
			title: '本单数 ',
			dataIndex: 'quantity_unit',
			key: 'quantity_unit',
			width: 'XXS',
			render: (text, record) => {
				return (
					<span>
						{record.quantity}
						{record.packageBulkUnit ? record.packageBulkUnit : record.unit}
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
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			width: 'XXXS',
			fixed: 'right',
			render: (text, record) => {
				return (
					<div className='operation'>
						{record.status == null ? (
							<span
								className='handleLink'
								onClick={(e) => {
									e.stopPropagation();
									buttonCheck(record);
								}}>
								验收
							</span>
						) : (
							<span
								className='handleLink'
								onClick={(e) => {
									e.stopPropagation();
									unCheck(record);
								}}>
								撤回
							</span>
						)}
					</div>
				);
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
	//     title: `${fields.goods}条码/编码`,
	//     dataIndex: 'operatorBarcode',
	//     key: 'operatorBarcode',
	//     width: 150,
	//     render: (text: any) => (
	//       <div
	//         onClick={(e) => {
	//           e.stopPropagation();
	//         }}
	//       >
	//         {text}
	//       </div>
	//     ),
	//   },
	//   {
	//     title: '定数包名称',
	//     dataIndex: 'packageBulkName',
	//     width: 180,
	//     ellipsis: true,
	//   },
	//   {
	//     title: fields.goodsName,
	//     dataIndex: 'goodsName',
	//     key: 'goodsName',
	//     width: 180,
	//     ellipsis: true,
	//   },
	//   {
	//     title: '规格/型号',
	//     dataIndex: 'specification',
	//     key: 'specification',
	//     ellipsis: true,
	//     width: 150,
	//     render: (text: any, record: any) => {
	//       let info = `${record.specification || ''} ${
	//         (record.specification && record.model && '/') || ''
	//       } ${record.model || ''}`;
	//       return <span>{info}</span>;
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
	//   {
	//     title: '操作',
	//     dataIndex: 'option',
	//     key: 'option',
	//     width: 62,
	//     fixed: 'right',
	//     render: (text, record) => {
	//       return (
	//         <div className="operation">
	//           {record.status == null ? (
	//             <span
	//               className="handleLink"
	//               onClick={(e) => {
	//                 e.stopPropagation();
	//                 buttonCheck(record);
	//               }}
	//             >
	//               验收
	//             </span>
	//           ) : (
	//             <span
	//               className="handleLink"
	//               onClick={(e) => {
	//                 e.stopPropagation();
	//                 unCheck(record);
	//               }}
	//             >
	//               撤回
	//             </span>
	//           )}
	//         </div>
	//       );
	//     },
	//   },
	// ];
	// const columnsSurgicals = [
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
	//     title: `${fields.goods}条码/编码`,
	//     dataIndex: 'operatorBarcode',
	//     key: 'operatorBarcode',
	//     width: 150,
	//     render: (text: any) => (
	//       <div
	//         onClick={(e) => {
	//           e.stopPropagation();
	//         }}
	//       >
	//         {text}
	//       </div>
	//     ),
	//   },
	//   {
	//     title: '套包名称',
	//     dataIndex: 'packageSurgicalName',
	//     width: 180,
	//     ellipsis: true,
	//   },
	//   {
	//     title: '套包描述',
	//     dataIndex: 'detailGoodsMessage',
	//     ellipsis: true,
	//     width: 150,
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
	//   {
	//     title: '操作',
	//     dataIndex: 'option',
	//     key: 'option',
	//     width: 62,
	//     fixed: 'right',
	//     render: (text, record) => {
	//       return (
	//         <div className="operation">
	//           {record.status == null ? (
	//             <span
	//               className="handleLink"
	//               onClick={(e) => {
	//                 e.stopPropagation();
	//                 buttonCheck(record);
	//               }}
	//             >
	//               验收
	//             </span>
	//           ) : (
	//             <span
	//               className="handleLink"
	//               onClick={(e) => {
	//                 e.stopPropagation();
	//                 unCheck(record);
	//               }}
	//             >
	//               撤回
	//             </span>
	//           )}
	//         </div>
	//       );
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
			title: `${fields.goods}条码/编码`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 'L',
			render: (text: any) => (
				<div
					onClick={(e) => {
						e.stopPropagation();
					}}>
					{text}
				</div>
			),
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
						title={description ? description : detailGoodsMessage}>
						{description ? description : detailGoodsMessage}{' '}
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
						{record.packageBulkUnit ? record.packageBulkUnit : record.unit}
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
			renderText: (text) => text || '-',
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
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			width: 'XXXS',
			fixed: 'right',
			render: (text, record) => {
				return (
					<div className='operation'>
						{record.status == null ? (
							<span
								className='handleLink'
								onClick={(e) => {
									e.stopPropagation();
									buttonCheck(record);
								}}>
								验收
							</span>
						) : (
							<span
								className='handleLink'
								onClick={(e) => {
									e.stopPropagation();
									unCheck(record);
								}}>
								撤回
							</span>
						)}
					</div>
				);
			},
		},
	];

	// const changeRowbulks = (val) => {
	//   setSelectedBulksRowKeys(val);
	// };
	// const changeRowsurgicals = (val) => {
	//   setSelectedOrdinaryRowKeys(val);
	// };
	const changeRowordinary = (val: React.Key[]) => {
		setSelectedOrdinaryRowKeys(val as number[]);
	};

	const selectRowOfClick = (id: number, status: string | boolean) => {
		if (status !== null) {
			return;
		}
		let oldSelectRowKeys = [...selectedGoodsRowKeys];
		if (oldSelectRowKeys.indexOf(id) >= 0) {
			oldSelectRowKeys = oldSelectRowKeys.filter((item) => item != id);
		} else {
			oldSelectRowKeys.push(id);
		}
		setSelectedGoodsRowKeys(oldSelectRowKeys);
	};
	// const selectRowOfBulkClick = (id, status) => {
	//   if (status !== null) {
	//     return;
	//   }
	//   let oldSelectRowKeys = [...selectedBulksRowKeys];
	//   if (oldSelectRowKeys.indexOf(id) >= 0) {
	//     oldSelectRowKeys = oldSelectRowKeys.filter((item) => item != id);
	//   } else {
	//     oldSelectRowKeys.push(id);
	//   }
	//   setSelectedBulksRowKeys(oldSelectRowKeys);
	// };
	const selectRowOrdinaryClick = (id: number, status: string | undefined | boolean) => {
		if (status !== null) {
			return;
		}
		let oldSelectRowKeys = [...selectedordinaryRowKeys];
		if (oldSelectRowKeys.indexOf(id) >= 0) {
			oldSelectRowKeys = oldSelectRowKeys.filter((item) => item != id);
		} else {
			oldSelectRowKeys.push(id);
		}
		setSelectedOrdinaryRowKeys(oldSelectRowKeys);
	};

	// const bulksRowSelection = {
	//   selectedRowKeys: selectedBulksRowKeys,
	//   onChange: changeRowbulks,
	//   getCheckboxProps: (record) => ({
	//     disabled: record.status !== null,
	//   }),
	// };
	// const surgicalsRowSelection = {
	//   selectedRowKeys: selectedordinaryRowKeys,
	//   onChange: changeRowsurgicals,
	//   getCheckboxProps: (record) => ({
	//     disabled: record.status !== null,
	//   }),
	// };

	const handleOk = () => {
		checkDelivery({ ...sumtparams, mergeCheck: true });
	};

	const onCloseModal = () => {
		setVisiblesm(false);
	};

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

	return (
		<div>
			<Modal
				visible={visible}
				width={'80%'}
				maskClosable={false}
				title='推送单验收'
				onCancel={onCancel}
				footer={[
					<Button
						key='back'
						type='primary'
						loading={loading}
						disabled={selectedGoodsRowKeys.length == 0 && selectedordinaryRowKeys.length == 0}
						onClick={buttonCheck}>
						批量操作
					</Button>,
					<Button
						key='submit'
						type='primary'
						loading={loading}
						onClick={modalSubmit}>
						提交
					</Button>,
				]}>
				{approveVisible && (
					<ApproveModal
						visible={approveVisible}
						handleCancel={handleCancel}
						submit={goodsAcceptSubmit}
						loading={loading}
					/>
				)}
				<div>
					<div style={{ display: 'flex', width: '100%' }}>
						<div style={{ flex: 'auto' }}>
							<Descriptions<DataItem>
								options={options}
								data={details as DataItem}
								optionEmptyText={'-'}
							/>
						</div>
						<div style={{ minWidth: '142px', marginLeft: '44px', textAlign: 'right' }}>
							<div className={styles.moreInfo}>
								<Statistic
									title='当前状态'
									value={details.status ? approvaStatus[details.status].text : ''}
								/>
							</div>
						</div>
					</div>
					<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
						<div style={{ width: '200px' }}>
							<ScanInput
								value={scanValue}
								placeholder='点击此处扫码'
								onSubmit={scanSubmit}
								onPressEnter={scanSubmit}
								onChange={scanChange}
								autoFocus={true}
								suffix={<ScanOutlined />}
							/>
						</div>
					</div>
					<div>
						{goodsData.length > 0 && (
							<ProTable
								headerTitle={<h3>{fields.baseGoods}</h3>}
								size='middle'
								rowKey='id'
								pagination={false}
								rowSelection={{
									selectedRowKeys: selectedGoodsRowKeys,
									onChange: (val: React.Key[]) => setSelectedGoodsRowKeys(val as number[]),
									getCheckboxProps: (record: Detail) => ({
										disabled: record.status !== null,
									}),
									columnWidth: 50,
								}}
								columns={goodsColumns}
								dataSource={goodsData}
								onRow={(record) => ({
									onClick: () => {
										selectRowOfClick(record.id, record.status);
									},
								})}
								options={{ density: false, fullScreen: false, setting: false }}
								scroll={{ x: '100%', y: 300 }}
								tableAlertOptionRender={
									<a
										onClick={() => {
											setSelectedGoodsRowKeys([]);
										}}>
										取消选择
									</a>
								}
							/>
						)}
						{/* {bulksData.length > 0 && (
              <TableBox
                headerTitle={<h3>定数包</h3>}
                size="middle"
                rowKey="id"
                rowSelection={bulksRowSelection}
                pagination={false}
                columns={columnsBulks}
                dataSource={bulksData}
                onRow={(record) => ({
                  onClick: () => {
                    selectRowOfBulkClick(record.id, record.status);
                  },
                })}
                options={{ density: false, fullScreen: false, setting: false }}
                scroll={{ x: '100%', y: 300 }}
                tableInfoId="223"
                tableAlertOptionRender={
                  <a
                    onClick={() => {
                      setSelectedBulksRowKeys([]);
                    }}
                  >
                    取消选择
                  </a>
                }
              />
            )} */}
						{/* {surgicalsData.length > 0 && (
              <TableBox
                headerTitle={<h3>手术套包</h3>}
                size="middle"
                rowKey="id"
                pagination={false}
                rowSelection={surgicalsRowSelection}
                columns={columnsSurgicals}
                dataSource={surgicalsData}
                onRow={(record) => ({
                  onClick: () => {
                    selectRowOfSurgicaClick(record.id, record.status);
                  },
                })}
                options={{density:false,fullScreen:false,setting:false} }
                scroll={{ x:'100%', y: 300}}
                tableInfoId="224"
              />
            )} */}
						{/* 判断存贮医耗套包的状态里有没有数据若是由则证明是医耗套包  采用这里的表格 */}
						{ordinaryData.length > 0 && (
							<ProTable
								headerTitle={<h3>医耗套包</h3>}
								size='middle'
								pagination={false}
								rowSelection={{
									selectedRowKeys: selectedordinaryRowKeys,
									onChange: changeRowordinary,
									getCheckboxProps: (record: Detail) => ({
										disabled: record.status !== null,
									}),
								}}
								columns={columnsOrdinary}
								dataSource={ordinaryData}
								rowKey='id'
								scroll={{
									x: '100%',
									y: 300,
								}}
								onRow={(record) => ({
									onClick: () => {
										selectRowOrdinaryClick(record.id, record.status);
									},
								})}
								options={{ density: false, fullScreen: false, setting: false }}
								tableAlertOptionRender={
									<a
										onClick={() => {
											setSelectedOrdinaryRowKeys([]);
										}}>
										取消选择
									</a>
								}
							/>
						)}
					</div>
				</div>
			</Modal>
			<Modal
				visible={visiblesm}
				title='提示'
				onOk={handleOk}
				maskClosable={false}
				onCancel={onCloseModal}
				footer={[
					<Button
						key='back'
						onClick={onCloseModal}>
						取消
					</Button>,
					<Button
						type='primary'
						onClick={handleOk}>
						确定
					</Button>,
				]}>
				该扫描{fields.goods}已与其他同批号{fields.goods}合并，本单数共计 {quantity}
				份，是否全部确认验收？
			</Modal>
		</div>
	);
};
export default CheckModal;
