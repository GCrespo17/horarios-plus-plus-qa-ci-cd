import React, { type MouseEventHandler } from "react";

import CourseSemesterContainer from "./CourseSemesterContainer";
import NavigationBar from "./NavigationBar";
import "./EventsInterface.css";
import toast, {Toaster} from "react-hot-toast";
import { apiBaseUrl, buildApiUrl } from "./helpers.tsx";


interface ISession {
	day: number;
	start: Date;
	end: Date;
	event: IEvent;
}

interface CISection {
	newSection: ISection;
	oldSection: ISection;
}

interface ISection {
	nrc: string;
	teacher: string;
	subject: IEvent;
	sessionList: Array<ISession>;
}

interface IEvent {
	name: string;
	sessionLista: Array<ISession>;
}

interface CIEvent {
	newEvent: IEvent;
	oldEvent: IEvent;
}

interface ICareer {
	name: string;
	subjects: Array<IEvent>
}

interface EditableSectionContainerProperties {
	selectedEvent: IEvent;
	puedeActualizar: any;
	addClassBind: any;
	removeClassBind: any;
	updateClassBind: any;
	saveDataBind: any;
	cambio: boolean;
	setCambio: any;
}

interface HourSelectorProperties {
	changeBind: any;
	dateBind: Date;
	cambio: boolean;
	setCambio: any;
}

interface CourseProperties {
	displayEvent: IEvent;
	newSectionBind: any;
	removeSectionBind: any;
	selectSectionBind: any;
	editable: boolean;
	puedeCambiar: any;
	setPuedeGuardar: any;
	removeEventBind: any;
	cambio: boolean;
	setCambio: any;
	hayRepetidos: any;
	updateBind: any;
}

interface DaySelectorProperties {
	changeBind: any;
	classBind: ISession;
	cambio: boolean
	setCambio: any;
}

interface TimeBlockProperties {
	changeBind: any;
	classBind: ISession;
	cambio: boolean;
	setCambio: any;
}

interface ActionableButton {
	action: MouseEventHandler;
}

