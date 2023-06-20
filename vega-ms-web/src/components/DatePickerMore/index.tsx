import React, { Component } from 'react';
import { DatePicker, Row, Col, Tag } from 'antd';

import moment, { Moment } from 'moment';
import classNames from 'classnames';
import styles from './index.less';

const CheckableTag = Tag.CheckableTag;
const dd = 1000 * 60 * 60 * 24;
const timeObject = {
	day: {
		start: moment(Date.now() - dd * 2).format('YYYY/MM/DD'),
		end: moment(Date.now()).format('YYYY/MM/DD'),
	},
	toDay: {
		start: moment(Date.now()).format('YYYY/MM/DD'),
		end: moment(Date.now()).format('YYYY/MM/DD'),
	},
	week: {
		start: moment(Date.now() - dd * 6).format('YYYY/MM/DD'),
		end: moment(Date.now()).format('YYYY/MM/DD'),
	},
	month: {
		start: moment(Date.now() - dd)
			.subtract(1, 'months')
			.format('YYYY/MM/DD'),
		end: moment(Date.now()).format('YYYY/MM/DD'),
	},
	currentMonth: {
		start: moment(new Date().setDate(1)).format('YYYY/MM/DD'),
		end: moment(moment(new Date().setDate(1)).format('YYYY/MM/DD'))
			.add(1, 'months')
			.subtract(1, 'days')
			.add(24 * 60 * 60 - 1, 'seconds')
			.format('YYYY/MM/DD'),
	},
	lastMonth: {
		start: moment(new Date().setDate(1)).subtract(1, 'months').format('YYYY/MM/DD'),
		end: moment(moment(new Date().setDate(1)).subtract(1, 'months').format('YYYY/MM/DD'))
			.add(1, 'months')
			.subtract(1, 'days')
			.add(24 * 60 * 60 - 1, 'seconds')
			.format('YYYY/MM/DD'),
	},
};
const singerTimeObject = {
	// 'currentMonth': { start: moment(Date.now()).format('YYYY/MM') },
	// 'lastMonth': { start: moment(Date.now() - dd).subtract(1, 'months').format('YYYY/MM') }
	currentMonth: { start: timeObject['day'].start },
	lastMonth: { start: timeObject['month'].start },
};
interface checkItem {
	text: string;
	key: string;
}
export interface DatePickerMoreProps {
	onChange?: (date: (string | number | Moment)[], dateStrings: (string | number)[]) => void;
	value?: (string | number)[];
	defaultValue?: (string | number)[];
	style?: React.CSSProperties;
	hideMore?: boolean;

	className?: string;
	format?: string;
	type?: string;
	picker?: string;
	checkList?: [checkItem];
	single?: boolean; // single时只选择单月
	isToday?: boolean;
	DatePickerWidth?: number;
}

interface timeList {
	text: string;
	key: string;
}

interface DatePickerMoreState {
	value: (string | number)[];
	checkList: timeList[];
}

class DatePickerMore extends Component<DatePickerMoreProps, DatePickerMoreState> {
	static defaultProps = {
		hideMore: false,
	};

	static getDerivedStateFromProps(nextProps: DatePickerMoreProps) {
		const params: Record<string, any> = {};
		if ('value' in nextProps) {
			params.value = nextProps.value || [];
		}
		if ('checkList' in nextProps) {
			params.checkList = nextProps.checkList || [
				// nextProps.isToday ?  {text: '当天', key: 'toDay'} :
				//                      {text: '最近三天', key: 'day'},
				{ text: '当天', key: 'toDay' },
				{ text: '最近一周', key: 'week' },
				{ text: '近一个月', key: 'month' },
			];
		}
		if (Object.keys(params).length) {
			return params;
		}
		return null;
	}

	constructor(props: DatePickerMoreProps) {
		super(props);
		this.state = {
			value: props.value || props.defaultValue || [],
			checkList: [
				// isToday ? { text: '当天', key: 'toDay' } : { text: '最近三天', key: 'day', },
				{ text: '当天', key: 'toDay' },

				{ text: '最近一周', key: 'week' },
				{ text: '近一个月', key: 'month' },
			],
		};
	}

