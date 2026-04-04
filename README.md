# Método Húngaro

Proyecto web para resolver problemas de asignación mínima usando el método húngaro.

La aplicación permite ingresar una matriz de costos de tamaño N x N, calcular la asignación óptima entre conductores y rutas, y mostrar el costo total mínimo.

## Qué hace

- Permite definir el tamaño de la matriz
- Permite ingresar los costos manualmente
- Calcula la asignación óptima
- Muestra el resultado final y el costo total
- Presenta una interfaz sencilla y fácil de usar

## Ejemplo de uso

Puedes probar con esta matriz 3x3:

|        | Ruta 1 | Ruta 2 | Ruta 3 |
|--------|--------|--------|--------|
| Cond 1 | 9      | 2      | 7      |
| Cond 2 | 6      | 4      | 3      |
| Cond 3 | 5      | 8      | 1      |

Resultado esperado:

- Conductor 1 → Ruta 2
- Conductor 2 → Ruta 1
- Conductor 3 → Ruta 3
- Costo total mínimo: 9

## Objetivo

Este proyecto fue desarrollado como parte de la materia Investigación de Operaciones para aplicar de forma práctica el método húngaro en un caso de asignación de costo mínimo.

## Integrantes

- Geronimo Velasco — Código 126667
- Julian Castro — Código 126567

## Institución

Universidad ECCI  
Materia: Investigación de Operaciones  
Profesor: Jonathan L Gutierrez V

## Cómo ejecutar el proyecto

```bash
npm install
ng serve
