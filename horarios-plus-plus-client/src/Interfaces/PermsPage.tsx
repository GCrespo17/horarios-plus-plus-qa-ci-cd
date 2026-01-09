import NavigationBar from "./NavigationBar.tsx";
import "./PermsPage.css";
import React from "react";
import { useState } from "react";
import { apiBaseUrl, regExpEmail } from "./helpers.tsx";
import toast, { Toaster } from "react-hot-toast";

interface ISection {
	nrc: number;
}

interface ISubject {
	name: string;
	sectionList: Array<ISection>;
}

interface CourseProperties {
	displayCourse: ISubject;
	newSectionBind: (course: ISubject) => ISubject;
	removeSectionBind: (course: ISubject, section: ISection) => ISubject;
	selectSectionBind: (section: ISection) => void;
	editable: boolean;
	updateSelectedSubject: (oldSubject: ISubject, newSubject: ISubject) => boolean;
	removeSubjectBind: (subject: ISubject, section: ISection) => void;
}

interface IUser {
	email: string;
	tipo: string;
	permiso: boolean;
}

interface UserContainerParams {
	user: IUser;
	updatePermision: any;
	updateRol: any;
	setCambio: any;

}

function UserContainer({user,updatePermision,updateRol,setCambio}:UserContainerParams) {
	const username = user.email.substring(0, user.email.indexOf("@"));
	const [rol, setRol] = React.useState(transformarRol(user));

	function updatePermisionL(permiso:string){
		updatePermision(user.email,permiso);
		setRol(transformarRol(user));

	}

	function updateRolL(rol:string){
		updateRol(user.email,rol);
		setRol(transformarRol(user));
	}

	function transformarRol(user:IUser){

		if (user.permiso) {
			return user.tipo === "estudiante" ?  "estudiante-eventos": user.tipo === "profesor" ? "profesor-eventos" : "admin";
		}else{
			return user.tipo === "estudiante" ? "estudiante" : user.tipo === "profesor" ? "profesor" : "admin";
		}
	}

	function eliminarCuentaDB(email:string) {
		const url = new URL("/api/deleteUser", apiBaseUrl);
		url.searchParams.set("email", email);
		fetch(url.toString(), {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email: email }),
		})
			.then((response) => response.json())
			.then((data) => {
				console.log(data);
				if(data.message === "User deleted successfully"){
					toast.success("Usuario eliminado");
					setCambio(true);
				}
			}
		)
		
	}

	function eliminarCuenta(mail:string){
		// console.log(mail);
		eliminarCuentaDB(mail);
	}

	return (
		<div className="user">
			<div className="user-email" id={rol}>{username}</div>
			<select form="formUsuarios" name="roles-usuario" defaultValue={user.tipo} id="roles-usuario" onChange={(e)=>{updateRolL(e.target.value)}}>
				<option value="estudiante">Estudiante</option>
				<option value="profesor">Profesor</option>
				<option value="admin">Admin</option>
			</select >
			<select form="formUsuarios" name="permiso" defaultValue={user.permiso?"si":"no"} id="permiso" onChange={(e)=>{updatePermisionL(e.target.value)}}>
				<option value="si">Sí</option>
				<option value="no">No</option>
			</select>
			<button className="eliminar-button" onClick={()=>eliminarCuenta(user.email)} type="button">
				Eliminar
			</button>
		</div>
	);
}



export default function PermsInterface() {
	const [loadedUsers, setLoadedUsers] = React.useState<Array<IUser>>();
	const [changedUsers, setChangedUsers] = React.useState<Array<IUser>>(new Array<IUser>());
	const [editable, setEditable] = React.useState(false);

		React.useEffect(() => {
			(async () => {
				if (loadedUsers) {
					return;
				}
				setLoadedUsers(await fetchUsers());
			})();
		});
		React.useEffect(() => {
			(async () => {
				if (editable) {
					setLoadedUsers(await fetchUsers());
					setEditable(false);

				}
			})();
		});


	async function fetchUsers() {
		const usersUrl = new URL("/api/get_usuarios", apiBaseUrl);
		const users = await fetch(usersUrl.toString(), {
			headers: { Accept: "application/json" },
		})
			.then((response) => response.json())
			.catch((_e) => {
				console.log("no se pudo cargar la lista de usuarios");
			})
			.then((data) => {
					
				return data.map(async (user:{email:string,tipo:number}) => {
					let tipo="estudiante";
					let permiso=false;
					if(user.tipo===1){
						tipo="estudiante";
						permiso=true;
					}else if(user.tipo===2){
						tipo = "profesor";
						permiso=false;
					}else if(user.tipo===3){
						tipo = "profesor";
						permiso=true;
					}else if(user.tipo===4){
						tipo = "admin";
					}

					const newUser: IUser = {
						//career: [],
						email: user.email,
						tipo: tipo,
						permiso: permiso,
					};
					console.log(newUser);
					return newUser;
				});
			});
		return Promise.all(users);
	}

	function updateChangedUser(user:IUser){
		if (!changedUsers?.includes(user)) {
			setChangedUsers([...changedUsers, user]);
		}
		console.log(changedUsers);
	}

	function updatePermision(email:string,permiso:string){
		setLoadedUsers(
			loadedUsers?.map((user)=>{
				if(user.email===email){
					user.permiso=permiso==="si";
					updateChangedUser(user);
				}
				return user;
			})
		)
	}

	function updateRol(email:string,rol:string){
		setLoadedUsers(
			loadedUsers?.map((user)=>{
				if(user.email===email){
					user.tipo=rol;
					updateChangedUser(user);
				}
				return user;
			})
		)
	}

	function transformarEnEnviar() {
		return {
			usuarios: changedUsers.map((user) => {
				let tipo=0;
				if (user.permiso) {
					user.tipo === "estudiante" ? tipo=1 : user.tipo === "profesor" ? tipo=3 : tipo=4;
				}else
					user.tipo === "estudiante" ? tipo=0 : user.tipo === "profesor" ? tipo=2 : tipo=4;

				return { email: user.email, tipo: tipo};
			}),
		};
	}

	function handleSubmit(e) {
    // Evita que el navegador recargue la página
    e.preventDefault();
    // Lee los datos del formulario
    const form = e.target;
    const formData = new FormData(form);
    console.log(formData.getAll('email'));
		console.log(formData.getAll('permiso'));
		console.log(formData.getAll('roles-usuario'));

		// Puedes pasar formData como cuerpo del fetch directamente:
		console.log(transformarEnEnviar());
		

		const updateUrl = new URL("/api/update_users", apiBaseUrl);
    fetch(updateUrl.toString(), {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(transformarEnEnviar())
		})
	.catch((e) => {
		toast.error("No se pudieron guardar los cambios");
		return;
	})
	toast.success("Cambios guardados");
    // Puedes generar una URL de él, como hace el navegador por defecto:
	}

	return (
		<div>
			<Toaster
				position="bottom-right"
				reverseOrder={false}
				/>
			<NavigationBar />
			<main className="main-container">
				<div className="Titulo"><h1>Permisos</h1></div>
				<div className="perms-container">
					<section className="Usuarios">
						<form id="formUsuarios" method="PUT" onSubmit={handleSubmit} >
							<h2>Usuarios</h2>
							<div className="lista-usuarios">
								{
									loadedUsers?.map((user) => {
										return (
											<UserContainer user={user} updatePermision={updatePermision} updateRol={updateRol} setCambio={setEditable}/>
										);
									})
								}
							</div>
							<button type="submit">Guardar</button>
						</form>
					</section>
				</div>
			</main>
		</div>
	);
}

