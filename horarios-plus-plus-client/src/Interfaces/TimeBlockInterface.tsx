import React, { type MouseEventHandler } from "react";

import CourseSemesterContainer from "./CourseSemesterContainer";
import NavigationBar from "./NavigationBar";
import "./TimeBlockInterface.css";
import { set } from "mongoose";
import { string } from "zod";
import toast, {Toaster} from "react-hot-toast";
import { apiBaseUrl, buildApiUrl, regExpEmail } from "./helpers.tsx";

interface ISession {
	day: number;
	start: Date;
	end: Date;
	section: ISection;
}

interface CISection {
	newSection: ISection;
	oldSection: ISection;
}

interface ISection {
	nrc: string;
	teacher: string;
	subject: ISubject;
	sessions: Array<ISession>;
}

interface ISubject {
	name: string;
	sectionList: Array<ISection>;
	//career: Array<ICareer>
}

interface CISubject {
	newSubject: ISubject;
	oldSubject: ISubject;
}

interface ICareer {
	name: string;
	subjects: Array<ISubject>
}

interface EditableSectionContainerProperties {
	selectedSection: ISection;
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
	displayCourse: ISubject;
	newSectionBind: any;
	removeSectionBind: any;
	selectSectionBind: any;
	editable: boolean;
	puedeCambiar: any;
	setPuedeGuardar: any;
	removeSubjectBind: any;
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
	displayCourse,
	newSectionBind,
	removeSectionBind,
	selectSectionBind,
	removeSubjectBind,
	updateBind,
	editable,
	puedeCambiar,
	setPuedeGuardar,
	cambio,
	setCambio,
	hayRepetidos
}: CourseProperties) {
	const [subjectName, setSubjectName] = React.useState(displayCourse.name);

	React.useEffect(() => {
		if(cambio){
			setSubjectName(displayCourse.name);
			setCambio(false);
			if(!puedeCambiar(displayCourse,displayCourse,true)){
				setNameError(true);
				setPuedeGuardar(false);
			}else{
				setPuedeGuardar(true);
				setNameError(false);
			}
		}
	},[cambio]);

	function addNewSection() {
		displayCourse = newSectionBind(displayCourse);
	}

	function removeExistingSection(section: ISection) {
		displayCourse = removeSectionBind(displayCourse, section);
	}

	const [nameError, setNameError] = React.useState(false);
	const nameErrorMessage = "Nombre de curso ya existente";

	function updateSubject(event: any) {
		setSubjectName(event.target.value);
		let newSubject = event.target.value;
		let newCourse: ISubject = displayCourse;
		newCourse = {
			...newCourse,
			name: newSubject,
		};
		if(!puedeCambiar(displayCourse,newCourse,false)){
			setNameError(true);
			setPuedeGuardar(false);
		}else{
			updateBind(displayCourse, newCourse);
			setPuedeGuardar(true);
			setNameError(false);
		}
	}


	function deleteSubject() {
		hayRepetidos();
		removeSubjectBind(displayCourse, displayCourse.sectionList[0]);
	}

	return (
		<div>
			<div className="course">
				{!editable && (
				<><div className="course-name">{displayCourse.name}</div>
				<div className="add-section">
					<button onClick={addNewSection} type="button">
						Añadir Seccion
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
						<button onClick={deleteSubject} type="button">
							Remover Curso
						</button>
					</div></>
				)}
				
			</div>
			<div>
				{displayCourse?.sectionList.map((value) => {
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
					<button onClick={() => toast.dismiss(t.id)}>OK</button>
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
					<button onClick={() => toast.dismiss(t.id)}>OK</button>
				  </span>
				),
				{
				  duration: Infinity
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
	selectedSection,
	puedeActualizar,
	addClassBind,
	removeClassBind,
	updateClassBind,
	saveDataBind,
	cambio,
	setCambio,
}: EditableSectionContainerProperties ){
	const [changedSection,setChangedSection]=React.useState<CISection|undefined>(undefined);
	const [nrc, setNRC] = React.useState(selectedSection.nrc);
	const [teacher, setTeacher] = React.useState(selectedSection.teacher);
	const [showNRCError, setShowNRCError] = React.useState(false);
	const [cambioHora, setCambioHora] = React.useState(false);
	const nrcErrorMessage = "NRC ya existente";
	React.useEffect(() => {
	if(cambio){
		setNRC(selectedSection.nrc);
		setTeacher(selectedSection.teacher)
		setShowNRCError(false);
		setChangedSection(undefined);
		setCambio(false);
	}}, [cambio]);

	function addNewClass() {
		addClassBind(selectedSection);
	}

	function removeClass(session: ISession) {
		removeClassBind(selectedSection, session);
	}

	function updateClassTime(oldSession: ISession, newSession: ISession) {
		if(updateClassBind(selectedSection, oldSession, newSession)===undefined){
			return 1;
		}else{
			setCambioHora(true);
			return 0}	
	}

	function updateSectionNRC(event: any) {
		setNRC(event.target.value);
		let newNRC = event.target.value;
		let newSection: ISection = selectedSection;
		newSection = {
			...newSection,
			nrc: newNRC,
		};
		if(puedeActualizar(selectedSection, newSection)){
			setShowNRCError(false);
			setChangedSection({oldSection:selectedSection, newSection:newSection});
		}else{
			setShowNRCError(true);
		}
	}

	function updateSectionTeacher(event: any) {
		setTeacher(event.target.value);
		let newTeacher = event.target.value
		let newSection: ISection = selectedSection;
		newSection = {
			...newSection,
			teacher: newTeacher,
		};
		if(puedeActualizar(selectedSection, newSection)){
			setChangedSection({oldSection:selectedSection, newSection:newSection});
		}

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
				<div className="basic-info">{selectedSection.subject.name}</div>
				{showNRCError&&(<div className="Nrc-error">{nrcErrorMessage}</div>)}
				<div>
					NRC:{" "}
					<input
						value={nrc}
						placeholder={selectedSection.nrc}
						onChange={updateSectionNRC}
						type="text"
						
					/>
					
				</div>
			</div>
			<div className="teacher-container">
				Teacher:{" "}
				<input
					value={teacher}
					placeholder={selectedSection.teacher}
					onChange={updateSectionTeacher}
					type="text"
				/>
			</div>
			<div className="day-container">
				Dias: <button onClick={() => addNewClass()} type="button">Añadir</button>
			</div>
			<div>
				{selectedSection.sessions.map((value) => {
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

export default function TimeBlockInterface() {
	const [selectedSection, setSelectedSection] = React.useState<ISection | undefined>(undefined);
	const [loadedSubjects, setLoadedSubjects] = React.useState<Array<ISubject>>();
	const [cambio, setCambio] = React.useState(false);
	const [changedSubjects, setChangedSubjects] = React.useState<CISubject[]>([]);
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
		loadedSubjects?.forEach((x) => {
			x.sectionList.forEach((w) => {
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
			if (loadedSubjects!==undefined) {
				return;
			}else{setLoadedSubjects(await loadFromServer());}
			
		})();
	});

	async function loadSectionFromID(
		subject: ISubject,
		id: string,
	): Promise<ISection> {
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
				console.error("No se pudo obtener la seccion", e);
			})
			.then((data) => {
				console.log(data);
				
				const newSection: ISection = {
					nrc: data.nrc,
					teacher: data.teacher,
					sessions: [],
					subject: subject,
				};
				return newSection;
			});
		return section;
	}

	async function loadSectionsFromIdList(subject: ISubject, Ids: string[]) {
		if (Ids === undefined || Ids.length === 0) {
			return [];
		}
		const promises = Ids.map(async (id) => {
			return loadSectionFromID(subject, id);
		});
		return Promise.all(promises);
	}

	async function loadFromServer(): Promise<ISubject[]> {
		const subjectsUrl = buildApiUrl("/api/subjects/get_subjects");
		const subjects: Promise<ISubject>[] = await fetch(subjectsUrl, {
			headers: { Accept: "application/json" },
		})
			.then((response) => response.json())
			.catch((e) => {
				console.error("No se pudo obtener los cursos", e);
			})
			.then((data: any[]) => {
				console.log("a ver si llego aquí",data);
				
				return data.map(async (subject) => {
					const newSubject: ISubject = {
						//career: [],
						name: subject.name,
						// sectionList: subject.sections
						sectionList: await loadSectionsFromIdList(
							subject,
							subject.sections,
						),
					};
					console.log(newSubject);
					return newSubject;
				});
			});
		return Promise.all(subjects);
	}

	async function fetchSessionFromId(
		id: string,
		section: ISection,
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
				let newSession: ISession = {
					day: data.day,
					start: new Date(data.start),
					end: new Date(data.end),
					section: section,
				};
				return newSession;
			});
	}

	async function fetchSessionsFromSection(section: ISection) {
		const url = new URL(
			"/api/session/get_sessions_from_section",
			apiBaseUrl,
		);
		url.searchParams.set("nrc", section.nrc);
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
				const newSection: ISection = {
					nrc: section.nrc,
					teacher: section.teacher,
					subject: section.subject,
					sessions:data.map((aSession: { day: any; start: string | number | Date; end: string | number | Date; }) => {
						const newSession: ISession = {
							day: aSession.day,
							start: new Date(aSession.start),
							end: new Date(aSession.end),
							section: section,
						};
						return newSession;
					}),
					// sessions: await Promise.all(
					// 	data.map(async (aSession) => {
					// 		console.log(aSession);
					// 		await fetchSessionFromId(aSession._id, section);
					// 	}),
					// ),
					
				};
				console.log(newSection.sessions);
				setSelectedSection(newSection);
				setCambio(true);
			});
	}

	function changeSelectedSection(section: ISection) {
		fetchSessionsFromSection(section);
	}

	async function saveSectionToSubject(subject: ISubject, section: ISection) {
		updating = true;
		if (subject === undefined || section === undefined) {
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
				setLoadedSubjects(
					loadedSubjects?.map((x) => {
						if (x !== subject) return x;
						return { ...x, sectionList: x.sectionList.concat([section]) };
					}),
				);
				setSelectedSection(section);
				toast.success("Sección creada con éxito");
			})
			.finally(() => {
				updating = false;
			});
	}

	// Adds new section to a specified course
	function addSectionToCourse(subject: ISubject) {
		if (updating === true) {
			return;
		}
		let createdSection: ISection = {
			subject: subject,
			nrc: findFreeNRC().toString(),
			sessions: [],
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

	async function deleteSectionFromDatabase(section: ISection) {
		const mail = sessionStorage.getItem("login");
		const url = new URL("/api/section/delete_section", apiBaseUrl);
		url.searchParams.set("nrc", section.nrc);
		if (mail) {
			url.searchParams.set("mail", mail);
		}
		await fetch(url.toString(), {
			method: "DELETE",
			headers: { Accept: "application/json" },
		})
			.then((response) => response.json())
			.catch((e) => {
				toast.error("Error al eliminar la sección");
				console.error("ERROR while trying to remove section ", section);
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
		course: ISubject,
		section: ISection,
	): ISubject {
		let ret: ISubject = course;
		setLoadedSubjects(
			loadedSubjects?.map((x) => {
				if (x !== course) return x;
				ret = {
					...x,
					sectionList: x.sectionList.filter((y) => y !== section),
				};
				return ret;
			}),
		);
		toast.loading("Eliminando sección", {duration:1500});
		deleteSectionFromDatabase(section);

		if (section === selectedSection) {
			setSelectedSection(loadedSubjects?.[0]?.sectionList[0]);
		}
		return ret;
	}

	async function updateSectionServer(
		oldSection: ISection,
		newSection: ISection,
	) {
		updating = true;

		let allow_change = true;
		const url = new URL("/api/section/update_section", apiBaseUrl);
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
				console.log("Updating section");
				let newValue = allow_change ? newSection : oldSection;
				if(allow_change){
					setLoadedSubjects(
						loadedSubjects?.map((x) => {
							x.sectionList.forEach(element => {
								if (element.nrc===oldSection.nrc){ 
									x.sectionList[x.sectionList.indexOf(element)] = newValue;
									console.log("Se actualizo la seccion "+element.nrc+" a "+newValue.nrc);
									}
									
								});
							return x;
							})
					);
					setSelectedSection(newValue);
					toast.success("Sección actualizada con éxito");
				}
				updating = false;
			});
	}

	function puedeActualizar(oldSection:ISection, newSection: ISection){
		if(oldSection.nrc !== newSection.nrc){
			if(loadedSubjects?.find((x) => x.sectionList.find((y) => y.nrc === newSection.nrc) !== undefined) !== undefined){
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
		section: ISection,
	) {
		let saved = true;
		const url = new URL("/api/session/delete_session", apiBaseUrl);
		url.searchParams.set("nrc", section.nrc);
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
				console.error("ERROR unable to delete session from section ", e);
				return e;
			})
			.finally(() => {
				if (saved) {
					toast.success("Clase eliminada con éxito");
					changeSelectedSection(section);
				}
			});
	}

	async function saveNewSessionToSection(session: ISession, section: ISection) {
		let saved = true;
		const url = new URL("/api/session/add_session_to_section", apiBaseUrl);
		url.searchParams.set("day", session.day.toString());
		url.searchParams.set("start", session.start.getTime().toString());
		url.searchParams.set("end", session.end.getTime().toString());
		url.searchParams.set("nrc", section.nrc);
		await fetch(url.toString(), {
			method: "POST",
			headers: { Accept: "application/json" },
		})
			.then((response) => response.json())
			.catch((e) => {
				saved = false;
				console.error("ERROR unable to create section ", e);
				toast.error("Error al crear la clase");
				return e;
			})
			.then((data) => {
				if (saved) {
					toast.success("Clase creada con éxito");
					changeSelectedSection(section);
				}
			});
	}

	function addClassToSection(section: ISection): ISection {
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
			section: section,
		};
		section.sessions.push(newSession);

		if (section.sessions.includes(newSession)) {
			// toast.promise(saveNewSessionToSection(newSession, section), {
			// 	loading: "Creando clase",
			// 	success: "Clase creada con éxito",
			// 	error: "Error al crear clase",
			// });
			toast.loading("Creando clase", {duration:1500});
			saveNewSessionToSection(newSession, section);
		}
		return section;
	}

	function removeClassFromSection(
		section: ISection,
		session: ISession,
	): ISection {
		section.sessions = section.sessions.filter((y) => y !== session);
		// toast.promise(deleteSessionFromSection(session, section), {
		// 	loading: "Eliminando clase",
		// 	success: "Clase eliminada con éxito",
		// 	error: "Error al eliminar clase",
		// });
		toast.loading("Eliminando clase", {duration:1500});
		deleteSessionFromSection(session, section);
		return section;
	}

	async function updateClassFromServer(
		oldSession: ISession,
		newSession: ISession,
		section: ISection,
	) {
		const updateUrl = new URL("/api/session/updateSession", apiBaseUrl);
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
		updateUrl.searchParams.set("nrc", section.nrc);

		const uri = updateUrl.toString();
		console.log(uri);

		let changed = true;
		await fetch(uri, { headers: { Accept: "application/json" } })
			.then((response) => response.json())
			.catch((e) => {
				changed = false;
				console.error("ERROR updating session ", e);
			})
			.finally(() => {
				changeSelectedSection(section);
			});
	}

	function updateClassFromSection(
		section: ISection,
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
			let newSection: ISection = section;
			newSection.sessions[newSection.sessions.indexOf(oldSession)] =
				newSession;
			updateClassFromServer(oldSession, newSession, newSection);
		}
		return section;
	}
	const [editable, setEditable] = React.useState(false);

	async function updateSubjectServer(oldSubject: ISubject, newSubject: ISubject) {
		updating = true;
		let allow_change = true;
		const newName= newSubject.name;
		console.log(`actualizando nombre de ${oldSubject.name} a '${newName}'`);
		
		const url = new URL("/api/subjects/update_subject", apiBaseUrl);
		url.searchParams.set("oldname", oldSubject.name);
		url.searchParams.set("newname", newName);
		url.searchParams.set("section", "i");
		return await fetch(url.toString(), {
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
				const newValue = allow_change ? newSubject : oldSubject;
				console.log(`Se actualizo el curso ${oldSubject.name} a ${newSubject.name}`);
				setLoadedSubjects(
					loadedSubjects?.map((x) => {
						if (x !== oldSubject){return x;}
						
						return newValue;
					})
				);
				if (allow_change){
					toast.success("Curso actualizado con éxito");
				}
				updating = false;
				//setSelectedSection(loadedSubjects?.find((x)=>x===newValue)?.sectionList[0])
			});
		
	}
	
	function puedeCambiarNombre(oldSubject: ISubject, newSubject: ISubject, mismo:boolean) {
		if(mismo){
			let repetidos:string[]=[];
			loadedSubjects?.forEach((x) => {
				if(x.name===newSubject.name){
					repetidos.push(x.name);
				}
			});
			if(repetidos.length>1){
				return false;
			}else{
				return true;
			}
		}
		if((oldSubject.name !== newSubject.name)){
			if(loadedSubjects?.find((x) => x.name === newSubject.name) !== undefined){
				return false;
			}
		}
		return true;
	
	}

	function hayNombre(){
		let nombres = loadedSubjects?.map((x) => x.name);
		return nombres?.length !== new Set(nombres).size;
	}

	function hayNombreRepetido(){
		if(hayNombre()){
			
		}
	}


	function saveSubjectLocal(oldSubject:ISubject, newSubject:ISubject){
		setLoadedSubjects(
			loadedSubjects?.map((x) => {
				if (x !== oldSubject){
					return x;
				}
				pushChangedSubjects(oldSubject, newSubject);
				return newSubject;
			})
		);
		setElimino(true);
		
	}


	function pushChangedSubjects(oldSubject:ISubject, newSubject:ISubject){
		if(changedSubjects.find((x) => (x.oldSubject === oldSubject)||(x.newSubject===oldSubject)) === undefined){
			changedSubjects.push({oldSubject:oldSubject, newSubject:newSubject});
		}else{
			setChangedSubjects(changedSubjects.map((x) => {
				if(x.newSubject === oldSubject){
					return {oldSubject:x.oldSubject, newSubject:newSubject};
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
		if(changedSubjects.length===0){
			if(cambioMensaje){
				toast.success("Los datos se guardaron con éxito");
				setCambioMensaje(false);
				return
			}
			toast("No se realizó ningún cambio",{ icon: "🧐"});
			return;
		}
		for(let x of changedSubjects){
			// toast.promise(updateSubjectServer(x.oldSubject, x.newSubject), {
			// 	loading: "Actualizando curso...",
			// 	success: "Curso actualizado exitosamente",
			// 	error: "Error al actualizar curso"
			// });
			updateSubjectServer(x.oldSubject, x.newSubject);
		}
		setChangedSubjects([]);
	}

	async function addSubjectServer(newSubject: ISubject) {
		updating = true;
		const url = new URL("/api/subjects/create_subject", apiBaseUrl);
		url.searchParams.set("name", newSubject.name);
		return await fetch(url.toString(), {
			headers: { Accept: "application/json" },
		})
			.then((response) => response.json())
			.catch((e) => {				
				console.error("Error al crear curso ", e);
				toast.error("Error al crear el curso");
				return e;
			})
			.then((data) => {
				console.log(data);
				if (data === undefined) {
					console.error("No se pudo crear el curso");
					toast.error("No se pudo crear el curso");
					return;
				}
				console.log(data);
				setLoadedSubjects(loadedSubjects?.concat([newSubject]));
				toast.success("Curso creado exitosamente");
			})
	}
	function generateName(){
		let name = "Nuevo Curso ";
		let i = 1;
		while(loadedSubjects?.find((x) => x.name === name+i) !== undefined){
			i++;
		}
		return name+i;
	}
	function addSubject(){
		setEditable(true);
		let newSubject: ISubject = {
			//career: [],
			name: generateName(),
			sectionList: [],
		};
		// toast.promise(addSubjectServer(newSubject), {
		// 	loading: "Creando curso...",
		// 	success: "Curso creado exitosamente",
		// 	error: "No se pudo crear el curso, intente mas tarde o recargue la página",
		// });
		toast.loading("Creando curso...", {duration:1500});
		addSubjectServer(newSubject);
		setElimino(true);
		setCambioMensaje(true);
	
	}

	async function deleteSubjectFromDatabase(subject: ISubject){
		const url = new URL("/api/subjects/delete_subject", apiBaseUrl);
		url.searchParams.set("subjectName", subject.name);
		url.searchParams.set("subject", JSON.stringify(subject));
		return await fetch(url.toString(), {
			headers: { Accept: "application/json" },
		})
			.then((response) => response.json())
			.catch((e) => {
				console.error("Error al eliminar curso ", e);
				toast.error("Error al eliminar el curso");
				return e;
			})
			.then((data) => {
				if (data === undefined) {
					toast.error("No se pudo eliminar el curso");
					console.error("No se pudo eliminar el curso");
					return;
				}
				if(data.message==="Subject deleted successfully"){
					console.log("Curso eliminado con exito");
					toast.success("Curso eliminado con éxito");
				}
			})
	}

	function deleteSubject(subject: ISubject){

		subject.sectionList.forEach((x) => {
			if (x === selectedSection) {
				setSelectedSection(undefined);
			}
		});
		setLoadedSubjects(loadedSubjects?.filter((x) => x !== subject));

		setElimino(true);
		setCambioMensaje(true);
		if(changedSubjects.find((x) => x.newSubject === subject) !== undefined){
			let oldSubject = changedSubjects.find((x) => x.newSubject === subject)?.oldSubject;
			if(oldSubject !== undefined){
				toast.loading("Eliminando curso...", {duration:1500});
			// 	toast.promise(deleteSubjectFromDatabase(oldSubject), {
			// 	loading: "Eliminando curso...",
			// 	success: "Curso eliminado exitosamente",
			// 	error: "No se pudo eliminar el curso, intente mas tarde",
			// });
				deleteSubjectFromDatabase(oldSubject);
			}
		}else{
			// toast.promise(deleteSubjectFromDatabase(subject), {
			// 	loading: "Eliminando curso...",
			// 	success: "Curso eliminado exitosamente",
			// 	error: "No se pudo eliminar el curso, intente mas tarde",
			// });
			toast.loading("Eliminando curso...", {duration:1500});
			deleteSubjectFromDatabase(subject);
		}

		//deleteSubjectFromDatabase(subject);
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
					{/* <CourseSemesterContainer/> */}
					<div>
						{loadedSubjects?.map((value) => {
							return (
								<Course
									displayCourse={value}
									newSectionBind={addSectionToCourse}
									removeSectionBind={removeSectionFromCourse}
									selectSectionBind={changeSelectedSection}
									updateBind={saveSubjectLocal}
									editable={editable}
									puedeCambiar={puedeCambiarNombre}
									setPuedeGuardar={setPuedeGuardar}
									removeSubjectBind={() => {deleteSubject(value)}}
									cambio={elimino}
									setCambio={setElimino}
									hayRepetidos={hayNombreRepetido}
								/>
							);
						})}
					</div>
					{(!editable )&& (<div className="add-subject">
						<button onClick={() => {addSubject()}} type="button">
							Añadir Curso
						</button>
						<button onClick={() => {setEditable(true)}} type="button">
							Editar Cursos
						</button>

					</div>)}
					{(editable )&& (<div className="save-subject">
						<button onClick={() => {addSubject()}} type="button">
							Añadir Curso
						</button>
						<button className="guardar-button" onClick={() => {if(puedeGuardar){setEditable(false)} saveSubjectServer();}} type="button">
							Guardar
						</button>
						<div className="centrar"/>

						</div>)}
					</div>
				<div className="section-edit-container">
					{selectedSection !== undefined && (
						<EditableSectionContainer
							selectedSection={selectedSection}
							//updateSectionBind={updateSectionFromCourse}
							puedeActualizar={puedeActualizar}
							addClassBind={addClassToSection}
							removeClassBind={removeClassFromSection}
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
