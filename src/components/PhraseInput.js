import React from "react";

const PhraseInput = ({ phrase, setPhrase, handleKeyPress, calculateScore }) => {
	return (
		<div>
			<p id="phraseHelp" className="phrase-help">
				Enter a word or phrase to calculate its score. This field is
				required.
			</p>
			<input
				id="phrase"
				type="text"
				value={phrase}
				onChange={(e) => setPhrase(e.target.value)}
				placeholder="Enter a word or phrase"
				className="input"
				onFocus={(e) => (e.target.style.boxShadow = "0 0 8px #261173")}
				onBlur={(e) => (e.target.style.boxShadow = "none")}
				onKeyDown={(e) => handleKeyPress(e, calculateScore)}
				aria-required="true"
				aria-describedby="phraseHelp"
			/>
		</div>
	);
};

export default PhraseInput;
