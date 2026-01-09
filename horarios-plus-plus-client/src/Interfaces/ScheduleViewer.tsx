import "./ScheduleViewer.css";

const dayNames = [
	"Lunes",
	"Martes",
	"Miercoles",
	"Jueves",
	"Viernes",
	"Sabado",
	"Domingo",
];
const dayHours = [
	"Hora/Dia",
	"6:00",
	"7:00",
	"8:00",
	"9:00",
	"10:00",
	"11:00",
	"12:00",
	"13:00",
	"14:00",
	"15:00",
	"16:00",
	"17:00",
	"18:00",
	"19:00",
	"20:00",
];
const empty = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

const evenBackgroundColor = "var(--schedule-even-background)";
const oddBackgroundColor = "var(--schedule-odd-background)";
const borderColor = "var(--grid-border-color)"; // Ojo pelao que esta variable no esta siendo usada actualmente

const colors = [
	"#484349",
	"#431E82",
	"#792359",
	"#92233B",
	"#D7263D",
	"#A83E28",
	"#772E25",
	"#8F5800",
	"#1C7C54",
	"#386154",
	"#4E6766",
	"#2C666E",
	"#1672A3",
	"#0A498D",
	"#1D1D79",
	"#89355B",
];

export interface ISession {
	section: ISection;
	day: number;
	start: Date;
	end: Date;
}

export interface ISection {
	sessionList: ISession[];
	subject: ISubject;
	nrc: string;
}

export interface ISchedule {
	sectionList: ISection[];
}

export interface ISubject {
	color: string | undefined;
	name: string;
}

export interface ScheduleViewerProperties {
	loadedSchedule: ISchedule;
}

export default function ScheduleViewer({
	loadedSchedule,
}: ScheduleViewerProperties) {
	function assignMissingColors(subjectList: ISubject[]): ISubject[] {
		let colorlist = colors;
		subjectList.map((subject) => {
			const selectedColor =
				colorlist[Math.floor(Math.random() * colorlist.length)];
			subject.color = selectedColor;
			colorlist = colorlist.filter((color) => {
				return color !== selectedColor;
			});
			return subject;
		});
		return subjectList;
	}

	function getSubjectsFromSectionList(): ISubject[] {
		const ret = loadedSchedule.sectionList.map((value) => {
			return value.subject;
		});
		assignMissingColors(ret);
		return ret;
	}

	function hourInBetween(
		start: Date,
		end: Date,
		hour: number,
		minutes: number,
	) {
		if (
			start.getHours() * 60 + start.getMinutes() <= hour * 60 + minutes &&
			end.getHours() * 60 + end.getMinutes() > hour * 60 + minutes
		) {
			return true;
		}
		return false;
	}

	function hourIsSame(time: Date, hour: number, minutes: number): boolean {
		if (time === undefined) return false;
		if (time.getHours() * 60 + time.getMinutes() === hour * 60 + minutes) {
			return true;
		}
		return false;
	}

	function DateToString(time: Date): string {
		return (
			"" +
			(time.getHours() > 9 ? time.getHours() : "0" + time.getHours()) +
			":" +
			(time.getMinutes() == 0 ? "00" : time.getMinutes())
		);
	}

	let remainingSkip = 0;
	const remaningSession = undefined;

	function CreateSubdivisions(sessionsToday: ISession[], hour: number): any {
		return (
			<>
				{["00", "15", "30", "45"].map((subsection) => {
					if (remainingSkip > 0) {
						remainingSkip -= 1;
						return undefined;
					}

					const currentSession: ISession | undefined = sessionsToday
						.filter((session) =>
							hourInBetween(
								session.start,
								session.end,
								hour + 6,
								Number.parseInt(subsection),
							),
						)
						?.at(0);
					if (currentSession == undefined) {
						return (
							<div
								style={{
									borderTop:
										subsection === "00" ? "1px solid " + borderColor : undefined,
									borderBottom:
										subsection === "45" ? "1px solid " + borderColor : undefined,
									backgroundColor:
										hour % 2 === 0 ? evenBackgroundColor : oddBackgroundColor,
								}}
							/>
						);
					}

					remainingSkip =
						(currentSession.end.getHours() * 60 +
							currentSession.end.getMinutes() -
							(currentSession.start.getHours() * 60 +
								currentSession.start.getMinutes())) /
						15;

					const color = currentSession?.section?.subject.color;

					return (
						<>
							<div
								className="session-grid-item"
								style={{
									padding: "2px",
									background: color,
									gridRow: "span " + remainingSkip,
								}}
							>
								{currentSession.section.subject.name} <br />
								{"NRC: " + currentSession.section.nrc} <br />
								{DateToString(currentSession.start) +
									" - " +
									DateToString(currentSession.end)}
							</div>
							<div
								style={{
									borderTop:
										subsection == "00" ? "1px solid " + borderColor : undefined,
									borderBottom:
										subsection == "45" ? "1px solid " + borderColor : undefined,
									backgroundColor:
										hour % 2 == 0 ? evenBackgroundColor : oddBackgroundColor,
								}}
							/>
						</>
					);
				})}
			</>
		);
	}

	return (
		<div className="grid-container">
			{dayHours.map((hour, index) => {
				if (index === 0)
					return (
						<div
							className="center-box-contents"
							style={{
								height: "100%",
								boxSizing: "border-box",
								borderTop: "1px solid " + borderColor,
								borderBottom: "2px soli10" + borderColor,
							}}
						>
							<div> {hour} </div>
						</div>
					);
				return (
					<>
						<div
							className="center-box-contents hour-grid"
							style={{
								height: "100%",
								gridRow: "span 4",
								boxSizing: "border-box",
								borderTop: `1px solid ${borderColor}`,
								borderBottom: `1px solid ${borderColor}`,
							}}
						>
							<div> {hour} </div>
						</div>
					</>
				);
			})}
			{dayNames.map((dayName) => {
				let sessionsToday: ISession[] = [];
				loadedSchedule.sectionList.forEach((section) => {
					sessionsToday = sessionsToday.concat(
						section.sessionList.filter((session) => {
							return dayNames[session.day-1] === dayName;
						}),
					);
				});
				return empty.map((mock, index) => {
					return (
						<>
							{index === 0 && (
								<div
									className="center-box-contents day-grid"
									style={{ height: "100%", border: `1px solid ${borderColor}` }}
								>
									<div> {dayName} </div>
								</div>
							)}
							{CreateSubdivisions(sessionsToday, index)}
						</>
					);
				});
			})}
		</div>
	);
}