function Course({
	displayEvent,
	newSectionBind,
	removeSectionBind,
	selectSectionBind,
	removeEventBind,
	updateBind,
	editable,
	puedeCambiar,
	setPuedeGuardar,
	cambio,
	setCambio,
	hayRepetidos
}: CourseProperties) {
	const [subjectName, setSubjectName] = React.useState(displayEvent.name);

	React.useEffect(() => {
		if(cambio){
			setSubjectName(displayEvent.name);
			setCambio(false);
			if(!puedeCambiar(displayEvent,displayEvent,true)){
				setNameError(true);
				setPuedeGuardar(false);
			}else{
				setPuedeGuardar(true);
				setNameError(false);
			}
		}
	},[cambio]);

	function addNewSection() {
		displayEvent = newSectionBind(displayEvent);
	}

	function removeExistingSection(event: IEvent) {
		displayEvent = removeSectionBind(displayEvent, event);
	}

	const [nameError, setNameError] = React.useState(false);
	const nameErrorMessage = "Nombre de curso ya existente";

	function updateSubject(event: any) {
		setSubjectName(event.target.value);
		const newEvent = event.target.value;
		let newCourse: IEvent = displayEvent;
		newCourse = {
			...newCourse,
			name: newEvent,
		};
		if(!puedeCambiar(displayEvent,newCourse,false)){
			setNameError(true);
			setPuedeGuardar(false);
		}else{
			updateBind(displayEvent, newCourse);
			setPuedeGuardar(true);
			setNameError(false);
		}
	}


	function deleteEvent() {
		hayRepetidos();
		removeEventBind(displayEvent, displayEvent.sessionLista[0]);
	}

	return (
		<div>
			<div className="course">
				{!editable && (
				<><div className="course-name">{displayEvent.name}</div>
				<div className="add-section">
					<button onClick={() => selectSectionBind(displayEvent)} type="button">
						Ver Evento
					</button>
				</div></>
				)}
				{editable && (
					<> 
					<div className="inputs">
						{nameError && <div className="name-error">{nameErrorMessage}</div>}
						<input className="course-name"
							value={subjectName}
							onChange={updateSubject}
							placeholder="Nombre de la materia"
							type="text"
						/>
					</div>
					<div className="delete-section">
						<button onClick={deleteEvent} type="button">
							Remover Evento
						</button>
					</div></>
				)}
				
			</div>
			<div>
				{displayEvent?.sessionLista.map((value) => {
					return (
						<div className="section">
							<div>
								<button onClick={() => selectSectionBind(value)} type="button">
									NRC: {value.nrc}
								</button>
							</div>
							{!editable && (
								<div className="delete-section">
									<button
										onClick={() => removeExistingSection(value)} type="button">
										{" "}
										Remover{" "}
									</button>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

function HourSelector({ changeBind, dateBind , cambio, setCambio}: HourSelectorProperties) {
	// we use new Date() to avoid changing it HERE by reference
	// Since we want to change it in the changeBind, not here
	const [hours, setHours] = React.useState(dateBind.getHours());
	const [minutes, setMinutes] = React.useState(dateBind.getMinutes());

	React.useEffect(() => {
		if(cambio){
			setHours(dateBind.getHours());
			setMinutes(dateBind.getMinutes());
			setCambio(false);
		}
	}, [cambio]);
	const handleHourChange = (event: any) => {
		let toSend = new Date(0);
		setHours(event.target.value);
		toSend.setHours(event.target.value);
		toSend.setMinutes(dateBind.getMinutes());
		changeBind(toSend);
	};

	const handleMinutesChange = (event: any) => {
		let toSend = new Date(0);
		toSend.setHours(dateBind.getHours());
		setMinutes(event.target.value);
		toSend.setMinutes(event.target.value);
		changeBind(toSend);
	};

	return (
		<div className="hour-selection-container">
			<select value={hours} onChange={handleHourChange}>
				<option value="6">6</option>
				<option value="7">7</option>
				<option value="8">8</option>
				<option value="9">9</option>
				<option value="10">10</option>
				<option value="11">11</option>
				<option value="12">12</option>
				<option value="13">13</option>
				<option value="14">14</option>
				<option value="15">15</option>
				<option value="16">16</option>
				<option value="17">17</option>
				<option value="18">18</option>
				<option value="19">19</option>
				<option value="20">20</option>
			</select>
			<select value={minutes} onChange={handleMinutesChange}>
				<option value="00">00</option>
				<option value="15">15</option>
				<option value="30">30</option>
				<option value="45">45</option>
			</select>
		</div>
	);
}

function DaySelector({ classBind, changeBind, cambio, setCambio }: DaySelectorProperties) {
	const [day, setDay] = React.useState(classBind.day);

	React.useEffect(() => {
		if(cambio){
			setDay(classBind.day);
			setCambio(false);
		}
	}, [cambio]);

	const handleDayChange = (event: any) => {
		setDay(event.target.value);
		changeBind(classBind, { ...classBind, day: event.target.value });
	};

	return (
		<select value={day} onChange={handleDayChange}>
			<option value="1">Lunes</option>
			<option value="2">Martes</option>
			<option value="3">Miercoles</option>
			<option value="4">Jueves</option>
			<option value="5">Viernes</option>
			<option value="6">Sábado</option>
			<option value="7">Domingo</option>
		</select>
	);
}


function TimeBlock({ changeBind, classBind, cambio, setCambio }: TimeBlockProperties) {
	const [showTimeError, setShowTimeError] = React.useState(false);
	// const timeErrorMessage = "La hora de inicio no puede ser mayor a la hora de fin";
	function updateStart(start: Date) {
		if(changeBind(classBind, { ...classBind, start: start })===1){
			toast.error(
				(t) => (
					<span className="Not-Error">
					La hora de inicio no puede ser mayor a la hora de fin{"		"}
					<button onClick={() => toast.dismiss(t.id)} type="button">OK</button>
					</span>
				),
				{
					duration: Infinity
				}
			);
		}else{setShowTimeError(false);}
	}

	function updateEnd(end: Date) {
		if(changeBind(classBind, { ...classBind, end: end })===1){
			toast.error(
				(t) => (
					<span className="Not-Error">
					La hora de inicio no puede ser mayor a la hora de fin{"		"}
					<button onClick={() => toast.dismiss(t.id)} type="button">OK</button>
					</span>
				),
				{
					duration: Number.POSITIVE_INFINITY
				}
			);
		}else{setShowTimeError(false);}
	}

	return (<><div className="timeblock-container">
				{/*showTimeError && <div className="time-error">{timeErrorMessage}</div>*/}
				<li className="timeblock-container-selector">
					<DaySelector changeBind={changeBind} classBind={classBind} cambio={cambio} setCambio={setCambio}/>
					<HourSelector changeBind={updateStart} dateBind={classBind.start} cambio={cambio} setCambio={setCambio}/>
					<HourSelector changeBind={updateEnd} dateBind={classBind.end} cambio={cambio} setCambio={setCambio}/>
				</li>
			</div>
			</>
	);
}

function SaveButton({ action }: ActionableButton) {
	return (
		<div className="save-button">
			<button onClick={action} type="button">
				Guardar
			</button>
		</div>
	);
}

function EditableSectionContainer({
	selectedEvent,
	puedeActualizar,
	addClassBind,
	removeClassBind,
	updateClassBind,
	saveDataBind,
	cambio,
	setCambio,
}: EditableSectionContainerProperties ){
	const [changedSection,setChangedSection]=React.useState<CISection|undefined>(undefined);
	const [nrc, setNRC] = React.useState(selectedEvent.name);
	const [teacher, setTeacher] = React.useState(selectedEvent.teacher);
	const [showNRCError, setShowNRCError] = React.useState(false);
	const [cambioHora, setCambioHora] = React.useState(false);
	const nrcErrorMessage = "NRC ya existente";
	React.useEffect(() => {
	if(cambio){
		setNRC(selectedEvent.name);
		setTeacher(selectedEvent.teacher)
		setShowNRCError(false);
		setChangedSection(undefined);
		setCambio(false);
	}}, [cambio]);

	function addNewClass() {
		addClassBind(selectedEvent);
	}

	function removeClass(session: ISession) {
		removeClassBind(selectedEvent, session);
	}

	function updateClassTime(oldSession: ISession, newSession: ISession) {
		if(updateClassBind(selectedEvent, oldSession, newSession)===undefined){
			return 1;
		}
			setCambioHora(true);
			return 0
	}

	function guardar() {
		if(changedSection!==undefined){
		saveDataBind(changedSection.oldSection, changedSection.newSection);
		setChangedSection(undefined);
		}else{
			if(!cambioHora){
			toast("No se hicieron cambios para guardar", {icon:"☝️🥸"})
			}else{
				toast.success("Cambios guardados con éxito");
				setCambioHora(false);
			}
		}
	}

	
	return (
		<div className="editable-section-container">
			<div className="editable-section-header">
				<div className="basic-info">{selectedEvent.name}</div>
				{/* {showNRCError&&(<div className="Nrc-error">{nrcErrorMessage}</div>)}
				<div>
					NRC:{" "}
					<input
						value={nrc}
						placeholder={selectedEvent.name}
						onChange={updateSectionNRC}
						type="text"
						
					/>
					
				</div> */}
			</div>
			{/* <div className="teacher-container">
				Teacher:{" "}
				<input
					value={teacher}
					placeholder={selectedEvent.teacher}
					onChange={updateSectionTeacher}
					type="text"
				/>
			</div> */}
			<div className="day-container">
				Dias: <button onClick={() => addNewClass()} type="button">Añadir</button>
			</div>
			<div>
				{selectedEvent.sessionLista.map((value) => {
					return (
						<div className="day-buttons">
							<TimeBlock changeBind={updateClassTime} classBind={value} cambio={cambio} setCambio={setCambio} />
							<div className="delete-day">
								<button onClick={() => removeClass(value)} type="button">
									{" "}
									Remover{" "}
								</button>
							</div>
						</div>
					);
				})}
			</div>
			<SaveButton action={()=>{guardar()}} />
		</div>
	);
}

export default function EventsInterface() {
	const [selectedEvent, setSelectedEvent] = React.useState<setSelectedEvent | undefined>(undefined);
	const [loadedEvents, setLoadedEvents] = React.useState<Array<IEvent>>();
	const [cambio, setCambio] = React.useState(false);
	const [changedEvents, setChangedEvents] = React.useState<CIEvent[]>([]);
	const [puedeGuardar, setPuedeGuardar] = React.useState(true);
	const [elimino, setElimino] = React.useState(false);
	const[cambioMensaje, setCambioMensaje] = React.useState(false);
	let updating = false;

	// 1- get every nrc and add to array
	// 2- compare n number to the array
	// 3- if num, +1, remove element and again
	// repeat until n not in list

	function findFreeNRC(): Number {
		let newNRC = 1;
		let sectionNRC: string[] = [];
		loadedEvents?.forEach((x) => {
			x.sessionLista.forEach((w) => {
				sectionNRC.push(w.nrc);
			});
		});
		while (true) {
			if (sectionNRC.includes(newNRC.toString())) {
				newNRC += 1;
			} else {
				console.log("Returning NRC " + newNRC);
				return newNRC;
			}
		}
	}

	React.useEffect(() => {
		(async () => {
			if (loadedEvents!==undefined) {
				return;
			}else{setLoadedEvents(await loadFromServer());}
			
		})();
	});

	async function loadSectionFromID(
		subject: IEvent,
		id: string,
	): Promise<ISection> {
		const sectionUrl = new URL(
			"/api/section/get_sections_from_id",
			apiBaseUrl,
		);
		sectionUrl.searchParams.set("id", id);
		const event: IEvent = await fetch(sectionUrl.toString(), {
			headers: { Accept: "application/json" },
		})
			.then((response) => response.json())
			.catch((e) => {
				console.error("No se pudo obtener la seccion", e);
			})
			.then((data) => {
				console.log(data);
				
				const newSection: ISection = {
					nrc: data.nrc,
					teacher: data.teacher,
					sessionList: [],
					subject: subject,
				};
				return newSection;
			});
		return event;
	}

	async function loadSectionsFromIdList(subject: IEvent, Ids: string[]) {
		if (Ids === undefined || Ids.length === 0) {
			return [];
		}
		const promises = Ids.map(async (id) => {
			return loadSectionFromID(subject, id);
		});
		return Promise.all(promises);
	}

	async function loadFromServer(): Promise<IEvent[]> {
		const events: Promise<IEvent>[] = await fetch(
			buildApiUrl("/api/events/get_all_events"),
			{
				headers: { Accept: "application/json" },
			},
		)
			.then((response) => response.json())
			.catch((e) => {
				console.error("No se pudo obtener los cursos", e);
			})
			.then((data: any[]) => {
				console.log("a ver si llego aquí",data);
				
				return data.map(async (event) => {
					const newEvent: IEvent = {
						//career: [],
						name: event.name,
						// sessionLista: event.sections
						sessionLista: []
					};
					console.log(newEvent);
					return newEvent;
				});
			});
		return Promise.all(events);
	}

	async function fetchSessionFromId(
		id: string,
		event: IEvent,
	): Promise<ISession> {
		const sessionUrl = new URL(
			"/api/session/get_sessions_from_id",
			apiBaseUrl,
		);
		sessionUrl.searchParams.set("id", id);
		return await fetch(sessionUrl.toString(), {
			headers: { Accept: "application/json" },
		})
			.then((response) => response.json())
			.catch((e) => {
				console.error(e);
			})
			.then((data) => {
				const newSession: ISession = {
					day: data.day,
					start: new Date(data.start),
					end: new Date(data.end),
					event: event,
				};
				return newSession;
			});
	}

	async function fetchSessionsFromEvent(event: IEvent) {
		const url = new URL(
			"/api/session/get_sessions_from_event",
			apiBaseUrl,
		);
		url.searchParams.set("name", event.name);
		return await fetch(url.toString(), {
			headers: { Accept: "application/json" },
		})
			.then((response) => response.json())
			.catch((e) => {
				console.error("No se pudo obtener las sessiones de la seccion", e);
			})
			.then(async (data) => {
				if (data === undefined) {
					console.error(data);
					return;
				}
				const newEvent: IEvent = {
					name: event.name,
					sessionLista:data.map((aSession: { day: any; start: string | number | Date; end: string | number | Date; }) => {
						const newSession: ISession = {
							day: aSession.day,
							start: new Date(aSession.start),
							end: new Date(aSession.end),
							event: event,
						};
						return newSession;
					}),
					// sessionList: await Promise.all(
					// 	data.map(async (aSession) => {
					// 		console.log(aSession);
					// 		await fetchSessionFromId(aSession._id, event);
					// 	}),
					// ),
					
				};
				console.log(newEvent.sessionLista);
				setSelectedEvent(newEvent);
				setCambio(true);
			});
	}

	function changeSelectedEvent(event: IEvent) {
		fetchSessionsFromEvent(event);
	}

	async function saveSectionToSubject(subject: IEvent, event: IEvent) {
		updating = true;
		if (subject === undefined || event === undefined) {
			updating = false;
			return;
		}
		const url = new URL(
			"/api/section/add_section_to_subject",
			apiBaseUrl,
		);
		url.searchParams.set("nrc", section.nrc);
		url.searchParams.set("teacher", section.teacher);
		url.searchParams.set("subjectName", subject.name);
		url.searchParams.set("papa", "1");
		return await fetch(url.toString(), {
			headers: { Accept: "application/json" },
		})
			.then((response) => response.json())
			.catch((e) => {
				console.error(e);
				toast.error("Error al agregar a la base de datos");
				console.error("No se pudo agregar a la base de datos");
			})
			.then((data) => {
				if (data === undefined) {
					return;
				}
				setLoadedEvents(
					loadedEvents?.map((x) => {
						if (x !== subject) return x;
						return { ...x, sessionLista: x.sessionLista.concat([event]) };
					}),
				);
				setSelectedEvent(event);
				toast.success("Sección creada con éxito");
			})
			.finally(() => {
				updating = false;
			});
	}

	// Adds new section to a specified course
	function addSectionToCourse(subject: IEvent) {
		if (updating === true) {
			return;
		}
		const createdSection: ISection = {
			subject: subject,
			nrc: findFreeNRC().toString(),
			sessionList: [],
			teacher: " ",
		};
		// toast.promise(saveSectionToSubject(subject, createdSection), {
		// 	loading: "Creando sección",
		// 	success: "Sección creada con éxito",
		// 	error: "Error al la crear sección",
		// });
		toast.loading("Creando sección", {duration:1500});	
		saveSectionToSubject(subject, createdSection);

	}

	async function deleteSectionFromDatabase(event: setSelectedEvent) {
		const url = new URL("/api/event/delete_section", apiBaseUrl);
		url.searchParams.set("nrc", event.name);
		await fetch(url.toString(), {
			method: "DELETE",
			headers: { Accept: "application/json" },
		})
			.then((response) => response.json())
			.catch((e) => {
				toast.error("Error al eliminar la sección");
				console.error("ERROR while trying to remove event ", event);
				console.error(e);
			})
			.then((data) => {
				if (data === undefined) {
					console.error("No se pudo eliminar la seccion");
					toast.error("No se pudo eliminar la seccion");
					return;
				}
				toast.success("Sección eliminada con éxito");
			});
	}

	function removeSectionFromCourse(
		course: IEvent,
		event: setSelectedEvent,
	): IEvent {
		let ret: IEvent = course;
		setLoadedEvents(
			loadedEvents?.map((x) => {
				if (x !== course) return x;
				ret = {
					...x,
					sessionLista: x.sessionLista.filter((y) => y !== event),
				};
				return ret;
			}),
		);
		toast.loading("Eliminando sección", {duration:1500});
		deleteSectionFromDatabase(event);

		if (event === selectedEvent) {
			setSelectedEvent(loadedEvents?.[0]?.sessionLista[0]);
		}
		return ret;
	}

	async function updateSectionServer(
		oldSection: ISection,
		newSection: ISection,
	) {
		updating = true;

		let allow_change = true;
		const url = new URL("/api/event/update_section", apiBaseUrl);
		url.searchParams.set("oldnrc", oldSection.nrc);
		url.searchParams.set("nrc", newSection.nrc);
		url.searchParams.set("teacher", newSection.teacher);
		return await fetch(url.toString(), {
			headers: { Accept: "application/json" },
		})
			.then((response) => response.json())
			.catch((e) => {
				console.error("Error actualizando base de datos ", e);
				allow_change = false;
				toast.error("Error al actualizar la sección");
				return;
			})
			.then((data) => {
				if (data === undefined) {
					console.error("No se pudo actualizar la seccion");
					toast.error("No se pudo actualizar la seccion");
					return;
				}
				allow_change = true;
			})
			.finally(() => {
				console.log("Updating event");
				let newValue = allow_change ? newSection : oldSection;
				if(allow_change){
					setLoadedEvents(
						loadedEvents?.map((x) => {
							x.sessionLista.forEach(element => {
								if (element.nrc===oldSection.nrc){ 
									x.sessionLista[x.sessionLista.indexOf(element)] = newValue;
									console.log("Se actualizo la seccion "+element.nrc+" a "+newValue.nrc);
									}
									
								});
							return x;
							})
					);
					setSelectedEvent(newValue);
					toast.success("Sección actualizada con éxito");
				}
				updating = false;
			});
	}

	function puedeActualizar(oldSection:ISection, newSection: ISection){
		if(oldSection.nrc !== newSection.nrc){
			if(loadedEvents?.find((x) => x.sessionLista.find((y) => y.nrc === newSection.nrc) !== undefined) !== undefined){
				return false;
			}
		}
		return true;
	}

	function updateSectionFromCourse(oldSection: ISection, newSection: ISection) {
		if (updating) {
			console.log("Updating");
			return false;
		}
		toast.loading("Actualizando sección", {duration:1500});
		updateSectionServer(oldSection, newSection);
		// toast.promise(updateSectionServer(oldSection, newSection), {
		// 	loading: "Actualizando seccion",
		// 	success: "Datos guardados con éxito",
		// 	error: "Error al actualizar seccion",
		// });
		
	}

	async function deleteSessionFromSection(
		session: ISession,
		event: IEvent,
	) {
		let saved = true;
		const url = new URL(
			"/api/session/delete_session_from_event",
			apiBaseUrl,
		);
		url.searchParams.set("name", event.name);
		url.searchParams.set("day", session.day.toString());
		url.searchParams.set("start", session.start.getTime().toString());
		url.searchParams.set("end", session.end.getTime().toString());
		await fetch(url.toString(), {
			headers: { Accept: "application/json" },
		})
			.then((response) => response.json())
			.catch((e) => {
				saved = false;
				toast.error("Error al eliminar la clase");
				console.error("ERROR unable to delete session from event ", e);
				return e;
			})
			.finally(() => {
				if (saved) {
					toast.success("Clase eliminada con éxito");
					changeSelectedEvent(event);
				}
			});
	}

	async function saveNewSessionToEvent(session: ISession, event: IEvent) {
		let saved = true;
		const url = new URL("/api/session/add_session_to_event", apiBaseUrl);
		url.searchParams.set("day", session.day.toString());
		url.searchParams.set("start", session.start.getTime().toString());
		url.searchParams.set("end", session.end.getTime().toString());
		url.searchParams.set("name", event.name);
		await fetch(url.toString(), {
			method: "POST",
			headers: { Accept: "application/json" },
		})
			.then((response) => response.json())
			.catch((e) => {
				saved = false;
				console.error("ERROR unable to create event ", e);
				toast.error("Error al crear la clase");
				return e;
			})
			.then((data) => {
				if (saved) {
					toast.success("Clase creada con éxito");
					changeSelectedEvent(event);
				}
			});
	}

	function addClassToEvent(event: IEvent): IEvent {
		function ReturnDate(hours: number, minutes: number): Date {
			let ret = new Date(0);
			ret.setHours(hours);
			ret.setMinutes(minutes);
			return ret;
		}

		let newSession: ISession = {
			day: 1,
			end: ReturnDate(6, 15),
			start: ReturnDate(6, 0),
			event: event,
		};
		event.sessionLista.push(newSession);

		if (event.sessionLista.includes(newSession)) {
			// toast.promise(saveNewSessionToEvent(newSession, event), {
			// 	loading: "Creando clase",
			// 	success: "Clase creada con éxito",
			// 	error: "Error al crear clase",
			// });
			toast.loading("Creando momento para el evento", {duration:1500});
			saveNewSessionToEvent(newSession, event);
		}
		return event;
	}

	function removeClassFromEvent(
		event: IEvent,
		session: ISession,
	): IEvent {
		event.sessionLista = event.sessionLista.filter((y) => y !== session);
		// toast.promise(deleteSessionFromSection(session, event), {
		// 	loading: "Eliminando clase",
		// 	success: "Clase eliminada con éxito",
		// 	error: "Error al eliminar clase",
		// });
		toast.loading("Eliminando clase", {duration:1500});
		deleteSessionFromSection(session, event);
		return event;
	}

	async function updateClassFromServer(
		oldSession: ISession,
		newSession: ISession,
		event: IEvent,
	) {
		const updateUrl = new URL(
			"/api/session/updateSession_from_event",
			apiBaseUrl,
		);
		updateUrl.searchParams.set("oldday", oldSession.day.toString());
		updateUrl.searchParams.set(
			"oldstart",
			oldSession.start.getTime().toString(),
		);
		updateUrl.searchParams.set(
			"oldend",
			oldSession.end.getTime().toString(),
		);
		updateUrl.searchParams.set("newday", newSession.day.toString());
		updateUrl.searchParams.set(
			"newstart",
			newSession.start.getTime().toString(),
		);
		updateUrl.searchParams.set(
			"newend",
			newSession.end.getTime().toString(),
		);
		updateUrl.searchParams.set("nrc", event.name);

		const uri = updateUrl.toString();
		console.log(uri);

		let changed = true;
		await fetch(uri, {
			method: "put",
			headers: { Accept: "application/json" },
		})
			.then((response) => response.json())
			.then((data) => {
				console.log(data);
			})
				
			.catch((e) => {
				changed = false;
				console.error("ERROR updating session ", e);
			})
			.finally(() => {
				changeSelectedEvent(event);
			});
	}

	function updateClassFromSection(
		event: IEvent,
		oldSession: ISession,
		newSession: ISession,
	) {
		console.log(newSession.start)
		if (
			newSession.start.getHours() * 60 + newSession.start.getMinutes() >=
			newSession.end.getHours() * 60 + newSession.end.getMinutes()
		) {
			return undefined;
		}
		if (oldSession !== newSession) {
			let newEvent: IEvent = event	;
			newEvent.sessionLista[newEvent.sessionLista.indexOf(oldSession)] =
				newSession;
			updateClassFromServer(oldSession, newSession, newEvent);
		}
		return event;
	}
	const [editable, setEditable] = React.useState(false);

	async function updateEventServer(oldEvent: IEvent, newEvent: IEvent) {
		updating = true;
		let allow_change = true;
		const newName= newEvent.name;
		console.log(`actualizando nombre de ${oldEvent.name} a '${newName}'`);
		
		const url = new URL("/api/events/update_event", apiBaseUrl);
		url.searchParams.set("oldname", oldEvent.name);
		url.searchParams.set("newname", newName);
		url.searchParams.set("event", "i");
		return await fetch(url.toString(), {
			method: "put",
			headers: { Accept: "application/json" },
		})
			.then((response) => response.json())
			.catch((e) => {
				console.error("Error actualizando base de datos ", e);
				allow_change = false;
				toast.error("Error al actualizar el curso");
				return e;
			})
			.then((data) => {
				if (data === undefined) {return;}})
			.finally(() => {
				const newValue = allow_change ? newEvent : oldEvent;
				console.log(`Se actualizo el curso ${oldEvent.name} a ${newEvent.name}`);
				setLoadedEvents(
					loadedEvents?.map((x) => {
						if (x !== oldEvent){return x;}
						
						return newValue;
					})
				);
				if (allow_change){
					toast.success("Curso actualizado con éxito");
				}
				updating = false;
			});
		
	}
	
	function puedeCambiarNombre(oldEvent: IEvent, newEvent: IEvent, mismo:boolean) {
		if(mismo){
			const repetidos:string[]=[];
			loadedEvents?.forEach((x) => {
				if(x.name===newEvent.name){
					repetidos.push(x.name);
				}
			});
			if(repetidos.length>1){
				return false;
			}
				return true;
		}
		if((oldEvent.name !== newEvent.name)){
			if(loadedEvents?.find((x) => x.name === newEvent.name) !== undefined){
				return false;
			}
		}
		return true;
	
	}

	function hayNombre(){
		let nombres = loadedEvents?.map((x) => x.name);
		return nombres?.length !== new Set(nombres).size;
	}

	function hayNombreRepetido(){
		if(hayNombre()){
			
		}
	}


	function saveSubjectLocal(oldEvent:IEvent, newEvent:IEvent){
		setLoadedEvents(
			loadedEvents?.map((x) => {
				if (x !== oldEvent){
					return x;
				}
				pushChangedSubjects(oldEvent, newEvent);
				return newEvent;
			})
		);
		setElimino(true);
		
	}


	function pushChangedSubjects(oldEvent:IEvent, newEvent:IEvent){
		if(changedEvents.find((x) => (x.oldEvent === oldEvent)||(x.newEvent===oldEvent)) === undefined){
			changedEvents.push({oldEvent:oldEvent, newEvent:newEvent});
		}else{
			setChangedEvents(changedEvents.map((x) => {
				if(x.newEvent === oldEvent){
					return {oldEvent:x.oldEvent, newEvent:newEvent};
				}
				return x;
			}));
		}
	}

	function saveSubjectServer(){
		if(!puedeGuardar){
			toast.error("No se pueden guardar 2 cursos con el mismo nombre");
			console.log("No se puede guardar, hay errores");
			return;
		}
		if(changedEvents.length===0){
			if(cambioMensaje){
				toast.success("Los datos se guardaron con éxito");
				setCambioMensaje(false);
				return
			}
			toast("No se realizó ningún cambio",{ icon: "🧐"});
			return;
		}
		for(const x of changedEvents){
			// toast.promise(updateEventServer(x.oldEvent, x.newEvent), {
			// 	loading: "Actualizando curso...",
			// 	success: "Curso actualizado exitosamente",
			// 	error: "Error al actualizar curso"
			// });
			updateEventServer(x.oldEvent, x.newEvent);
		}
		setChangedEvents([]);
	}

	async function addEventServer(newEvent: IEvent) {
		updating = true;
		const url = new URL("/api/events/create_event/", apiBaseUrl);
		url.searchParams.set("name", newEvent.name);
		return await fetch(url.toString(), {
			method: "post",
			headers: { Accept: "application/json" },
		})
			.then((response) => response.json())
			.catch((e) => {				
				console.error("Error al crear evento ", e);
				toast.error("Error al crear el evento");
				return e;
			})
			.then((data) => {
				console.log(data);
				if (data === undefined) {
					console.error("No se pudo crear el evento");
					toast.error("No se pudo crear el evento");
					return;
				}
				console.log(data);
				setLoadedEvents(loadedEvents?.concat([newEvent]));
				toast.success("Evento creado exitosamente");
			})
	}
	function generateName(){
		let name = "Nuevo Evento ";
		let i = 1;
		while(loadedEvents?.find((x) => x.name === name+i) !== undefined){
			i++;
		}
		return name+i;
	}
	function addEvent(){
		setEditable(true);
		let newEvent: IEvent = {
			//career: [],
			name: generateName(),
			sessionLista: [],
		};
		// toast.promise(addEventServer(newEvent), {
		// 	loading: "Creando curso...",
		// 	success: "Curso creado exitosamente",
		// 	error: "No se pudo crear el curso, intente mas tarde o recargue la página",
		// });
		toast.loading("Creando evento...", {duration:1500});
		addEventServer(newEvent);
		setElimino(true);
		setCambioMensaje(true);
	
	}

	async function deleteEventFromDatabase(event: IEvent){
		const url = new URL("/api/events/delete_event", apiBaseUrl);
		url.searchParams.set("eventName", event.name);
		url.searchParams.set("event", "a");
		return await fetch(url.toString(), {
			method: "delete",
			headers: { Accept: "application/json" },
		})
			.then((response) => response.json())
			.catch((e) => {
				console.error("Error al eliminar curso ", e);
				toast.error("Error al eliminar el evento");
				return e;
			})
			.then((data) => {
				if (data === undefined) {
					toast.error("No se pudo eliminar el curso");
					console.error("No se pudo eliminar el evento");
					return;
				}
				if(data.message==="Event deleted successfully"){
					console.log("Evento eliminado con exito");
					toast.success("Evento eliminado con éxito");
				}
			})
	}

	function deleteEvent(evento: IEvent){

		if (evento === selectedEvent) {
			setSelectedEvent(undefined);
		}

		setLoadedEvents(loadedEvents?.filter((x) => x !== evento));

		setElimino(true);
		setCambioMensaje(true);
		if(changedEvents.find((x) => x.newEvent === evento) !== undefined){
			const oldEvent = changedEvents.find((x) => x.newEvent === evento)?.oldEvent;
			if(oldEvent !== undefined){
				toast.loading("Eliminando evento...", {duration:1500});
			// 	toast.promise(deleteEventFromDatabase(oldEvent), {
			// 	loading: "Eliminando curso...",
			// 	success: "Curso eliminado exitosamente",
			// 	error: "No se pudo eliminar el curso, intente mas tarde",
			// });
				deleteEventFromDatabase(oldEvent);
			}
		}else{
			// toast.promise(deleteEventFromDatabase(evento), {
			// 	loading: "Eliminando curso...",
			// 	success: "Curso eliminado exitosamente",
			// 	error: "No se pudo eliminar el curso, intente mas tarde",
			// });
			toast.loading("Eliminando evento...", {duration:1500});
			deleteEventFromDatabase(evento);
		}

		//deleteEventFromDatabase(evento);
	}

	return (
		<div>
			<NavigationBar />
			<div className="main-container">
			<Toaster
				position="bottom-right"
				reverseOrder={false}
				/>
				<div className="course-box-container">
					
					<div>
						{loadedEvents?.map((value) => {
							return (
								<Course
									displayEvent={value}
									newSectionBind={addSectionToCourse}
									removeSectionBind={removeSectionFromCourse}
									selectSectionBind={changeSelectedEvent}
									updateBind={saveSubjectLocal}
									editable={editable}
									puedeCambiar={puedeCambiarNombre}
									setPuedeGuardar={setPuedeGuardar}
									removeEventBind={() => {deleteEvent(value)}}
									cambio={elimino}
									setCambio={setElimino}
									hayRepetidos={hayNombreRepetido}
								/>
							);
						})}
					</div>
					{!editable && (<div className="add-subject">
						<button onClick={() => {addEvent()}} type="button">
							Añadir Evento
						</button>
						<button onClick={() => {setEditable(true)}} type="button">
							Editar Eventos
						</button>

					</div>)}
					{editable && (<div className="save-subject">
						<button onClick={() => {addEvent()}} type="button">
							Añadir Evento
						</button>
						<button className="guardar-button" onClick={() => {if(puedeGuardar){setEditable(false)} saveSubjectServer();}} type="button">
							Guardar
						</button>
						<div className="centrar"/>

						</div>)}
					</div>
				<div className="section-edit-container">
					{selectedEvent !== undefined && (
						<EditableSectionContainer
							selectedEvent={selectedEvent}
							//updateSectionBind={updateSectionFromCourse}
							puedeActualizar={puedeActualizar}
							addClassBind={addClassToEvent}
							removeClassBind={removeClassFromEvent}
							updateClassBind={updateClassFromSection}
							saveDataBind={updateSectionFromCourse}
							cambio={cambio}
							setCambio={setCambio}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
