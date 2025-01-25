import React, { useState, useEffect, useRef, useCallback } from "react";

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

	const apiUrl = "";
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
	}, [apiUrl]);

	const calculateScore = useCallback(async () => {
		if (!state.phrase.trim()) {
			showAlert("Enter some text");
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
	}, [apiUrl, state.phrase]);

	const generatePhrases = useCallback(
		async (score) => {
			if (!score || isNaN(score)) {
				showAlert("Invalid score. Please calculate a valid score first.");
				return;
			}

			if (!state.selectedWordList) {
				showAlert("Select a valid word list.");
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
		[apiUrl, state.includeOffensive, state.selectedWordList]
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

	const handleWordListChange = (e) => {
		setState((prevState) => ({
			...prevState,
			selectedWordList: e.target.value,
		}));
	};

	const handleOffensiveToggle = () => {
		setState((prevState) => ({
			...prevState,
			includeOffensive: !prevState.includeOffensive,
		}));
	};

	const handleKeyPress = (event, buttonClickHandler) => {
		if (event.key === "Enter") {
			event.preventDefault();
			buttonClickHandler();
		}
	};

	const showAlert = (message) => {
		const alertBox = document.createElement("div");
		alertBox.textContent = message;
		alertBox.style.position = "fixed";
		alertBox.style.top = "300px";
		alertBox.style.left = "50%";
		alertBox.style.transform = "translateX(-50%)";
		alertBox.style.backgroundColor = "#000";
		alertBox.style.color = "#fff";
		alertBox.style.padding = "10px 20px";
		alertBox.style.borderRadius = "8px";
		alertBox.style.textAlign = "center";
		alertBox.style.fontSize = "3rem";
		alertBox.style.fontFamily = "'Poppins', Arial, sans-serif";
		alertBox.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
		alertBox.style.zIndex = 1000;
		alertBox.style.animation = "fadeOut 2s forwards";

		document.body.appendChild(alertBox);

		setTimeout(() => {
			document.body.removeChild(alertBox);
		}, 2000);
	};

	return (
		<main className="container">
			<h1 className="header">Simple Gematria</h1>
			<h1 className="header">Phrase Generator</h1>

			<section>
				<div>
					<label htmlFor="phrase" className="label">
						Phrase:
					</label>
					<p id="phraseHelp" className="phrase-help">
						Enter a word or phrase to calculate its score and generate
						phrases with a matching score. This field is required.
					</p>
					<input
						id="phrase"
						type="text"
						value={state.phrase}
						onChange={(e) =>
							setState((prevState) => ({
								...prevState,
								phrase: e.target.value,
							}))
						}
						placeholder="Enter a word or phrase"
						className="input"
						onFocus={(e) =>
							(e.target.style.boxShadow = "0 0 8px #261173")
						}
						onBlur={(e) => (e.target.style.boxShadow = "none")}
						onKeyDown={(e) => handleKeyPress(e, calculateScore)}
						aria-required="true"
						aria-describedby="phraseHelp"
					/>
					<div>
						<label htmlFor="wordListSelect" className="label">
							Dictionary:
						</label>
						<select
							id="wordListSelect"
							value={state.selectedWordList}
							onChange={handleWordListChange}
							className="select"
							aria-label="Word list selector"
						>
							{state.wordLists.map((list) => (
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
								checked={state.includeOffensive}
								onChange={handleOffensiveToggle}
								aria-label="Include offensive words"
							/>
						</label>
					</div>
				</div>

				<div className="button-container">
					<button
						onClick={handleGoClick}
						className="button button-go"
						onMouseEnter={(e) =>
							(e.target.style.backgroundColor = "#05f75e")
						}
						onMouseLeave={(e) =>
							(e.target.style.backgroundColor = "#34eb77")
						}
						aria-label="Calculate phrase score"
					>
						Go
					</button>
					<button
						onClick={handleReset}
						className="button button-reset"
						onMouseEnter={(e) =>
							(e.target.style.backgroundColor = "#000")
						}
						onMouseLeave={(e) =>
							(e.target.style.backgroundColor = "#cf4444")
						}
						aria-label="Reset text input and clear results"
					>
						Reset
					</button>
				</div>

				{state.isLoading && <p>Loading...</p>}
				{!state.isLoading && state.score !== null && (
					<div className="centered">
						<p className="score-box">
							{state.submittedPhrase && (
								<>
									{state.submittedPhrase} is{" "}
									<strong>{state.score}</strong>
								</>
							)}
						</p>
					</div>
				)}
			</section>

			<section>
				<div
					id="generatedPhrases"
					tabIndex="-1"
					style={{ marginTop: "0px" }}
				>
					{state.generatedPhrases.length > 0 && (
						<div className="phrase-container">
							<h3 className="phrase-heading">Matching phrases:</h3>
							<ul className="phrase-list">
								{state.generatedPhrases.map((phrase, index) => (
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
					)}
				</div>
			</section>
		</main>
	);
};

export default PhraseGenerator;
