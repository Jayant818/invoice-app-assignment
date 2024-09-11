import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getInvoice } from "../api/api";
import { FaPrint, FaHome, FaEdit } from "react-icons/fa";
import { InvoiceData } from "../types";

const Invoice = () => {
	const { id } = useParams<{ id: string }>();
	const [invoice, setInvoice] = useState<InvoiceData | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchInvoice = async () => {
			try {
				const response = await getInvoice(id!);
				setInvoice(response.data);
			} catch (err) {
				console.error("Error fetching invoice:", err);
				setError("Failed to load invoice.");
			} finally {
				setLoading(false);
			}
		};
		fetchInvoice();
	}, [id]);

	const calculateSubtotal = () => {
		return invoice?.items.reduce(
			(total, item) => total + item.price * item.quantity,
			0
		);
	};

	const calculateTaxes = () => {
		return invoice?.items.reduce((total, item) => {
			const itemTotal = item.price * item.quantity;
			const itemTaxes = item.taxes.reduce(
				(taxTotal, tax) => taxTotal + (itemTotal * tax.rate) / 100,
				0
			);
			return total + itemTaxes;
		}, 0);
	};

	const calculateTotal = () => {
		return (calculateSubtotal() || 0) + (calculateTaxes() || 0);
	};

	const handlePrint = () => {
		window.print();
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-xl">Loading invoice...</p>
			</div>
		);
	}

	if (error || !invoice) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-xl text-red-500">{error || "Invoice not found."}</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 lg:p-10">
			{/* Header with Navigation */}
			<div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6">
				<h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">
					Invoice Details
				</h2>
				<div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
					<Link
						to="/"
						className="flex items-center text-blue-600 hover:text-blue-800 font-semibold"
					>
						<FaHome className="mr-2" /> Home
					</Link>
					<Link
						to={`/edit/${invoice.id}`}
						className="flex items-center text-yellow-500 hover:text-yellow-700 font-semibold"
					>
						<FaEdit className="mr-2" /> Edit
					</Link>
					<button
						onClick={handlePrint}
						className="flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow transition duration-300"
					>
						<FaPrint className="mr-2" /> Print
					</button>
				</div>
			</div>

			{/* Invoice Card */}
			<div className="bg-white shadow-md rounded-lg p-4 sm:p-6 md:p-8">
				{/* Invoice Header */}
				<div className="flex flex-col md:flex-row md:justify-between border-b pb-4 mb-6">
					<div>
						<h3 className="text-xl md:text-2xl font-semibold">
							Invoice #{invoice.number}
						</h3>
						<p className="text-gray-600">
							Date: {new Date(invoice.date).toLocaleDateString()}
						</p>
					</div>
					<div className="mt-4 md:mt-0 text-right">
						<p className="text-gray-700 font-medium">
							Currency: {invoice.currency}
						</p>
					</div>
				</div>

				{/* Items Table */}
				<div className="overflow-x-auto">
					<table className="min-w-full bg-white">
						<thead className="bg-gray-200">
							<tr>
								<th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
									Item Name
								</th>
								<th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
									Price
								</th>
								<th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
									Quantity
								</th>
								<th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
									Taxes
								</th>
								<th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">
									Total
								</th>
							</tr>
						</thead>
						<tbody>
							{invoice.items.map((item) => {
								const itemTotal = item.price * item.quantity;
								const itemTaxTotal = item.taxes.reduce(
									(sum, tax) => sum + (itemTotal * tax.rate) / 100,
									0
								);
								const itemGrandTotal = itemTotal + itemTaxTotal;
								return (
									<tr key={item.id} className="border-b">
										<td className="py-4 px-4 text-sm text-gray-700">
											{item.name}
										</td>
										<td className="py-4 px-4 text-sm text-gray-700">
											{item.price.toFixed(2)} {invoice.currency}
										</td>
										<td className="py-4 px-4 text-sm text-gray-700">
											{item.quantity}
										</td>
										<td className="py-4 px-4 text-sm text-gray-700">
											{item.taxes.map((tax, index) => (
												<span key={tax.id}>
													{tax.title} ({tax.rate}%)
													{index < item.taxes.length - 1 ? ", " : ""}
												</span>
											))}
										</td>
										<td className="py-4 px-4 text-sm text-gray-700 text-right">
											{itemGrandTotal.toFixed(2)} {invoice.currency}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>

				{/* Totals Section */}
				<div className="flex flex-col md:flex-row justify-end mt-6">
					<div className="w-full md:w-1/3">
						<div className="flex justify-between mb-2">
							<span className="text-gray-700">Subtotal:</span>
							<span className="font-medium">
								{calculateSubtotal()?.toFixed(2)} {invoice.currency}
							</span>
						</div>
						<div className="flex justify-between mb-2">
							<span className="text-gray-700">Taxes:</span>
							<span className="font-medium">
								{calculateTaxes()?.toFixed(2)} {invoice.currency}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-700 font-semibold">Total:</span>
							<span className="font-semibold">
								{calculateTotal().toFixed(2)} {invoice.currency}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Invoice;
