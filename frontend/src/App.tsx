import { Route, Routes } from "react-router-dom";
import "./App.css";
import LandingPage from "./screens/LandingPage";
import InvoiceList from "./screens/InvoiceList";
import InvoiceForm from "./screens/InvoiceForm";
import Invoice from "./screens/Invoice";

function App() {
	return (
		<div className="container mx-auto ">
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/invoices" element={<InvoiceList />} />
				<Route path="/create" element={<InvoiceForm />} />
				<Route path="/edit/:id" element={<InvoiceForm />} />
				<Route path="/view/:id" element={<Invoice />} />
			</Routes>
		</div>
	);
}

export default App;
