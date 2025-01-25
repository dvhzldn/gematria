import React, { useState, useEffect, useRef, useCallback } from "react";
import PhraseInput from "../components/PhraseInput";
import DisplayScore from "../components/DisplayScore";
import PhraseList from "../components/PhraseList";
import ActionButtons from "../components/ActionButtons";
import WordListSelector from "../components/WordListSelector";
import LoadingSpinner from "../components/LoadingSpinner";
import AlertBox from "../components/AlertBox";

const PhraseGenerator = () => {
	const [state, setState] = useState({
		phrase: "",
		score: null,
		generatedPhrases: [],
		isLoading: false,
		submittedPhrase: "",
		includeOffensive: false,
		wordLists: [],
		selectedWordList: "oxford_3000",
	});
	const [alertMessage, setAlertMessage] = useState("");
	const hasFetched = useRef(false);

	useEffect(() => {
		if (!hasFetched.current) {
			const fetchWordLists = async () => {
				try {
					const cachedData = localStorage.getItem("wordLists");
					if (cachedData) {
						setState((prevState) => ({
							...prevState,
							wordLists: JSON.parse(cachedData),
						}));
						return;
					}
					const response = await fetch(`/api/word-lists`);
					if (!response.ok) {
						throw new Error(`HTTP error! Status: ${response.status}`);
					}
					const data = await response.json();
					setState((prevState) => ({
						...prevState,
						wordLists: data.wordLists,
						selectedWordList: "oxford_3000",
					}));
					localStorage.setItem(
						"wordLists",
						JSON.stringify(data.wordLists)
					);
				} catch (error) {
					console.error("Error fetching word lists:", error);
				}
			};

			fetchWordLists();
			hasFetched.current = true;
		}
	}, []);

	const calculateScore = useCallback(async () => {
		if (!state.phrase.trim()) {
			setAlertMessage("Enter some text");
			return null;
		}
		setState((prevState) => ({
			...prevState,
			generatedPhrases: [],
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

	const generatePhrases = useCallback(
		async (score) => {
			if (!score || isNaN(score)) {
				setAlertMessage(
					"Invalid score. Please calculate a valid score first."
				);
				return;
			}

			if (!state.selectedWordList) {
				setAlertMessage("Select a valid word list.");
				return;
			}

			try {
				const response = await fetch(`/api/generate-stream`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						score,
						theme: state.includeOffensive ? "offensive" : null,
						wordList: state.selectedWordList,
					}),
				});

				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}

				const reader = response.body.getReader();
				const decoder = new TextDecoder();
				let buffer = "";

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					buffer += decoder.decode(value, { stream: true });

					const lines = buffer.split("\n");
					buffer = lines.pop();

					for (const line of lines) {
						if (line.trim() === "") continue;
						try {
							const phrase = JSON.parse(line).phrase;
							const filteredPhrase = phrase
								.split(" ")
								.filter((word) => word.length > 1)
								.join(" ");
							setState((prevState) => ({
								...prevState,
								generatedPhrases: [
									...prevState.generatedPhrases,
									filteredPhrase,
								],
							}));
						} catch (error) {
							console.error("Error parsing JSON:", error);
						}
					}
				}
			} catch (error) {
				console.error("Error generating phrases:", error);
			}
		},
		[state.includeOffensive, state.selectedWordList]
	);

	const handleGoClick = async () => {
		const score = await calculateScore();
		if (score) {
			await generatePhrases(score);
		}
	};

	const handleReset = () => {
		setState((prevState) => ({
			phrase: "",
			score: null,
			generatedPhrases: [],
			submittedPhrase: "",
			includeOffensive: prevState.includeOffensive,
			wordLists: prevState.wordLists,
			selectedWordList: prevState.selectedWordList,
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
			<WordListSelector
				wordLists={state.wordLists}
				selectedWordList={state.selectedWordList}
				handleWordListChange={(e) =>
					setState((prevState) => ({
						...prevState,
						selectedWordList: e.target.value,
					}))
				}
				includeOffensive={state.includeOffensive}
				handleOffensiveToggle={() =>
					setState((prevState) => ({
						...prevState,
						includeOffensive: !prevState.includeOffensive,
					}))
				}
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
			<PhraseList generatedPhrases={state.generatedPhrases} />
		</div>
	);
};

export default PhraseGenerator;
