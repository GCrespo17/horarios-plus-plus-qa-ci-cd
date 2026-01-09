import React from "react";
import { useState } from "react";
import NavigationBar from "./NavigationBar";
import "./MyScheduleInterface.css";
import toast, { Toaster } from "react-hot-toast";
import { apiBaseUrl, buildApiUrl } from "./helpers.tsx";

import type {
	ISchedule,
	ISection,
	ISubject,
	ISession,
} from "./ScheduleViewer.tsx";
import ScheduleViewer from "./ScheduleViewer.tsx";
import type { Session } from "../../../horarios-plus-plus-server-new/src/models/classes.ts";

interface visorEntradaProperties {
	horarioEntrada: ISchedule;
}

function VisorEventos({
	horarioEntrada,
	
}: visorEntradaProperties) {
	
	interface ISession {
		day: number;
		start: Date;
		end: Date;
		event: IEvent;
	}
	
	interface IEvent {
		name: string;
		sessions: Array<ISession>;
	}


	const [horario, setHorario] = useState<ISchedule|undefined>(horarioEntrada);
	const [selectedEvent, setSelectedEvent] = useState<string>("");
	const [events, setEvents] = useState(new Array<IEvent>());


	function handleEventSelection(event: string) {
		setSelectedEvent(event);
	}

	async function fetchEvents() {
		try {
			const response = await fetch(
				buildApiUrl("/api/events/get_all_events"),
			);
			const data = await response.json();
			setEvents(data);
		} catch (error) {
			console.error("Error fetching events:", error);
		}
	}

	React.useEffect(() => {
		fetchEvents();
	}, []);

	function puedeAsistir(session: ISession, horario: ISchedule) {
		console.log(session);
		console.log(horario);
		
			for (const section of horario.sectionList) {
				for (const sesion of section.sessionList) {
					if (sesion.day === session.day) {
						const session1 = {
							start: new Date(sesion.start),
							end: new Date(sesion.end),
						};
						const session2 = {
							start: new Date(session.start),
							end: new Date(session.end),
						};
						if (
							((session1.start.getTime() >= session2.start.getTime()) &&
							(session1.start.getTime() <= session2.end.getTime()))||(
								(session1.end.getTime() >= session2.start.getTime()) && 
								(session1.end.getTime() <= session2.end.getTime())
							)
						) {
							return false;
						}
					}
				}
			}
		
		return true;
	}

	return (
		<div className="visor-eventos">
			<select className="selector-eventos" value={selectedEvent} onChange={(e) => handleEventSelection(e.target.value)}>
				<option value="">Selecciona un evento</option>
				{/* Map over the events and create an option for each one */}
				{events.map((event) => (
					<option key={event._id} value={event._id.toString()}>
						{event.name}
					</option>
				))}
			</select>
			{selectedEvent && (
				<div>
					{/* Add additional details or components to display the event */}
					{events.map((event) => {
						if (event._id.toString() === selectedEvent) {
							return (
								<div className="puede-asistir">
									<h1>{event.name}</h1>
									{event.sessions.map((session) => {
										const inicio=new Date(session.start)
										const fin=new Date(session.end)
										
										return (
											<div>
												<p>Dia: {session.day}</p>
												<p>Comienzo: {inicio.toLocaleTimeString()}</p>
												<p>Final: {fin.toLocaleTimeString()}</p>
												{puedeAsistir(session, horario) ? (
													<p className="puede">Puedes ir a este evento</p>
												) : (
													<p className="no-puede">Perdón, no puedes ir a este evento</p>
												)}
											</div>)
										
									})}
								</div>
							);
						}
					})}
				</div>
			)}
		</div>
	);
}

export default function MySheduleInterface() {
	const email = sessionStorage.getItem("login");
	const [loadedSchedule, setLoadedSchedule] = React.useState<ISchedule | undefined>();

	async function fetchSubjectFromNRC(
		nrc: string,
		section: ISection,
	): Promise<ISubject> {
		const url = new URL(
			"/api/subjects/get_subject_from_nrc",
			apiBaseUrl,
		);
		url.searchParams.set("nrc", nrc);
		return await fetch(url.toString(), {
			headers: { Accept: "application/json" },
		})
			.then((response) => response.json())
			.then((data) => {
				const newSubject: ISubject = {
					color: undefined,
					name: data.name,
				};
				return newSubject;
			});
	}

	async function loadSectionFromID(id: string): Promise<ISection> {
		let fetched = true;
		const sectionUrl = new URL(
			"/api/section/get_sections_from_id",
			apiBaseUrl,
		);
		sectionUrl.searchParams.set("id", id);
		const section: ISection = await fetch(sectionUrl.toString(), {
			headers: { Accept: "application/json" },
		})
			.then((response) => response.json())
			.catch((e) => {
				fetched = false;
				console.error("ERROR Loading section ", e);
			})
			.then(async (data) => {
				const newSection: ISection = {
					nrc: data.nrc,
					sessionList: [],
					subject:{color: undefined, name: ""},
				};
				newSection.sessionList= data.sessions.map((session:ISession) => {
					return {
						day: session.day,
						start: new Date(session.start),
						end: new Date(session.end),
						section: newSection
					};
				})				
				newSection.subject = await fetchSubjectFromNRC(data.nrc, newSection);
				return newSection;
			});
		return section;
	}

	async function getSchedule() {
		let fetched = true;
		const scheduleUrl = new URL(
			"/api/schedule/get_schedule_from_owner",
			apiBaseUrl,
		);
		if (email) {
			scheduleUrl.searchParams.set("owner", email);
		}
		return await fetch(scheduleUrl.toString(), {
			headers: { Accept: "application/json" },
		})
			.then((response) => response.json())
			.catch((e) => {
				fetched = false;
				console.error("ERROR loading user schedule ", e);
			})
			.then(async (data) => {
				if (!fetched) {
					return { sectionList: [] };
				}
				console.log(data);
				const newSchedule: ISchedule = {
					sectionList: await Promise.all(
						data.map(async (id: string) => {
							return await loadSectionFromID(id);
						}),
					),
				};
				if(newSchedule.sectionList.length === 0){
					sessionStorage.setItem("failedSchedule", "true");
					window.location.href = "/";
				}
				console.log(newSchedule);
				return newSchedule;
			});
	}

	React.useEffect(() => {
		(async () => {
			if (loadedSchedule) {
				return;
			}
			setLoadedSchedule(await getSchedule());			
		})();
	});

	return (
		<div>
			<Toaster
				position="bottom-right"
				reverseOrder={false}
				/>
			<NavigationBar />
			<div className="main-container">
				{loadedSchedule !== undefined && (
					<ScheduleViewer loadedSchedule={loadedSchedule} />
				)}
				{loadedSchedule !== undefined && (
				<VisorEventos horarioEntrada={loadedSchedule}/>)}
			</div>

			

			
		</div>
	);
}
