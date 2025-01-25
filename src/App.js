import { Routes, Route } from "react-router-dom";
import AppMenu from "./components/Menu";
import PhraseGenerator from "./pages/PhraseGenerator"; // Create this file
import WhatIsGematria from "./pages/WhatIsGematria"; // Placeholder for now

function App() {
	return (
		<div>
			<AppMenu />
			<Routes>
				<Route path="/" element={<PhraseGenerator />} />
				<Route path="/what-is-gematria" element={<WhatIsGematria />} />
			</Routes>
		</div>
	);
}

export default App;
