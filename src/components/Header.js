import React from "react";
import { useLocation } from "react-router-dom";

const Header = () => {
	const location = useLocation();

	const getPageTitle = () => {
		switch (location.pathname) {
			case "/":
				return "Phrase Generator";
			case "/what-is-gematria":
				return "What is Simple Gematria?";
			case "/score-calculator":
				return "Score Calculator";
			default:
				return "Simple Gematria";
		}
	};

	return (
		<header>
			<h1 className="header">{getPageTitle()}</h1>
		</header>
	);
};

export default Header;
