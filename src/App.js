import React, { useState, useEffect, useRef, useCallback } from "react";

const commonStyles = {
	fontFamily: "'Poppins', Arial, sans-serif",
	borderRadius: "8px",
};

const containerStyle = {
	...commonStyles,
	maxWidth: "400px",
	margin: "0 auto",
};

const buttonContainerStyle = {
	display: "flex",
	justifyContent: "space-between",
	gap: "20px",
};

const headerStyle = {
	...commonStyles,
	textAlign: "center",
	lineHeight: "0.5",
	fontSize: "2rem",
	fontWeight: "lighter",
	color: "#000",
	animation: "bounceIn 1s ease-in-out",
};

const centeredStyle = {
	display: "flex",
	justifyContent: "center",
};

const inputStyle = {
	...commonStyles,
	padding: "12px",
	marginBottom: "12px",
	border: "1px solid #767676",
	width: "93%",
	fontSize: "1.4rem",
};

const labelStyle = {
	textAlign: "left",
	padding: "0px",
	fontSize: "1.1rem",
	color: "#333",
};

const selectStyle = {
	...commonStyles,
	padding: "2px",
	margin: "5px",
};

const checkboxStyle = {
	...commonStyles,
	transform: "scale(2)",
	marginLeft: "20px",
};

const buttonBaseStyle = {
	...commonStyles,
	flex: 1,
	marginTop: "10px",
	padding: "10px",
	fontSize: "1.5rem",
	border: "0px",
	cursor: "pointer",
	transition: "all 0.1s ease-in-out",
};

const goButtonStyle = {
	...buttonBaseStyle,
	backgroundColor: "#34eb77",
};

const resetButtonStyle = {
	...buttonBaseStyle,
	backgroundColor: "#cf4444",
	color: "white",
};

const scoreBoxStyle = {
	...commonStyles,
	fontSize: "1.2rem",
	color: "#000",
	backgroundColor: "rgba(13, 199, 255, 0.8)",
	border: "1px solid #767676",
	padding: "10px",
	animation: "bounceIn 1s ease-in-out",
};

const phraseContainerStyle = {
	...commonStyles,
	maxHeight: "40vh",
	overflowY: "auto",
	padding: "1px",
	backgroundColor: "rgba(13, 199, 255, 0.8)",
	border: "1px solid #767676",
	borderRadius: "8px",
};

const phraseHeadingStyle = {
	textDecorationLine: "underline",
	marginTop: "3px",
	textAlign: "center",
};

const phraseHelpStyle = {
	fontSize: "0.8rem",
	textAlign: "left",
	color: "#333",
};

const phraseListStyle = {
	listStyleType: "none",
	padding: "0",
	margin: "0",
};

const phraseItemStyle = {
	...commonStyles,
	textAlign: "left",
	color: "#000",
	marginBottom: "2px",
	marginLeft: "15px",
	fontWeight: "lighter",
	fontSize: "1.1rem",
	animation: "fadeIn 0.1s ease-in-out",
};

const keyframesStyle = `

  @keyframes bounceIn {
    0% { transform: scale(0.8); opacity: 0; }
    50% { transform: scale(1.2); opacity: 0.5; }
    100% { transform: scale(1); opacity: 1; }
  }
`;

const App = () => {
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
		<main style={containerStyle}>
			<h1 style={headerStyle}>Simple Gematria</h1>
			<h1 style={headerStyle}>Phrase Generator</h1>

			<style>{keyframesStyle}</style>

			<section>
				<div>
					<label htmlFor="phrase" style={labelStyle}>
						Phrase:
					</label>
					<p id="phraseHelp" style={phraseHelpStyle}>
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
						style={inputStyle}
						onFocus={(e) =>
							(e.target.style.boxShadow = "0 0 8px #261173")
						}
						onBlur={(e) => (e.target.style.boxShadow = "none")}
						onKeyDown={(e) => handleKeyPress(e, calculateScore)}
						aria-required="true"
						aria-describedby="phraseHelp"
					/>
					<div>
						<label htmlFor="wordListSelect" style={labelStyle}>
							Dictionary:
						</label>
						<select
							id="wordListSelect"
							value={state.selectedWordList}
							onChange={handleWordListChange}
							style={selectStyle}
							aria-label="Word list selector"
						>
							{state.wordLists.map((list) => (
								<option key={list} value={list}>
									{list}
								</option>
							))}
						</select>
						<br />
						<label style={labelStyle}>
							Include offensive words
							<input
								style={checkboxStyle}
								type="checkbox"
								checked={state.includeOffensive}
								onChange={handleOffensiveToggle}
								aria-label="Include offensive words"
							/>
						</label>
					</div>
				</div>

				<div style={buttonContainerStyle}>
					<button
						onClick={handleGoClick}
						style={goButtonStyle}
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
						style={resetButtonStyle}
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
					<div style={centeredStyle}>
						<p style={scoreBoxStyle}>
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
						<div style={phraseContainerStyle}>
							<h3 style={phraseHeadingStyle}>Matching phrases:</h3>
							<ul style={phraseListStyle}>
								{state.generatedPhrases.map((phrase, index) => (
									<li
										key={index}
										style={{
											...phraseItemStyle,
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

export default App;
