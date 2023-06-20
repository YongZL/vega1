import type { ModalMaxType } from './typings';
import type { ModalProps } from 'antd';
import { FC, useEffect, useState } from 'react';
import { Descriptions, Modal, Statistic } from 'antd';
import styles from './style.less';
import ProTable from '@/components/ProTable';

const ModalMax: FC<ModalMaxType & ModalProps> = ({
	detail,
	tableData,
	tableTitle,
	columns,
	descriptionsColumns,
	rightColumns,
	...props
}) => {
	const [ratio, setRatio] = useState({ leftWidth: '80%', column: 4, rightWidth: '20%' }); //左右等份比例(默认5等份)
	useEffect(() => {
		if (rightColumns.length > 2) {
			setRatio({ leftWidth: '75%', column: 3, rightWidth: '25%' }); //当右侧大于2项时，整体分成4等份
		}
	}, [rightColumns.length]);
	return (
		<Modal
			{...props}
			maskClosable={props.maskClosable ?? true}
			className='ant-detail-modal'>
			<div className={styles.detailWrap}>
				<div
					className={styles.left}
					style={{ width: ratio.leftWidth }}>
					<Descriptions
						className={styles.headerList}
						size='small'
						column={ratio.column}>
						{descriptionsColumns.map((item) => (
							<Descriptions.Item label={item.label}>{detail[item.key]}</Descriptions.Item>
						))}
					</Descriptions>
				</div>
				<div
					className={styles.right}
					style={{ width: ratio.rightWidth }}>
					{rightColumns.map((item) => (
						<div className={styles.moreInfo}>
							<Statistic
								title={item.title}
								value={item.value}
							/>
						</div>
					))}
				</div>
			</div>
			{tableData.length > 0 && (
				<ProTable<Record<string, any>>
					headerTitle={tableTitle}
					pagination={false}
					columns={columns}
					dataSource={tableData}
					scroll={{
						y: 300,
					}}
					options={{ density: false, fullScreen: false, setting: false }}
				/>
			)}
		</Modal>
	);
};
export default ModalMax;
