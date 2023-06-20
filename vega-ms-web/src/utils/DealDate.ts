import moment from 'moment';
const format = ['YYYY/MM/DD', 'YYYY/MM/DD HH:mm:ss'];

export function DealDate(text: number, type: number = 0, dataEmpty: string = '') {
	return text ? moment(new Date(text)).format(format[type]) : dataEmpty;
}
