import React from "react";
import { Link } from "react-router-dom";
import { FaFileInvoiceDollar } from "react-icons/fa";

const LandingPage: React.FC = () => {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
			<FaFileInvoiceDollar className="text-6xl mb-6 animate-bounce" />
			<h1 className="text-5xl font-extrabold mb-4 text-center">
				Welcome to Your Invoicing App
			</h1>
			<p className="text-xl mb-8 text-center max-w-2xl">
				Streamline your billing process effortlessly. Create, edit, and manage
				your invoices with ease, all in one place.
			</p>
			<div className="space-x-4">
				<Link
					to="/invoices"
					className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-full shadow-lg hover:bg-gray-100 transition duration-300"
				>
					View Invoices
				</Link>
				<Link
					to="/create"
					className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition duration-300"
				>
					Create New Invoice
				</Link>
			</div>
		</div>
	);
};

export default LandingPage;
