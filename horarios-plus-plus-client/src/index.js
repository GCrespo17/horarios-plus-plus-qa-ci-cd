import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals.js";

import LandingInterface from "./Interfaces/LandingInterface.tsx";
import GenerationInterface from "./Interfaces/GenerationInterface.tsx";
import LogInInterface from "./Interfaces/LogInInterface.tsx";
import SignUpInterface from "./Interfaces/SignUpInterface.tsx";
import MySheduleInterface from "./Interfaces/MyScheduleInterface.tsx";
import TimeBlockInterface from "./Interfaces/TimeBlockInterface.tsx";
import PermsInterface from "./Interfaces/PermsPage.tsx";
import EventsInterface from "./Interfaces/EventsInterface.tsx";

import { BrowserRouter, Route, Routes } from "react-router-dom";

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/">
					<Route index element={<LandingInterface />} />
					<Route path="generation" element={<GenerationInterface />} />
					<Route path="time_blocks" element={<TimeBlockInterface />} />
					<Route path="login" element={<LogInInterface />} />
					<Route path="sign_up" element={<SignUpInterface />} />
					<Route path="schedule" element={<MySheduleInterface />} />
					<Route path="perms" element={<PermsInterface />} />
					<Route path="events" element={<EventsInterface />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

window.addEventListener("beforeunload", (event) => {
	// Tu código aquí
	console.log("El usuario está cerrando la página");
	// Si deseas mostrar un mensaje de confirmación antes de cerrar, descomenta la siguiente línea:
	// event.returnValue = '¿Estás seguro de que quieres salir?';
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
