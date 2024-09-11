export interface Tax {
	id: string;
	rate: number;
	title: string;
}

export interface Item {
	id: string;
	name: string;
	price: number;
	quantity: number;
	taxes: Tax[];
}

export interface InvoiceData {
	id: string;
	date: string;
	number: string;
	currency: string;
	items: Item[];
}
