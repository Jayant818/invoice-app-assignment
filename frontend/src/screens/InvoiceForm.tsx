import { useState, useEffect } from "react";
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

const InvoiceForm = () => {
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
		<div className="min-h-screen bg-gray-50 p-4 sm:p-8">
			{/* Header with Home Link */}
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-xl sm:text-3xl font-bold text-gray-800">
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
				className="bg-white shadow-md rounded p-4 sm:px-8 sm:pt-6 sm:pb-8"
			>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
						<h3 className="text-lg sm:text-2xl font-semibold text-gray-700">
							Items
						</h3>
						<button
							type="button"
							onClick={addItem}
							className="flex items-center text-green-600 hover:text-green-800 font-medium"
						>
							<FaPlus className="mr-2" /> Add Item
						</button>
					</div>

					{invoice.items.map((item, itemIndex) => (
						<div
							key={itemIndex}
							className="border border-gray-300 rounded-lg p-4 mb-6 bg-gray-50"
						>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
								<div>
									<label
										htmlFor={`item-name-${itemIndex}`}
										className="block text-sm font-medium text-gray-700"
									>
										Item Name
									</label>
									<input
										type="text"
										id={`item-name-${itemIndex}`}
										value={item.name}
										onChange={(e) =>
											handleItemChange(itemIndex, "name", e.target.value)
										}
										className={`mt-1 block w-full border ${
											errors.items?.[itemIndex]?.name
												? "border-red-500"
												: "border-gray-300"
										} rounded-md shadow-sm p-2`}
									/>
									{errors.items?.[itemIndex]?.name && (
										<p className="text-red-500 text-sm mt-1">
											{errors.items[itemIndex].name}
										</p>
									)}
								</div>

								{/* Price and Quantity Fields */}
								<div>
									<label
										htmlFor={`item-price-${itemIndex}`}
										className="block text-sm font-medium text-gray-700"
									>
										Price
									</label>
									<input
										type="number"
										id={`item-price-${itemIndex}`}
										value={item.price}
										onChange={(e) =>
											handleItemChange(
												itemIndex,
												"price",
												parseFloat(e.target.value)
											)
										}
										className={`mt-1 block w-full border ${
											errors.items?.[itemIndex]?.price
												? "border-red-500"
												: "border-gray-300"
										} rounded-md shadow-sm p-2`}
									/>
									{errors.items?.[itemIndex]?.price && (
										<p className="text-red-500 text-sm mt-1">
											{errors.items[itemIndex].price}
										</p>
									)}
								</div>

								<div>
									<label
										htmlFor={`item-quantity-${itemIndex}`}
										className="block text-sm font-medium text-gray-700"
									>
										Quantity
									</label>
									<input
										type="number"
										id={`item-quantity-${itemIndex}`}
										value={item.quantity}
										onChange={(e) =>
											handleItemChange(
												itemIndex,
												"quantity",
												parseInt(e.target.value)
											)
										}
										className={`mt-1 block w-full border ${
											errors.items?.[itemIndex]?.quantity
												? "border-red-500"
												: "border-gray-300"
										} rounded-md shadow-sm p-2`}
									/>
									{errors.items?.[itemIndex]?.quantity && (
										<p className="text-red-500 text-sm mt-1">
											{errors.items[itemIndex].quantity}
										</p>
									)}
								</div>
							</div>

							{/* Taxes Section */}
							<div className="mb-4">
								<h4 className="text-sm font-semibold text-gray-700 mb-2">
									Taxes
								</h4>
								{item.taxes.map((tax, taxIndex) => (
									<div key={taxIndex} className="flex items-center gap-4 mb-2">
										<div className="flex-1">
											<label
												htmlFor={`item-${itemIndex}-tax-title-${taxIndex}`}
												className="block text-sm font-medium text-gray-700"
											>
												Tax Title
											</label>
											<input
												type="text"
												id={`item-${itemIndex}-tax-title-${taxIndex}`}
												value={tax.title}
												onChange={(e) =>
													handleTaxChange(
														itemIndex,
														taxIndex,
														"title",
														e.target.value
													)
												}
												className={`mt-1 block w-full border ${
													errors.items?.[itemIndex]?.taxes?.[taxIndex]?.title
														? "border-red-500"
														: "border-gray-300"
												} rounded-md shadow-sm p-2`}
											/>
											{errors.items?.[itemIndex]?.taxes?.[taxIndex]?.title && (
												<p className="text-red-500 text-sm mt-1">
													{errors.items[itemIndex].taxes[taxIndex].title}
												</p>
											)}
										</div>

										<div className="flex-1">
											<label
												htmlFor={`item-${itemIndex}-tax-rate-${taxIndex}`}
												className="block text-sm font-medium text-gray-700"
											>
												Tax Rate (%)
											</label>
											<input
												type="number"
												id={`item-${itemIndex}-tax-rate-${taxIndex}`}
												value={tax.rate}
												onChange={(e) =>
													handleTaxChange(
														itemIndex,
														taxIndex,
														"rate",
														parseFloat(e.target.value)
													)
												}
												className={`mt-1 block w-full border ${
													errors.items?.[itemIndex]?.taxes?.[taxIndex]?.rate
														? "border-red-500"
														: "border-gray-300"
												} rounded-md shadow-sm p-2`}
											/>
											{errors.items?.[itemIndex]?.taxes?.[taxIndex]?.rate && (
												<p className="text-red-500 text-sm mt-1">
													{errors.items[itemIndex].taxes[taxIndex].rate}
												</p>
											)}
										</div>

										{/* Remove Tax Button */}
										<button
											type="button"
											onClick={() => removeTax(itemIndex, taxIndex)}
											className="text-red-500 hover:text-red-700 mt-6"
										>
											<FaTrash />
										</button>
									</div>
								))}
								<button
									type="button"
									onClick={() => addTax(itemIndex)}
									className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
								>
									<FaPlus className="mr-2" /> Add Tax
								</button>
							</div>

							{/* Remove Item Button */}
							<button
								type="button"
								onClick={() => removeItem(itemIndex)}
								className="text-red-500 hover:text-red-700"
							>
								<FaTrash className="mr-2 inline" />
								Remove Item
							</button>
						</div>
					))}
				</div>

				{/* Invoice Totals */}
				<div className="mt-8">
					<div className="flex justify-between text-lg font-semibold text-gray-700">
						<span>Subtotal:</span>
						<span>
							{calculateSubtotal().toFixed(2)} {invoice.currency}
						</span>
					</div>
					<div className="flex justify-between text-lg font-semibold text-gray-700">
						<span>Taxes:</span>
						<span>
							{calculateTaxes().toFixed(2)} {invoice.currency}
						</span>
					</div>
					<div className="flex justify-between text-xl font-bold text-gray-900">
						<span>Total:</span>
						<span>
							{calculateTotal().toFixed(2)} {invoice.currency}
						</span>
					</div>
				</div>

				{/* Submit Button */}
				<div className="mt-8 flex justify-end">
					<button
						type="submit"
						className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
					>
						{isEditMode ? "Update Invoice" : "Create Invoice"}
					</button>
				</div>
			</form>
		</div>
	);
};

export default InvoiceForm;
