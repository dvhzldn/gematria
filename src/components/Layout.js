import React from "react";
import Header from "./Header";
import AppMenu from "./Menu";

const Layout = ({ children }) => {
	return (
		<div className="container">
			<AppMenu />
			<Header />
			<main>{children}</main>
		</div>
	);
};

export default Layout;
