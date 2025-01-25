import React from "react";

const ActionButtons = ({ handleGenerate, handleReset }) => {
	return (
		<div className="button-container">
			<button className="button button-go" onClick={handleGenerate}>
				Go
			</button>
			<button className="button button-reset" onClick={handleReset}>
				Reset
			</button>
		</div>
	);
};

export default ActionButtons;
