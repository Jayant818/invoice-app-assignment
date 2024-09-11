import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getInvoices } from "../api/api";
import { FaPlus, FaEdit, FaEye, FaHome } from "react-icons/fa";
import { InvoiceData } from "../types";

const InvoiceList: React.FC = () => {
	const [invoices, setInvoices] = useState<InvoiceData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchInvoices = async () => {
			try {
				const response = await getInvoices();
				setInvoices(response.data);
			} catch (err) {
				console.error("Error fetching invoices:", err);
				setError("Failed to load invoices.");
			} finally {
				setLoading(false);
			}
		};
		fetchInvoices();
	}, []);

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-3xl font-bold text-gray-800">Invoices</h2>
				<Link
					to="/"
					className="flex items-center text-blue-600 hover:text-blue-800 font-semibold"
				>
					<FaHome className="mr-2" /> Home
				</Link>
			</div>

			<div className="flex justify-end mb-4">
				<Link
					to="/create"
					className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition duration-300"
				>
					<FaPlus className="mr-2" /> Create New Invoice
				</Link>
			</div>

			<div className="overflow-x-auto">
				<table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
					<thead className="bg-gray-200">
						<tr>
							<th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
								Invoice Number
							</th>
							<th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
								Date
							</th>
							<th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
								Currency
							</th>
							<th className="py-3 px-6 text-center text-sm font-semibold text-gray-700">
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr>
								<td colSpan={4} className="text-center py-4">
									Loading invoices...
								</td>
							</tr>
						) : error ? (
							<tr>
								<td colSpan={4} className="text-center py-4 text-red-500">
									{error}
								</td>
							</tr>
						) : invoices.length === 0 ? (
							<tr>
								<td colSpan={4} className="text-center py-4">
									No invoices found. Create one!
								</td>
							</tr>
						) : (
							invoices.map((invoice) => (
								<tr key={invoice.id} className="border-b">
									<td className="py-4 px-6 text-sm text-gray-700">
										{invoice.number}
									</td>
									<td className="py-4 px-6 text-sm text-gray-700">
										{new Date(invoice.date).toLocaleDateString()}
									</td>
									<td className="py-4 px-6 text-sm text-gray-700">
										{invoice.currency}
									</td>
									<td className="py-4 px-6 text-center">
										<div className="flex justify-center space-x-4">
											<Link
												to={`/edit/${invoice.id}`}
												className="text-yellow-500 hover:text-yellow-700"
												title="Edit Invoice"
											>
												<FaEdit />
											</Link>
											<Link
												to={`/view/${invoice.id}`}
												className="text-green-500 hover:text-green-700"
												title="View Invoice"
											>
												<FaEye />
											</Link>
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default InvoiceList;
