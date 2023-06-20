// import type { FC } from 'react';
import type { Moment, MomentFormatSpecification } from 'moment';
import type { RangeValue } from 'rc-picker/es/interface';
import type { DateRangeWithTagProps, OptionProps } from './typings';

import { DatePicker, Space, Tag } from 'antd';
import classNames from 'classnames';
import moment from 'moment';
import { createRef, useCallback, useEffect, useState } from 'react';

import './dateRange.less';

const { CheckableTag } = Tag;
const dateFmt = ['YYYY-MM-DD', 'YYYY/MM/DD'];
/**
 *
 * @param {string} type 类型，year、month、day、
 * @param {number} count 时间记数
 */
function getDateTime({
	type = 'day',
	count = 0,
}: {
	type?: string;
	count?: number;
}): [string, string] {
	const date = new Date();
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const initDate = [year, month, type === 'month' && !count ? 1 : day].join('/');
	let dateList = [];
	switch (type) {
		case 'year':
			dateList = [year + count, month, day];
			break;
		case 'month':
			const dateTime = moment(date)[count > 0 ? 'add' : 'subtract'](Math.abs(count), 'month');
			dateList = [dateTime.year(), dateTime.month() + 1, dateTime.date()];
			break;
		case 'day':
		default:
			const dayTime = moment(date)[count > 0 ? 'add' : 'subtract'](Math.abs(count), 'day');
			dateList = [dayTime.year(), dayTime.month() + 1, dayTime.date()];
	}
	const calcDate = dateList.join('/');
	return [
		!count ? initDate : count < 0 ? calcDate : initDate,
		!count ? calcDate : count > 0 ? calcDate : initDate,
	];
}

const DateRangeWithTag = (props: DateRangeWithTagProps) => {
	const {
		onChange,
		options,
		className,
		style,
		format = dateFmt,
		value: currentValue,
		defaultValue,
		labelWidth = 0,
		defaultTagValue = '',
		...rest
	} = props;
	const [dateWidth, setDateWidth] = useState<number>(0);
	const [value, setValue] = useState<RangeValue<Moment>>();
	const [checkedIndex, setCheckedIndex] = useState<number | null>(null);
	const elRef = createRef<HTMLDivElement>();

	useEffect(() => {
		setValue((currentValue || defaultValue || []) as unknown as RangeValue<Moment>);
	}, [defaultValue, currentValue]);

	// 初始化tag选中
	useEffect(() => {
		if (defaultTagValue) {
			const defaultIndex = (options || []).findIndex((item) => item.type === defaultTagValue);
			setCheckedIndex(defaultIndex);
		}
	}, [defaultTagValue]);

	// const searchWidth = document.getElementsByClassName('custom-table-query-box')[0]?.clientWidth;
	const handleOnChange = useCallback(
		(vals: any, dates: [string, string]) => {
			if (typeof onChange === 'function') {
				onChange(vals as RangeValue<Moment>, dates);
			}
		},
		[onChange],
	);

	const handleChange = useCallback(
		(dates: RangeValue<Moment>, dateStrings: [string, string]) => {
			setCheckedIndex(null);
			const newDates = !dates ? dates : dates?.map((date) => date?.startOf('day'));
			if (typeof onChange === 'function') {
				onChange(newDates as RangeValue<Moment>, dateStrings);
			} else {
				setValue(newDates as RangeValue<Moment>);
			}
		},
		[onChange],
	);

	const handleCheck = useCallback(
		(option: OptionProps, checked: boolean, index: number) => {
			const dates = getDateTime({ type: option.type, count: option.count });
			const values = dates.map((date) => moment(date, format as MomentFormatSpecification));
			if (checked) {
				setCheckedIndex(index);
			} else {
				setCheckedIndex(null);
			}
			setValue(values as RangeValue<Moment>);
			handleOnChange([...values], [...dates]);
		},
		[format, handleOnChange],
	);

	// useEffect(() => {
	//   if (searchWidth) {
	//     setDateWidth(searchWidth / 3 - 149)
	//   }
	// }, [searchWidth]);

	useEffect(() => {
		let parentEl: HTMLElement = elRef.current as HTMLElement;
		let mr = 0;
		let pr = 0;
		while (parentEl) {
			parentEl = parentEl.parentElement as HTMLElement;
			if (!parentEl) {
				break;
			}

			if (parentEl && parentEl.classList.contains('ant-form-item')) {
				const style = getComputedStyle(parentEl);
				const parentStyle = getComputedStyle(parentEl.parentElement as HTMLElement);
				mr = Number(style.marginRight.replace('px', '')) || 0;
				pr =
					Number(parentStyle.paddingRight.replace('px', '') || 0) +
					Number(parentStyle.paddingLeft.replace('px', '') || 0);
				break;
			}
			if (parentEl && parentEl.tagName.toUpperCase() === 'BODY') {
				break;
			}
		}
		// pr为ant-form-item父级col的paddingLeft + paddingRight，计算出父级的总宽，后面pr是两个输入控件之间的间隙，最后面那个用于补正，不知道为什么在ProTable会少了3px
		setDateWidth(
			Math.ceil(((elRef.current?.clientWidth as number) + labelWidth + pr) / 3) -
				labelWidth -
				mr -
				pr +
				(pr > 0 ? 0 : 3),
		);
	}, [elRef.current, labelWidth, onChange]);

	return (
		<div
			className={classNames('date-range-with-tag', className)}
			style={style}
			ref={elRef}>
			<Space>
				<DatePicker.RangePicker
					{...rest}
					format={format}
					value={value}
					style={{ width: dateWidth }}
					onChange={handleChange}
				/>
				<div className='tag-wrapper'>
					{options &&
						options.length > 0 &&
						options.map((option, index: number) => {
							return (
								<CheckableTag
									key={option.label}
									checked={checkedIndex === index}
									onChange={(checked) => handleCheck(option, checked, index)}>
									{option.label}
								</CheckableTag>
							);
						})}
				</div>
			</Space>
		</div>
	);
};

export default DateRangeWithTag;
