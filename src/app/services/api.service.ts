import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // 🔥 URL dinámica (local o producción) definida en environments
  private readonly baseUrl = environment.apiUrl;
  
  // Usamos inject para una sintaxis más limpia (Angular 14+)
  private http = inject(HttpClient);

  constructor() {}

  // =========================
  // 🔹 SERVICIOS (MySQL)
  // =========================

  getServicios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/servicios`);
  }

  crearServicio(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/servicios`, data);
  }

  // =========================
  // 🔹 BITÁCORA (Firestore vía API)
  // =========================

  getBitacora(servicioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/bitacora/${servicioId}`);
  }

  // =========================
  // 🔹 CLIENTES (MySQL CRUD)
  // =========================

  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/clientes`);
  }

  crearCliente(cliente: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/clientes`, cliente);
  }

  actualizarCliente(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/clientes/${id}`, data);
  }

  eliminarCliente(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/clientes/${id}`);
  }

  // =========================
  // 🔹 SUCURSALES (MySQL)
  // =========================

  getSucursales(): Observable<any[]> {
    // Especificamos <any[]> para que el componente reciba el array directamente
    return this.http.get<any[]>(`${this.baseUrl}/sucursales`);
  }

  crearSucursal(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/sucursales`, data);
  }
}