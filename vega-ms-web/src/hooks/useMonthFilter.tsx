/**
 * 日期选择器 (这是之前的UI，现在改了，暂时保留，防止后面又改回来)
 */
import React, { useState, useMemo } from 'react';
import moment from 'moment';
import { Select } from 'antd';
import { DownOutlined } from '@ant-design/icons';

import { genNumList } from '@/utils';

import styles from './style/monthFilter.less';

const currentYear = moment().year();
const currentMonth = moment().month() + 1;

// 医院的创建日期
const createdDate = sessionStorage.getItem('hospital_created_date');
const createdYear = moment(Number(createdDate)).year();
const createdMonth = moment(Number(createdDate)).month() + 1;

const getTime = (year, month) => {
	return new Date(`${year}/${month}/1`).getTime();
};

const useMonthFilter = () => {
	const [selectedYear, setSelectedYear] = useState(currentYear);
	const [selectedMonth, setSelectedMonth] = useState(currentMonth);
	const [time, setTime] = useState(getTime(currentYear, currentMonth));

	const years = useMemo(() => genNumList(createdYear, currentYear), []);
	const months = useMemo(() => genNumList(1, 12), []);

	const handleYearChange = (year: React.SetStateAction<number>) => {
		// 这里要有个判断逻辑，如果上一个UI状态是2017年12月，然后点击年份选择器，选择了2019年，那么如果月份也要随之改变到当前月而不是依然选中12月份
		if (year === currentYear && selectedMonth > currentMonth) {
			setSelectedMonth(currentMonth);
		}
		setSelectedYear(year);
		setTime(getTime(year, selectedMonth));
	};

	const handleMonthChange = (month) => {
		setSelectedMonth(month);
		setTime(getTime(selectedYear, month));
	};

	const UI = () => {
		// const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
		return (
			<div className={styles['month-filter']}>
				<div className={styles.left}>
					<span className={styles.text}>查看数据</span>
					<Select
						className={styles.monthSelect}
						getPopupContainer={(node) => node.parentNode}
						defaultValue={currentYear}
						style={{ width: 80, backgroundColor: CONFIG_LESS['@bgc_table'], border: 'none' }}
						dropdownStyle={{
							border: `1px solid ${CONFIG_LESS['@bd_D9D9D9']}`,
							borderRadius: 6,
							backgroundColor: CONFIG_LESS['@bgc_table'],
							width: 80,
							fontSize: 16,
							fontWeight: 600,
							marginLeft: -10,
						}}
						onChange={handleYearChange}
						value={selectedYear}
						suffixIcon={
							<DownOutlined
								style={{ fontSize: 16, color: CONFIG_LESS['@btn_special'], fontWeight: 'bold' }}
							/>
						}>
						{years.map((year) => (
							<Select.Option
								value={year}
								key={year}>
								{year}
							</Select.Option>
						))}
					</Select>
				</div>
				<div className={styles.mid}>
					{months.map((m) => {
						// 删除线
						const isDelete = createdYear === selectedYear && m < createdMonth;
						// 隐藏
						const isDisabled = currentYear === selectedYear && m > currentMonth;
						// 选中
						const isSelected = m === selectedMonth;

						return !isDisabled ? (
							<div
								className={`${styles['month-tag']} ${isSelected && styles['month-tag--selected']} ${
									isDelete && styles['month-tag--delete']
								}`}
								key={m}
								onClick={() => !isDelete && !isDisabled && handleMonthChange(m)}>
								<span className={styles.text}>{String(m).padStart(2, '0') + '月'}</span>
								<div className={styles.line} />
							</div>
						) : (
							<div key={m} />
						);
					})}
				</div>
			</div>
		);
	};

	return {
		FilterUI: UI,
		selectedYear,
		selectedMonth,
		time,
	};
};

export default useMonthFilter;
