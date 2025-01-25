import React from "react";

const LoadingSpinner = ({ isLoading }) => {
	if (!isLoading) return null;

	return (
		<div className="loading-spinner">
			<p>Loading...</p>
		</div>
	);
};

export default LoadingSpinner;
