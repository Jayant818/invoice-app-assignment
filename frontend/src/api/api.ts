import axios from "axios";
import { InvoiceData } from "../types";

const api = axios.create({
	baseURL: "http://localhost:3000",
});

export const createInvoice = (invoiceData: InvoiceData) =>
	api.post("/invoices", invoiceData);

export const getInvoices = () => api.get<InvoiceData[]>("/invoices");

export const getInvoice = (id: string) =>
	api.get<InvoiceData>(`/invoices/${id}`);

export const updateInvoice = (id: string, invoiceData: InvoiceData) =>
	api.put(`/invoices/${id}`, invoiceData);

export const deleteInvoice = (id: string) => api.delete(`/invoices/${id}`);
