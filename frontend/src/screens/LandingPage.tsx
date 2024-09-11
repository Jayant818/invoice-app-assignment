import { Link } from "react-router-dom";
import { FaFileInvoiceDollar } from "react-icons/fa";

const LandingPage = () => {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4">
			<FaFileInvoiceDollar className="text-6xl mb-6 animate-bounce" />
			<h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 text-center">
				Welcome to Your Invoicing App
			</h1>
			<p className="text-lg sm:text-xl mb-8 text-center max-w-xl lg:max-w-2xl">
				Streamline your billing process effortlessly. Create, edit, and manage
				your invoices with ease, all in one place.
			</p>
			<div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
				<Link
					to="/invoices"
					className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-full shadow-lg hover:bg-gray-100 transition duration-300 text-center"
				>
					View Invoices
				</Link>
				<Link
					to="/create"
					className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition duration-300 text-center"
				>
					Create New Invoice
				</Link>
			</div>
		</div>
	);
};

export default LandingPage;
