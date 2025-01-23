import React, { useState, useEffect, useRef, useCallback } from "react";

const commonStyles = {
	fontFamily: "'Poppins', Arial, sans-serif",
	borderRadius: "8px",
	transition: "box-shadow 0.3s ease-in-out",
};

const containerStyle = {
	padding: "20px",
	maxWidth: "400px",
	margin: "0 auto",
};

const headerStyle = {
	textAlign: "center",
	fontSize: "3rem",
	fontWeight: "bold",
	color: "#000",
	animation: "bounce 20s infinite",
};

const inputStyle = {
	...commonStyles,
	padding: "8px",
	marginBottom: "12px",
	border: "1px solid #000",
	width: "95%",
};

const selectStyle = {
	padding: "5px",
	fontFamily: "'Poppins', Arial, sans-serif",
};

const checkboxLabelStyle = {
	fontFamily: "'Poppins', Arial, sans-serif",
};

const buttonBaseStyle = {
	...commonStyles,
	flex: 1,
	padding: "10px",
	fontSize: "1.5rem",
	border: "1px solid #000000",
	cursor: "pointer",
	transition: "all 0.1s ease-in-out",
};

const goButtonStyle = {
	...buttonBaseStyle,
	backgroundColor: "#34eb77",
	color: "white",
};

const resetButtonStyle = {
	...buttonBaseStyle,
	backgroundColor: "#cf4444",
	color: "white",
};

const scoreBoxStyle = {
	...commonStyles,
	fontSize: "1.2rem",
	fontWeight: "bolder",
	color: "#fff",
	backgroundColor: "rgba(52, 52, 52, 0.3)",
	border: "1px solid #000000",
	padding: "10px",
	textAlign: "center",
	animation: "bounceIn 1s ease-in-out",
};

const phraseContainerStyle = {
	maxHeight: "50vh",
	overflowY: "auto",
	padding: "1px",
	backgroundColor: "rgba(52, 52, 52, 0.3)",
	border: "1px solid #000000",
	borderRadius: "8px",
};

const phraseItemStyle = {
	fontFamily: "'Poppins', Arial, sans-serif",
	color: "#fff",
	padding: "2px",
	textAlign: "center",
	marginBottom: "2px",
	fontWeight: "lighter",
	fontSize: "0.9rem",
	animation: "fadeIn 0.1s ease-in-out",
};

const keyframesStyle = `
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-20px); }
    60% { transform: translateY(-10px); }
  }

  @keyframes bounceIn {
    0% { transform: scale(0.8); opacity: 0; }
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
		includeOffensive: true,
		wordLists: [],
		selectedWordList: "oxford_3000",
	});

	const apiUrl = process.env.REACT_APP_API_URL;
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
					const response = await fetch(`${apiUrl}/word-lists`);
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
			const response = await fetch(`${apiUrl}/calculate`, {
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
				const response = await fetch(`${apiUrl}/generate-stream`, {
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
		} else {
		}
	};

	const handleReset = () => {
		setState({
			phrase: "",
			score: null,
			generatedPhrases: [],
			submittedPhrase: "",
		});
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
			<h1 style={headerStyle}>Unreal Tom Numbers</h1>

			<style>{keyframesStyle}</style>

			<section>
				<div>
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
						placeholder="Enter a word or phrase to be calculated"
						style={inputStyle}
						onFocus={(e) =>
							(e.target.style.boxShadow = "0 0 8px #261173")
						}
						onBlur={(e) => (e.target.style.boxShadow = "none")}
						onKeyDown={(e) => handleKeyPress(e, calculateScore)}
					/>
					<div style={{ margin: "10px 0" }}>
						<label
							htmlFor="wordListSelect"
							style={{ marginRight: "10px" }}
						>
							Select Word List:
						</label>
						<select
							id="wordListSelect"
							value={state.selectedWordList}
							onChange={handleWordListChange}
							style={selectStyle}
						>
							{state.wordLists.map((list) => (
								<option key={list} value={list}>
									{list}
								</option>
							))}
						</select>
					</div>
					<div style={{ marginTop: "10px" }}>
						<label style={checkboxLabelStyle}>
							Include offensive words
							<input
								type="checkbox"
								checked={state.includeOffensive}
								onChange={handleOffensiveToggle}
								style={{ marginRight: "8px" }}
							/>
						</label>
					</div>
				</div>

				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						gap: "10px",
					}}
				>
					<button
						onClick={handleGoClick}
						style={goButtonStyle}
						onMouseEnter={(e) =>
							(e.target.style.backgroundColor = "#05f75e")
						}
						onMouseLeave={(e) =>
							(e.target.style.backgroundColor = "#34eb77")
						}
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
					>
						Reset
					</button>
				</div>

				{state.isLoading && <p>Loading...</p>}
				{!state.isLoading && state.score !== null && (
					<div style={{ display: "flex", justifyContent: "center" }}>
						<p style={scoreBoxStyle}>
							{state.submittedPhrase &&
								`${state.submittedPhrase} is ${state.score}`}
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
							<h5
								style={{
									color: "#fff",
									textAlign: "center",
									textDecorationLine: "underline",
								}}
							>
								Matching phrases:
							</h5>
							<ul
								style={{
									listStyleType: "none",
									padding: "0",
									margin: "0",
								}}
							>
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
