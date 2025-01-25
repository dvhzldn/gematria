import React from "react";
import { Link } from "react-router-dom";

const AppMenu = () => {
	return (
		<div className="menu">
			<nav>
				<ul className="menu-list">
					<li className="menu-item">
						<Link to="/" className="menu-link">
							Generator
						</Link>
					</li>
					<li className="menu-item">
						<Link to="/score-calculator" className="menu-link">
							Calculator
						</Link>
					</li>
					<li className="menu-item">
						<Link to="/what-is-gematria" className="menu-link">
							About
						</Link>
					</li>
				</ul>
			</nav>
		</div>
	);
};

export default AppMenu;
