import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const AppMenu = () => {
	const [menuOpen, setMenuOpen] = useState(false);

	const toggleMenu = () => {
		setMenuOpen(!menuOpen);
	};

	return (
		<div className="relative">
			{/* Menu Icon */}
			<button
				className="p-2 text-gray-700 hover:text-gray-900 focus:outline-none"
				onClick={toggleMenu}
				aria-label="Toggle menu"
			>
				{menuOpen ? <X size={24} /> : <Menu size={24} />}
			</button>

			{/* Overlay */}
			{menuOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-40"
					onClick={toggleMenu}
					aria-label="Close menu"
				></div>
			)}

			{/* Menu */}
			<div
				className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-all duration-300 ease-in-out ${
					menuOpen ? "translate-x-0" : "translate-x-full"
				}`}
			>
				<div className="p-4 border-b border-gray-200">
					<h2 className="text-xl font-semibold">Menu</h2>
				</div>
				<nav className="p-4">
					<ul className="space-y-4">
						<li>
							<Link
								to="/phrase-generator"
								className="text-gray-800 hover:text-blue-600"
								onClick={toggleMenu}
								aria-label="Go to Phrase Generator"
							>
								Phrase Generator
							</Link>
						</li>
						<li>
							<Link
								to="/what-is-gematria"
								className="text-gray-800 hover:text-blue-600"
								onClick={toggleMenu}
								aria-label="Go to What is Gematria?"
							>
								What is Gematria?
							</Link>
						</li>
					</ul>
				</nav>
			</div>
		</div>
	);
};

export default AppMenu;
