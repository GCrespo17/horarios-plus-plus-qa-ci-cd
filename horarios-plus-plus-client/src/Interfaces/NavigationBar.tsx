
const storedData = sessionStorage.getItem("login");
const storedTipo = sessionStorage.getItem("tipo");
const tipo = storedTipo === null ? "" : +storedTipo;
const username = storedData === null ? "" : storedData.substring(0, storedData.indexOf("@"));
const loggedIn = !(storedData === null);
let cuenta = "estudiante";
// tipo de usuario
if(tipo){
	if(tipo===0){
		cuenta = "estudiante";
	}else if(tipo===1){
		cuenta = "estudiante-eventos";
	}else if(tipo===2){
		cuenta = "profesor";
	}else if(tipo===3){
		cuenta = "profesor-eventos";
	}else if(tipo===4){
		cuenta = "admin";
	}
}

// 0: usuario normal solo genera, mira horario y cruza eventos
// 1: 0 + Crud eventos
// 2: 0 + Crud secciones y sessiones
// 3: 2 + Crud eventos
// 4: todo y maneja permisos

export default function NavigationBar() {
	return (
		<div className="navbar-container">
			<div>
				<a href="/">
					<h1>Horarios++</h1>
				</a>
			</div>
			{(loggedIn)&& (
				<>
					{(<> {/*EL tipo 4 se pone aqui solo en la etapa de pruebas, quitar después*/}
					<div>
						<a href="/schedule">Mi Horario</a>
					</div>
					<div>
						<a href="/generation">Generar Horario Nuevo</a>
					</div>
					</>)}
					{(tipo===2||tipo===3||tipo===4)&&(<div>
						<a href="/time_blocks">Agregar Materia</a>
					</div>)}
					{(tipo===1||tipo===3||tipo===4)&&(<div>
						<a href="/events">Administrar Eventos</a>
					</div>)}
					{(tipo===4)&&(<div>
						<a href="/perms">Administrar Usuarios</a>
					</div>)}
					<div className="space"/>
					<div className="username">
						<p className={cuenta}>{username}</p>
					</div>
				</>
			)}
			{!loggedIn && (
				<>
					<div className="space"/>
					<div className="sign-up">
						<a href="/login">Iniciar Sesion</a>
					</div>
					<div className="sign-up">
						<a href="/sign_up">Crear Cuenta</a>
					</div>
				</>
			)}
		</div>
	);
}
