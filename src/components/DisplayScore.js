import React from "react";

const DisplayScore = ({ submittedPhrase, score, isLoading }) => {
	if (isLoading) {
		return <p>Loading...</p>;
	}

	if (score !== null) {
		return (
			<div className="centered">
				<p className="score-box">
					{submittedPhrase && (
						<>
							{submittedPhrase} is <strong>{score}</strong>
						</>
					)}
				</p>
			</div>
		);
	}

	return null;
};

export default DisplayScore;
