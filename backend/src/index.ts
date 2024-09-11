import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Helper function to parse dates flexibly
const parseDate = (date: string) => {
	const parsedDate = new Date(date);
	if (isNaN(parsedDate.getTime())) {
		throw new Error("Invalid date format");
	}
	return parsedDate;
};

// Updated validation schemas
const TaxSchema = z.object({
	rate: z.number().min(0).max(100),
	title: z.string().min(1),
});

const ItemSchema = z.object({
	name: z.string().min(1),
	price: z.number().positive(),
	quantity: z.number().int().positive(),
	taxes: z.array(TaxSchema),
});

const InvoiceSchema = z.object({
	date: z.string().refine(
		(val) => {
			try {
				parseDate(val);
				return true;
			} catch {
				return false;
			}
		},
		{ message: "Invalid date format" }
	),
	number: z.string().min(1),
	currency: z.string().length(3),
	items: z.array(ItemSchema),
});

// Create a new invoice
app.post("/invoices", async (req, res) => {
	try {
		const invoiceData = InvoiceSchema.parse(req.body);
		const invoice = await prisma.invoice.create({
			data: {
				date: new Date(invoiceData.date),
				number: invoiceData.number,
				currency: invoiceData.currency,
				items: {
					create: invoiceData.items.map((item) => ({
						name: item.name,
						price: item.price,
						quantity: item.quantity,
						taxes: {
							create: item.taxes,
						},
					})),
				},
			},
			include: {
				items: {
					include: {
						taxes: true,
					},
				},
			},
		});
		res.json(invoice);
	} catch (error) {
		if (error instanceof z.ZodError) {
			res.status(400).json({ error: error.errors });
		} else {
			res.status(500).json({
				error: "An unexpected error occurred",
				details: error.message,
			});
		}
	}
});

// Get all invoices
app.get("/invoices", async (req, res) => {
	try {
		const invoices = await prisma.invoice.findMany({
			include: {
				items: {
					include: {
						taxes: true,
					},
				},
			},
		});
		res.json(invoices);
	} catch (error) {
		res.status(500).json({ error: "An unexpected error occurred" });
	}
});

// Get a single invoice
app.get("/invoices/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const invoice = await prisma.invoice.findUnique({
			where: { id },
			include: {
				items: {
					include: {
						taxes: true,
					},
				},
			},
		});
		if (invoice) {
			res.json(invoice);
		} else {
			res.status(404).json({ error: "Invoice not found" });
		}
	} catch (error) {
		res.status(500).json({ error: "An unexpected error occurred" });
	}
});

// Update an invoice
app.put("/invoices/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const invoiceData = InvoiceSchema.parse(req.body);

		// Delete existing items and taxes
		await prisma.tax.deleteMany({
			where: { item: { invoiceId: id } },
		});
		await prisma.item.deleteMany({
			where: { invoiceId: id },
		});

		// Update invoice with new data
		const updatedInvoice = await prisma.invoice.update({
			where: { id },
			data: {
				date: parseDate(invoiceData.date),
				number: invoiceData.number,
				currency: invoiceData.currency,
				items: {
					create: invoiceData.items.map((item) => ({
						name: item.name,
						price: item.price,
						quantity: item.quantity,
						taxes: {
							create: item.taxes,
						},
					})),
				},
			},
			include: {
				items: {
					include: {
						taxes: true,
					},
				},
			},
		});

		res.json(updatedInvoice);
	} catch (error) {
		if (error instanceof z.ZodError) {
			res.status(400).json({ error: error.errors });
		} else {
			res.status(500).json({
				error: "An unexpected error occurred",
				details: error.message,
			});
		}
	}
});

// Delete an invoice
app.delete("/invoices/:id", async (req, res) => {
	try {
		const { id } = req.params;
		await prisma.tax.deleteMany({
			where: { item: { invoiceId: id } },
		});
		await prisma.item.deleteMany({
			where: { invoiceId: id },
		});
		await prisma.invoice.delete({
			where: { id },
		});
		res.json({ message: "Invoice deleted successfully" });
	} catch (error) {
		res.status(500).json({ error: "An unexpected error occurred" });
	}
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