	dateChange = (dates: [], dateStrings: number[]) => {
		const { onChange, picker, single } = this.props;
		if (!('value' in this.props)) {
			this.setState({ value: dateStrings });
		}
		if (onChange) {
			if (picker === 'month' && Array.isArray(dates)) {
				let start = moment(new Date(`${dates[0].year()},${dates[0].month() + 1}`));
				let end = moment(new Date(`${dates[1].year()},${dates[1].month() + 1}`))
					.add(1, 'months')
					.subtract(1, 'days')
					.add(24 * 60 * 60 - 1, 'seconds');
				onChange([start, end], [start.format('YYYY/MM'), end.format('YYYY/MM')]);
			} else if (picker === 'month' && single) {
				onChange(dates, dates ? dates.format('YYYY/MM') : undefined);
			} else {
				onChange(dates, dateStrings);
			}
		}
	};
	isSingerTimeChead = (value: any) => {
		let newValue = this.state.value;
		let formTime = singerTimeObject[value].start;
		if (!newValue) {
			return false;
		} else {
			let satrtTime = moment(new Date(newValue).getTime()).format('YYYY/MM');
			if (satrtTime == formTime) {
				return true;
			} else {
				return false;
			}
		}
	};
	isTimeChead = (value: any) => {
		let newValue = this.state.value;
		let formTime = timeObject[value].start;
		let formend = timeObject[value].end;
		if (!newValue) {
			return false;
		} else {
			let satrtTime = moment(new Date(newValue[0]).getTime()).format('YYYY/MM/DD');
			let satrtend = moment(new Date(newValue[1]).getTime()).format('YYYY/MM/DD');
			if (satrtTime == formTime && formend == satrtend) {
				return true;
			} else {
				return false;
			}
		}
	};

	checkItem = (value: string, checked: boolean) => {
		let start = '';
		let end = '';
		end = timeObject['day'].end;
		switch (value) {
			case 'day':
				start = timeObject['day'].start;
				break;
			case 'toDay':
				start = timeObject['toDay'].start;
				break;
			case 'week':
				start = timeObject['week'].start;
				break;
			case 'month':
				start = timeObject['month'].start;
				break;
			case 'currentMonth':
				start = singerTimeObject['currentMonth'].start;
				break;
			case 'lastMonth':
				start = singerTimeObject['lastMonth'].start;
				break;
			default:
				break;
		}
		const { onChange, single } = this.props;
		if (!('value' in this.props)) {
			this.setState({ value: [start, end] });
		}
		if (onChange) {
			if (single) {
				onChange(moment(start), start);
			} else {
				onChange([moment(start), moment(end)], [start, end]);
			}
		}
	};

	render() {
		const { value, checkList } = this.state;
		const {
			className,
			style,
			format = ['YYYY-MM-DD', 'YYYY/MM/DD'],
			hideMore,
			type = 'M',
			picker = 'date',
			single = false,
		} = this.props;
		const dateCol = {
			xs: 24,
			sm: 22,
			md: type === 'M' ? 22 : 23,
			lg: type === 'M' ? 12 : 18,
			xl: 12,
			xxl: 8,
		};
		const tagCol = {
			xs: 24,
			sm: 22,
			lg: type === 'M' ? 12 : 24,
			xl: 12,
			xxl: 14,
		};
		const cls = classNames(styles.moreDate, className);
		let DatePickerWidth = this.props.DatePickerWidth;
		return (
			<div
				className={cls}
				style={style}>
				<Row>
					<Col {...(DatePickerWidth ? '' : dateCol)}>
						{single ? (
							<DatePicker
								onChange={this.dateChange}
								picker='month'
								value={Array.isArray(value) ? value[0] : value}
								format={format}
								style={{ width: '100%' }}
							/>
						) : (
							<DatePicker.RangePicker
								format={format}
								picker={picker}
								value={value[0] ? [moment(value[0], format), moment(value[1], format)] : []}
								onChange={this.dateChange}
								style={{ width: DatePickerWidth ? DatePickerWidth : '' }}
							/>
						)}
					</Col>
					<Col
						{...tagCol}
						className={styles.quickBox}>
						<div className='tagWrapClass'>
							{!hideMore &&
								checkList.map((item) => {
									return (
										<CheckableTag
											key={item.key}
											checked={
												single ? this.isSingerTimeChead(item.key) : this.isTimeChead(item.key)
											}
											onChange={(checked) => this.checkItem(item.key, checked)}>
											{item.text}
										</CheckableTag>
									);
								})}
						</div>
					</Col>
				</Row>
			</div>
		);
	}
}

export default DatePickerMore;
