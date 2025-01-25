import React from "react";

const PhraseList = ({ generatedPhrases }) => {
	if (generatedPhrases.length === 0) {
		return null;
	}

	return (
		<div className="phrase-container">
			<h3 className="phrase-heading">Matching phrases:</h3>
			<ul className="phrase-list">
				{generatedPhrases.map((phrase, index) => (
					<li
						key={index}
						className="phrase-item"
						style={{
							animationDelay: `${index * 0.05}s`,
						}}
					>
						{phrase}
					</li>
				))}
			</ul>
		</div>
	);
};

export default PhraseList;
