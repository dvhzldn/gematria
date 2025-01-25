import React from "react";

const AlertBox = ({ message, onClose }) => {
	if (!message) return null;

	return (
		<div className="alert-box">
			<p>{message}</p>
			<button onClick={onClose} className="close-button">
				Close
			</button>
		</div>
	);
};

export default AlertBox;
