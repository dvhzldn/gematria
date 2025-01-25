import React, { useState, useCallback } from "react";
import PhraseInput from "../components/PhraseInput";
import DisplayScore from "../components/DisplayScore";
import ActionButtons from "../components/ActionButtons";
import LoadingSpinner from "../components/LoadingSpinner";
import AlertBox from "../components/AlertBox";

const ScoreCalculator = () => {
	const [state, setState] = useState({
		phrase: "",
		score: null,
		isLoading: false,
		submittedPhrase: "",
	});
	const [alertMessage, setAlertMessage] = useState("");

	const calculateScore = useCallback(async () => {
		if (!state.phrase.trim()) {
			setAlertMessage("Enter some text");
			return null;
		}
		setState((prevState) => ({
			...prevState,
			score: null,
			isLoading: true,
		}));

		try {
			const response = await fetch(`/api/calculate`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ phrase: state.phrase }),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const data = await response.json();
			setState((prevState) => ({
				...prevState,
				score: data.score,
				submittedPhrase: state.phrase,
			}));
			return data.score;
		} catch (error) {
			console.error("Error calculating score:", error);
			return null;
		} finally {
			setState((prevState) => ({ ...prevState, isLoading: false }));
		}
	}, [state.phrase]);

	const handleGoClick = async () => {
		const score = await calculateScore();
		if (score) {
			// Since we aren't generating phrases in this page, we just display the score
		}
	};

	const handleReset = () => {
		setState((prevState) => ({
			phrase: "",
			score: null,
			submittedPhrase: "",
		}));
	};

	return (
		<div className={alertMessage ? "no-pointer-events" : ""}>
			<PhraseInput
				phrase={state.phrase}
				setPhrase={(phrase) =>
					setState((prevState) => ({ ...prevState, phrase }))
				}
				handleKeyPress={(event) => {
					if (event.key === "Enter") handleGoClick();
				}}
				calculateScore={calculateScore}
			/>
			<ActionButtons
				handleGenerate={handleGoClick}
				handleReset={handleReset}
			/>
			<LoadingSpinner isLoading={state.isLoading} />
			<AlertBox message={alertMessage} onClose={() => setAlertMessage("")} />
			<DisplayScore
				submittedPhrase={state.submittedPhrase}
				score={state.score}
			/>
		</div>
	);
};

export default ScoreCalculator;
