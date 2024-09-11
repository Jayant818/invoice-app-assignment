import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { createInvoice, getInvoice, updateInvoice } from "../api/api";
import { FaPlus, FaTrash, FaHome } from "react-icons/fa";

const TaxSchema = z.object({
	rate: z.number().min(0).max(100, "Rate must be between 0 and 100"),
	title: z.string().min(1, "Title is required"),
});

const ItemSchema = z.object({
	name: z.string().min(1, "Item name is required"),
	price: z.number().positive("Price must be positive"),
	quantity: z.number().int().positive("Quantity must be a positive integer"),
	taxes: z.array(TaxSchema),
});

const InvoiceSchema = z.object({
	date: z.string().refine((val) => !isNaN(Date.parse(val)), {
		message: "Invalid date format",
	}),
	number: z.string().min(1, "Invoice number is required"),
	currency: z.string().length(3, "Currency must be a 3-letter code"),
	items: z.array(ItemSchema).min(1, "At least one item is required"),
});

type Invoice = z.infer<typeof InvoiceSchema>;

const InvoiceForm: React.FC = () => {
	const [invoice, setInvoice] = useState<Invoice>({
		date: new Date().toISOString(),
		number: "",
		currency: "USD",
		items: [],
	});
	const [errors, setErrors] = useState<any>({});
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const isEditMode = Boolean(id);

	useEffect(() => {
		if (id) {
			const fetchInvoice = async () => {
				try {
					const response = await getInvoice(id);
					setInvoice(response.data);
				} catch (error) {
					console.error("Error fetching invoice:", error);
				}
			};
			fetchInvoice();
		}
	}, [id]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		if (name === "date") {
			// Convert the datetime-local value to ISO string
			const date = new Date(value);
			setInvoice({ ...invoice, [name]: date.toISOString() });
		} else {
			setInvoice({ ...invoice, [name]: value });
		}
	};

	const handleItemChange = (
		index: number,
		field: string,
		value: string | number
	) => {
		const updatedItems = [...invoice.items];
		updatedItems[index] = { ...updatedItems[index], [field]: value };
		setInvoice({ ...invoice, items: updatedItems });
	};

	const handleTaxChange = (
		itemIndex: number,
		taxIndex: number,
		field: string,
		value: string | number
	) => {
		const updatedItems = [...invoice.items];
		const updatedTaxes = [...updatedItems[itemIndex].taxes];
		updatedTaxes[taxIndex] = { ...updatedTaxes[taxIndex], [field]: value };
		updatedItems[itemIndex] = {
			...updatedItems[itemIndex],
			taxes: updatedTaxes,
		};
		setInvoice({ ...invoice, items: updatedItems });
	};

	const addItem = () => {
		setInvoice({
			...invoice,
			items: [...invoice.items, { name: "", price: 0, quantity: 1, taxes: [] }],
		});
	};

	const removeItem = (index: number) => {
		const updatedItems = [...invoice.items];
		updatedItems.splice(index, 1);
		setInvoice({ ...invoice, items: updatedItems });
	};

	const addTax = (itemIndex: number) => {
		const updatedItems = [...invoice.items];
		updatedItems[itemIndex].taxes.push({ rate: 0, title: "" });
		setInvoice({ ...invoice, items: updatedItems });
	};

	const removeTax = (itemIndex: number, taxIndex: number) => {
		const updatedItems = [...invoice.items];
		updatedItems[itemIndex].taxes.splice(taxIndex, 1);
		setInvoice({ ...invoice, items: updatedItems });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const validatedInvoice = InvoiceSchema.parse(invoice);
			if (isEditMode) {
				await updateInvoice(id!, validatedInvoice);
			} else {
				await createInvoice(validatedInvoice);
			}
			navigate("/invoices");
		} catch (error: any) {
			if (error instanceof z.ZodError) {
				console.log("Validation error:", error.errors);
				setErrors(error.flatten().fieldErrors);
			}
		}
	};

	const calculateSubtotal = () => {
		return invoice.items.reduce(
			(total, item) => total + item.price * item.quantity,
			0
		);
	};

	const calculateTaxes = () => {
		return invoice.items.reduce((total, item) => {
			const itemTotal = item.price * item.quantity;
			const itemTaxes = item.taxes.reduce(
				(taxTotal, tax) => taxTotal + (itemTotal * tax.rate) / 100,
				0
			);
			return total + itemTaxes;
		}, 0);
	};

	const calculateTotal = () => {
		return calculateSubtotal() + calculateTaxes();
	};

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			{/* Header with Home Link */}
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-3xl font-bold text-gray-800">
					{isEditMode ? "Edit Invoice" : "Create New Invoice"}
				</h2>
				<Link
					to="/"
					className="flex items-center text-blue-600 hover:text-blue-800 font-semibold"
				>
					<FaHome className="mr-2" /> Home
				</Link>
			</div>

			<form
				onSubmit={handleSubmit}
				className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
			>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div>
						<label
							htmlFor="date"
							className="block text-sm font-medium text-gray-700"
						>
							Date
						</label>
						<input
							type="datetime-local"
							id="date"
							name="date"
							value={
								invoice.date
									? new Date(invoice.date).toISOString().slice(0, 16)
									: ""
							}
							onChange={handleChange}
							className={`mt-1 block w-full border ${
								errors.date ? "border-red-500" : "border-gray-300"
							} rounded-md shadow-sm p-2`}
						/>
						{errors.date && (
							<p className="text-red-500 text-sm mt-1">{errors.date}</p>
						)}
					</div>

					{/* Invoice Number */}
					<div>
						<label
							htmlFor="number"
							className="block text-sm font-medium text-gray-700"
						>
							Invoice Number
						</label>
						<input
							type="text"
							id="number"
							name="number"
							value={invoice.number}
							onChange={handleChange}
							className={`mt-1 block w-full border ${
								errors.number ? "border-red-500" : "border-gray-300"
							} rounded-md shadow-sm p-2`}
						/>
						{errors.number && (
							<p className="text-red-500 text-sm mt-1">{errors.number}</p>
						)}
					</div>

					{/* Currency */}
					<div>
						<label
							htmlFor="currency"
							className="block text-sm font-medium text-gray-700"
						>
							Currency
						</label>
						<input
							type="text"
							id="currency"
							name="currency"
							value={invoice.currency}
							onChange={handleChange}
							placeholder="e.g., USD, EUR, INR"
							className={`mt-1 block w-full border ${
								errors.currency ? "border-red-500" : "border-gray-300"
							} rounded-md shadow-sm p-2`}
						/>
						{errors.currency && (
							<p className="text-red-500 text-sm mt-1">{errors.currency}</p>
						)}
					</div>
				</div>

				{/* Items Section */}
				<div className="mt-8">
					<div className="flex justify-between items-center mb-4">
						<h3 className="text-2xl font-semibold text-gray-700">Items</h3>
						<button
							type="button"
							onClick={addItem}
							className="flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow transition duration-300"
						>
							<FaPlus className="mr-2" /> Add Item
						</button>
					</div>

					{invoice.items.map((item, index) => (
						<div
							key={index}
							className="bg-gray-100 p-4 rounded-md mb-6 shadow-inner"
						>
							<div className="flex justify-between items-center mb-4">
								<h4 className="text-lg font-medium text-gray-800">
									Item {index + 1}
								</h4>
								<button
									type="button"
									onClick={() => removeItem(index)}
									className="flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded shadow transition duration-300"
								>
									<FaTrash className="mr-1" /> Remove
								</button>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								{/* Item Name */}
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Name
									</label>
									<input
										type="text"
										value={item.name}
										onChange={(e) =>
											handleItemChange(index, "name", e.target.value)
										}
										className={`mt-1 block w-full border ${
											errors.items?.[index]?.name
												? "border-red-500"
												: "border-gray-300"
										} rounded-md shadow-sm p-2`}
									/>
									{errors.items?.[index]?.name && (
										<p className="text-red-500 text-sm mt-1">
											{errors.items[index].name}
										</p>
									)}
								</div>

								{/* Price */}
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Price
									</label>
									<input
										type="number"
										value={item.price}
										onChange={(e) =>
											handleItemChange(
												index,
												"price",
												parseFloat(e.target.value)
											)
										}
										className={`mt-1 block w-full border ${
											errors.items?.[index]?.price
												? "border-red-500"
												: "border-gray-300"
										} rounded-md shadow-sm p-2`}
									/>
									{errors.items?.[index]?.price && (
										<p className="text-red-500 text-sm mt-1">
											{errors.items[index].price}
										</p>
									)}
								</div>

								{/* Quantity */}
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Quantity
									</label>
									<input
										type="number"
										value={item.quantity}
										onChange={(e) =>
											handleItemChange(
												index,
												"quantity",
												parseInt(e.target.value)
											)
										}
										className={`mt-1 block w-full border ${
											errors.items?.[index]?.quantity
												? "border-red-500"
												: "border-gray-300"
										} rounded-md shadow-sm p-2`}
									/>
									{errors.items?.[index]?.quantity && (
										<p className="text-red-500 text-sm mt-1">
											{errors.items[index].quantity}
										</p>
									)}
								</div>
							</div>

							{/* Taxes Section */}
							<div className="mt-6">
								<div className="flex justify-between items-center mb-2">
									<h5 className="text-lg font-medium text-gray-700">Taxes</h5>
									<button
										type="button"
										onClick={() => addTax(index)}
										className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded shadow transition duration-300"
									>
										<FaPlus className="mr-1" /> Add Tax
									</button>
								</div>

								{item.taxes.map((tax, taxIndex) => (
									<div
										key={taxIndex}
										className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4 bg-white p-3 rounded shadow"
									>
										{/* Tax Title */}
										<div className="flex-1">
											<label className="block text-sm font-medium text-gray-700">
												Title
											</label>
											<input
												type="text"
												value={tax.title}
												onChange={(e) =>
													handleTaxChange(
														index,
														taxIndex,
														"title",
														e.target.value
													)
												}
												className={`mt-1 block w-full border ${
													errors.items?.[index]?.taxes?.[taxIndex]?.title
														? "border-red-500"
														: "border-gray-300"
												} rounded-md shadow-sm p-2`}
											/>
											{errors.items?.[index]?.taxes?.[taxIndex]?.title && (
												<p className="text-red-500 text-sm mt-1">
													{errors.items[index].taxes[taxIndex].title}
												</p>
											)}
										</div>

										{/* Tax Rate */}
										<div className="flex-1 mt-4 md:mt-0">
											<label className="block text-sm font-medium text-gray-700">
												Rate (%)
											</label>
											<input
												type="number"
												value={tax.rate}
												onChange={(e) =>
													handleTaxChange(
														index,
														taxIndex,
														"rate",
														parseFloat(e.target.value)
													)
												}
												className={`mt-1 block w-full border ${
													errors.items?.[index]?.taxes?.[taxIndex]?.rate
														? "border-red-500"
														: "border-gray-300"
												} rounded-md shadow-sm p-2`}
											/>
											{errors.items?.[index]?.taxes?.[taxIndex]?.rate && (
												<p className="text-red-500 text-sm mt-1">
													{errors.items[index].taxes[taxIndex].rate}
												</p>
											)}
										</div>

										{/* Remove Tax Button */}
										<div className="mt-4 md:mt-0">
											<button
												type="button"
												onClick={() => removeTax(index, taxIndex)}
												className="flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded shadow transition duration-300"
											>
												<FaTrash className="mr-1" /> Remove
											</button>
										</div>
									</div>
								))}
							</div>
						</div>
					))}

					{/* Totals Section */}
					<div className="bg-gray-200 p-4 rounded-md shadow-inner">
						<h3 className="text-xl font-semibold text-gray-700 mb-4">Totals</h3>
						<div className="flex justify-between mb-2">
							<span className="text-gray-700">Subtotal:</span>
							<span className="font-medium">
								{calculateSubtotal().toFixed(2)} {invoice.currency}
							</span>
						</div>
						<div className="flex justify-between mb-2">
							<span className="text-gray-700">Taxes:</span>
							<span className="font-medium">
								{calculateTaxes().toFixed(2)} {invoice.currency}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-700 font-semibold">Total:</span>
							<span className="font-semibold">
								{calculateTotal().toFixed(2)} {invoice.currency}
							</span>
						</div>
					</div>

					{/* Submit Button */}
					<div className="flex justify-end mt-6">
						<button
							type="submit"
							className="flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded shadow transition duration-300"
						>
							{isEditMode ? "Update Invoice" : "Create Invoice"}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default InvoiceForm;
