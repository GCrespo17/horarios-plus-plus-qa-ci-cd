import React from "react";
import { apiBaseUrl, regExpEmail, regExpPassword } from "./helpers.tsx";
import NavigationBar from "./NavigationBar";
import "./SignUpInterface.css";
import { set } from "mongoose";

export default function SignUpInterface() {
	const [email, setEmail] = React.useState();
	const [password, setPassword] = React.useState();
	const [showError, setShowError] = React.useState(false);
	const [errorMessage, setErrorMessage] = React.useState("");

	const [showSuccessful, setShowSuccesful] = React.useState(false);
	const [successfulMessage,setSuccesfulMessage] = React.useState("");

	const [showMessageE, setshowMessageE] = React.useState(false);
	const [showMessageP, setshowMessageP] = React.useState(false);

	const regexHandlerEmail = new RegExp(regExpEmail);
	const regexHandlerPassword = new RegExp(regExpPassword);

	function handleEmail(event: any) {
		setEmail(event.target.value);
		if(regexHandlerEmail.test(event.target.value)) { 
			setshowMessageE(true);
		  }else{setshowMessageE(false)}
	}
	function handlePassword(event: any) {
		setPassword(event.target.value);
		if (regexHandlerPassword.test(event.target.value)) {
			setshowMessageP(true);
			setShowError(false);
			setSuccesfulMessage("Contraseña válida");
			setShowSuccesful(true);
		}else{
			setshowMessageP(false);
			setErrorMessage("Formato de contraseña inválido");
			setShowError(true);
		}
	}

	function timeout(delay: number) {
		return new Promise( res => setTimeout(res, delay) );
	  }
	

	async function SendCredentialsDatabase() {
		const url = new URL("/api/sign_up", apiBaseUrl);
		if (email !== undefined) {
			url.searchParams.set("email", String(email));
		}
		if (password !== undefined) {
			url.searchParams.set("password", String(password));
		}
		return await fetch(url.toString(), {
			headers: { Accept: "application/json" },
		})
			.then((response) => response.json())
			.catch((e) => {
				console.log("Could not send sign up to database");
			})
			.then((data) => {
				console.log(data);
				return data;
			})
			.finally(() => {
				window.location.href = "/login";
			});
	}
	const handleClick =() => {
		if(!showMessageE) { 
			
		  setErrorMessage("Por favor ingrese un correo valido");
		  setShowError(true);
		}else if(!showMessageP){
			setErrorMessage("Contraseña invalida");
			setShowError(true);
		}else{
		  SendCredentialsDatabase()
			.then(async(data) => {
				
				if (data.message === "User created successfully") {
					setShowError(false);
					setSuccesfulMessage("Usuario registrado exitosamente. Redirigiendo a la página de inicio de sesión.");
					setShowSuccesful(true);
					await timeout(2000);
					//window.location.href = "/login";
				}else {
					if (data.message === "User already exist") {
						setErrorMessage("Este usuario ya está registrado");
					}else if (data.message === "Failed to sign up: A value is undefined or null"){
						setErrorMessage("Por favor llene todos los campos");
					}else {
						setErrorMessage("Error desconocido");
					}
					setShowError(true);
				}
				
			  
			})
			.catch(() => {
			  setShowError(true);
			});
		}
	  };

	return (
		<div>
			<NavigationBar />
			<div className="main-container">
				<div className="signup-container">
					<div className="signup-content">
						<div className="signup-bg">
							<div className="signup-header">Crea un Usuario</div>
							{showError && <div className="login-error">{errorMessage}</div>}
							{showSuccessful && <div className="login-succesful">{successfulMessage}</div>}
							<div className="signup-user">
								<input
									value={email}
									onChange={handleEmail}
									placeholder="Introduzca un email"
									type="text"
								/>
							</div>
							<div className="signup-password">
								<input
									value={password}
									onChange={handlePassword}
									placeholder="Introduzca una contraseña"
									type="text"
								/>
							</div>
							<div className="signup-button">
								<button onClick={handleClick} type="button">
									Crear Cuenta
								</button>
							</div>
						</div>
						<div className="formato-contraseña">
							<div className="formato-contraseña-header">Formato de contraseña</div>
							<div className="formato-contraseña-text">
								<ul>
									<li>Al menos 8 caracteres</li>
									<li>Al menos una letra mayúscula</li>
									<li>Al menos una letra minúscula</li>
									<li>Al menos un número</li>
								</ul>
							</div>
						</div>
					</div>
					<div className="signup-footer">
						<div className="signup-footer-text">
							Ya tienes una cuenta?
							<a href="/login"> Inicia Sesión</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
