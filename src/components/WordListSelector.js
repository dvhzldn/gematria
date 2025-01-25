import React from "react";

const WordListSelector = ({
	wordLists,
	selectedWordList,
	handleWordListChange,
	includeOffensive,
	handleOffensiveToggle,
}) => {
	return (
		<div className="word-list-selector">
			<label htmlFor="wordListSelect" className="label">
				Dictionary:
			</label>
			<select
				id="wordListSelect"
				value={selectedWordList}
				onChange={handleWordListChange}
				className="select"
				aria-label="Word list selector"
			>
				{wordLists.map((list) => (
					<option key={list} value={list}>
						{list}
					</option>
				))}
			</select>
			<br />
			<label className="label">
				Include offensive words
				<input
					className="checkbox"
					type="checkbox"
					checked={includeOffensive}
					onChange={handleOffensiveToggle}
					aria-label="Include offensive words"
				/>
			</label>
		</div>
	);
};

export default WordListSelector;
