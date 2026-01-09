import { describe, test, expect, beforeAll } from "bun:test";

const BASE_URL = process.env.BASE_URL || "http://localhost:4000/api";

// Variables para compartir entre tests
let createdSubjectName: string;
let createdNrc: string;

// =============================================================================
// Health Check - Verificar conexión antes de tests
// =============================================================================
describe("Health Check", () => {
	test("El servidor debe estar disponible", async () => {
		console.log(`Intentando conectar a: ${BASE_URL.replace('/api', '')}/health`);
		
		// Reintentar hasta 5 veces con delay
		let lastError: Error | null = null;
		for (let i = 0; i < 5; i++) {
			try {
				const response = await fetch(`${BASE_URL.replace('/api', '')}/health`, {
					method: "GET",
				});
				
				console.log(`Health check response: ${response.status}`);
				expect(response.status).toBe(200);
				
				const data = await response.json();
				console.log(`Health check data:`, data);
				expect(data.status).toBe("ok");
				return; // Éxito, salir del test
			} catch (error) {
				lastError = error as Error;
				console.log(`Intento ${i + 1}/5 falló: ${lastError.message}`);
				await new Promise(resolve => setTimeout(resolve, 1000));
			}
		}
		
		throw lastError || new Error("No se pudo conectar al servidor");
	});
});

// =============================================================================
// CP-INT-01: Persistencia de Nueva Sección
// =============================================================================
// Valida que al enviar datos de sección al endpoint, el registro se crea
// físicamente en la colección de MongoDB.
// Éxito: HTTP 200 y documento hallado en DB.
// =============================================================================
describe("CP-INT-01: Persistencia de Nueva Sección", () => {
	beforeAll(() => {
		// Generar nombres únicos para evitar conflictos
		const timestamp = Date.now();
		createdSubjectName = `MateriaIntTest_${timestamp}`;
		createdNrc = `${timestamp}`;
	});

	test("GET /api/subjects/create_subject - debe crear materia de prueba", async () => {
		const response = await fetch(
			`${BASE_URL}/subjects/create_subject?name=${createdSubjectName}`,
			{ method: "GET" }
		);

		expect(response.status).toBe(200);

		const text = await response.text();
		expect(text).toBeDefined();
		expect(text).not.toBe("undefined");
	});

	test("GET /api/section/add_section_to_subject - debe crear sección", async () => {
		// La API requiere: nrc, teacher, subjectName, papa
		const params = new URLSearchParams({
			nrc: createdNrc,
			teacher: "Dr. Integration Test",
			subjectName: createdSubjectName,
			papa: "test"  // Campo requerido por la API
		});

		const response = await fetch(
			`${BASE_URL}/section/add_section_to_subject?${params}`,
			{ method: "GET" }
		);

		expect(response.status).toBe(200);

		const text = await response.text();
		expect(text).toBeDefined();
		// Verificar que no retornó undefined (error)
		expect(text).not.toBe("undefined");
	});

	test("GET /api/section/get_sections_from_subject - debe encontrar la sección creada", async () => {
		const response = await fetch(
			`${BASE_URL}/section/get_sections_from_subject?subjectName=${createdSubjectName}`,
			{ method: "GET" }
		);

		expect(response.status).toBe(200);

		const data = await response.json();
		expect(Array.isArray(data)).toBe(true);
		expect(data.length).toBeGreaterThan(0);
	});
});

// =============================================================================
// CP-INT-02: Respuesta del Generador
// =============================================================================
// Valida que el endpoint del algoritmo responde con un array de horarios
// válido y no genera timeout/crash.
// Éxito: HTTP 200 y JSON Array.
// =============================================================================
describe("CP-INT-02: Respuesta del Generador", () => {
	test("GET /api/schedules/generate_schedules - debe retornar HTTP 200 con NRC válido", async () => {
		// Usar el NRC creado en el test anterior
		const params = new URLSearchParams({
			owner: "test@integration.com",
			nrcs: createdNrc
		});

		const response = await fetch(
			`${BASE_URL}/schedules/generate_schedules?${params}`,
			{ method: "GET" }
		);

		expect(response.status).toBe(200);

		const text = await response.text();
		expect(text).toBeDefined();
	});

	test("GET /api/schedules/generate_schedules - no debe generar timeout (< 10s)", async () => {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000);

		const startTime = Date.now();

		const params = new URLSearchParams({
			owner: "test@integration.com",
			nrcs: createdNrc
		});

		try {
			const response = await fetch(
				`${BASE_URL}/schedules/generate_schedules?${params}`,
				{
					method: "GET",
					signal: controller.signal
				}
			);

			clearTimeout(timeoutId);

			const endTime = Date.now();
			const duration = endTime - startTime;

			expect(response.status).toBe(200);
			expect(duration).toBeLessThan(10000);
		} catch (error: unknown) {
			clearTimeout(timeoutId);
			if (error instanceof Error && error.name === "AbortError") {
				throw new Error("Request timed out after 10 seconds");
			}
			throw error;
		}
	});

	test("GET /api/schedules/generate_schedules - debe retornar JSON válido", async () => {
		const params = new URLSearchParams({
			owner: "test@integration.com",
			nrcs: createdNrc
		});

		const response = await fetch(
			`${BASE_URL}/schedules/generate_schedules?${params}`,
			{ method: "GET" }
		);

		expect(response.status).toBe(200);

		const text = await response.text();
		// Verificar que es JSON parseable
		expect(() => JSON.parse(text)).not.toThrow();
	});
});

