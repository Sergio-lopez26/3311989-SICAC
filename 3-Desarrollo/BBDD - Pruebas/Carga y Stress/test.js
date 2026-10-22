import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. Opciones: define el patrón de carga con "etapas" (stages)
export let options = {
  stages: [
    //Pruebas de Humo
    /*
    { duration: '15s', target: 10 }, // Sube de 1 a 10 usuarios virtuales en 30s -> 15s
    { duration: '30s', target: 10 },  // Mantiene 10 usuarios durante 1 minuto -> 30s
    { duration: '15s', target: 0 },  // Baja de 10 a 0 usuarios en 30s -> 15s
    // */
    //Pruebas de Carga
    /*
    { duration: '1m', target: 100 },
    { duration: '90s', target: 100 },
    { duration: '1m', target: 0 },
    */
    //Pruebas de Stress
    /*
    { duration: '90s', target: 200 },
    { duration: '2m', target: 200 },
    { duration: '90s', target: 0 },
    */
    //Pruebas de Pico
    
    { duration: '20s', target: 500 },
    { duration: '50s', target: 500 },
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
