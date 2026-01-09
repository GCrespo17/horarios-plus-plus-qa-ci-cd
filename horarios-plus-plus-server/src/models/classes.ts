import { boolean, z } from "zod";
interface iSession {
	start: Date;
	end: Date;
	day?: number;
}
class Session implements iSession {
	public start: Date;
	public end: Date;
	public day?: number;
	constructor(start: Date, end: Date, day?: number) {
		this.start = start;
		this.end = end;
		if ("undefined" === typeof day) this.day = start.getDay();
		else this.day = day;
	}
}
interface iSubject {
	name: string;
	// sections: iSection[];
	// career: iCareer;
}
class Subject implements iSubject {
	public name;
	public sections;
	public career;
	constructor(name: string, sections: Section[], career: Career) {
		this.name = name;
		this.sections = sections;
		this.career = career;
	}
	public static sortSubjectsBySectionLength(subjects: Subject[]) {
		return subjects.sort((a, b) => a.sections.length - b.sections.length);
	}
	public static obtenerMaterias(sections: Section[]): Subject[] {
		const materias = new Array();
		const materiaInicial = new Subject(
			sections[0].subject.name,
			[sections[0]],
			sections[0].subject.career,
		);
		materias.push(materiaInicial);
		let booleano = true;
		for (let i = 1; i < sections.length; i++) {
			booleano = false;
			for (let j = 0; j < materias.length; j++) {
				if (Section.mismaMateria(sections[i], materias[j].sections[0])) {
					materias[j].sections.push(sections[i]);
					booleano = true;
					break;
				}
			}
			if (!booleano) {
				const materia = new Subject(
					sections[i].subject.name,
					[sections[i]],
					sections[i].subject.career,
				);
				materias.push(materia);
			}
		}
		return materias;
	}
}

interface iCareer {
	name: string;
	// subjects?: iSubject[];
}
class Career implements iCareer {
	name;
	subjects?: Subject[];
	constructor(name: string, subjects?: Subject[]) {
		this.name = name;
		this.subjects = subjects;
	}
}

interface iSection {
	nrc: string;
	teacher: string;
	sessions: iSession[];
	// subject: iSubject;
}
class Section implements iSection {
	nrc;
	teacher;
	sessions;
	public subject: Subject;
	constructor(
		nrc: string,
		teacher: string,
		sessions: Session[],
		subject: Subject,
	) {
		this.nrc = nrc;
		this.teacher = teacher;
		this.sessions = sessions;
			this.subject = subject;
			this.subject.sections.push(this);
	}
	public static mismaMateria(section1: Section, section2: Section) {
		if (section1.subject === section2.subject) {
			return true;
		}
		return false;
	}
	public static sonCompatibles(section1: Section, section2: Section) {
		for (const session1 of section1.sessions) {
			console.log("session1",session1);
			
			for (const session2 of section2.sessions) {
				console.log("session2",session2);
				
				console.log("entre a comparar");
				
					if (
						(session1.start.getTime() >= session2.start.getTime()) &&
						(session1.start.getTime() <= session2.end.getTime())
					){
						console.log("false");
						return false;
					}
						// (
						// 	(
						// 		session1.start.getTime() >= session2.start.getTime() &&
						// 		session1.start.getTime() >= session2.end.getTime()
						// 	)&&(
						// 		session1.end.getTime() >= session2.start.getTime() && 
						// 		session1.end.getTime() >= session2.end.getTime())
							
						// )||
					if(
						(session1.end.getTime() >= session2.start.getTime()) && 
						(session1.end.getTime() <= session2.end.getTime())
					)
					{
						console.log("false");
						return false;
					}
			}
		}
		console.log("true salida sin saber");
		return true;
	}
}

// interface iSchedule {
// 	owner: iUser;
// 	sections: iSection[];
// }
class Schedule {
	owner: User;
	sections;
	constructor(owner: User, sections: Section[]) {
		this.owner = owner;
		this.sections = sections;
	}
	public static compararScheduleSection(schedule: Schedule, newSection: Section):boolean{
		let booleano = true;
		schedule.sections.forEach((section) => {
			console.log("entre " + section.subject.name , newSection.subject.name,"\n");
			console.log("entre ",Bun.inspect(section,{depth:4,colors:true}),Bun.inspect(newSection,{depth:4,colors:true}),"\n");
			
			if (!Section.sonCompatibles(section, newSection)) {
				
				booleano = false;
				console.log("entre " + section.nrc + " y " + newSection.nrc,"son compatibles?:",booleano);
			}
		});
		return booleano;
	}
	public static filtrarHorariosPorMaterias(schedules: Schedule[],materias: Subject[]):Schedule[] {
		for (let i = 0; i < schedules.length; i++) {
			if (schedules[i].sections.length !== materias.length) {
				schedules.splice(i, 1);
				i--;
			}
		}
		return schedules;
	}
	public static recursiveSchedulePush(index: number,materias: Subject[],schedule: Schedule,schedules: Schedule[]):void {
		const temp = new Schedule(schedule.owner, []);
		for (let i = 0; i < schedule.sections.length; i++) {
			temp.sections.push(schedule.sections[i]);
		}
		if (index === materias.length) {
			if (temp.sections.length === materias.length) {
				schedules.push(temp);
			}
			return;
		}
		for (let i = 0; i < materias[index].sections.length; i++) {
			let booleano = false;
			if (Schedule.compararScheduleSection(temp, materias[index].sections[i])) {
				temp.sections.push(materias[index].sections[i]);
				booleano = true;
			}
			Schedule.recursiveSchedulePush(index + 1, materias, temp, schedules);
			if (booleano) {
				temp.sections.pop();
			}
		}
	}
}
// 1. Create an interface representing a document in MongoDB.
interface iUser {
	email: string;
	password: string;
	tipo: number;
	schedule?: iSection[];
}
class User implements iUser {
	email: string;
	password: string;
	tipo: number;
	schedule?: iSection[];

	constructor(
		email: string,
		password: string,
		tipo: number,
		schedule?: iSection[],
	) {
		this.email = email;
		this.password = password;
		this.tipo = this.validateEmail(email);
		this.schedule = schedule;
	}
	private validateEmail(email: string): 0 | 1 | 2 {
		const emailSchema = z.string().email("Invalid email");
		try {
			emailSchema.parse(email);
			if (email.endsWith("@ucab.edu.ve")) {
				return 2; // Email ends with ucab.edu.ve
			}
			return 1; // Valid email
		} catch (error) {
			return 0; // Invalid email
		}
	}
	public getSchedules(sections: Section[]):Schedule[] {
		let materias = Subject.obtenerMaterias(sections);
		materias = Subject.sortSubjectsBySectionLength(materias);
		let schedules = new Array();
		const scheduleInicial = new Schedule(this, []);
		Schedule.recursiveSchedulePush(0, materias, scheduleInicial, schedules);
		schedules = Schedule.filtrarHorariosPorMaterias(schedules, materias);
		return schedules;
	}
}

export { Session, Subject, Career, Section, Schedule, User };
export type { iSession, iSubject, iCareer, iSection,  iUser };
