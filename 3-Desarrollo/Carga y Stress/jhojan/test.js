import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. Opciones: define el patrón de carga con "etapas" (stages)
export let options = {
  stages: [
    // Pruebas de Humo (Smoke Test - Carga mínima para verificar que funciona)
    { duration: '15s', target: 30 }, 
    { duration: '30s', target: 30 }, 
    { duration: '15s', target: 0 }, 

    // Pruebas de Carga (Load Test - Carga normal/esperada)
    { duration: '1m', target: 300 }, 
    { duration: '90s', target: 300 }, 
    { duration: '1m', target: 0 }, 

    // Pruebas de Stress (Stress Test - Al límite de la capacidad)
    { duration: '90s', target: 600 }, 
    { duration: '2m', target: 600 }, 
    { duration: '90s', target: 0 }, 

    // Pruebas de Pico (Spike Test - Picos repentinos de tráfico)
    { duration: '20s', target: 1500 }, 
    { duration: '50s', target: 1500 }, 
    { duration: '20s', target: 0 }, 
  ],
};


// 2. Función principal: el código que ejecuta cada usuario virtual
export default function () {
  let res = http.get('http://localhost:3000'); // Cambia esta URL por la de tu API o web -> La web - Frontend
  check(res, {
    'el estado es 200': (r) => r.status === 200,
  });
  sleep(1); // Pausa de 1 segundo entre peticiones
}
