# Ashes of War

Este es un proyecto web estático que por un lado recoge las reglas de un juego de estrategia de miniaturas de la segunda guerra mundial y tiene un inventario de unidades.

La web será estática para no depender de servicios externos y podrá ser consultada de forma pública.

La web estará desarrollada principalmente en React usando Typescript y MUI como librería de componentes gráficos.

Las reglas del juego están en fase de diseño.

Este proyecto tendrá una colección de ficheros con formato JSON donde se definirán los perfiles de cada vehículo, carro de combate, arma remolcada, unidad de infantería, o arma.

Dentro de cada JSON por un lado tendremos información histórica real como por ejemplo los valores de velocidad máxima de una unidad en KM/h y una serie de datos de juego como por ejemplo una velocidad de 15 pulgadas por turno.

Habrá fórmulas de transformación entre estos valores y los del juego.

Cada tipo de unidad tendrá unas reglas de validación y estructura del JSON específica.

La estructura en la que se almacenerá la información será la siguiente:

data/
  vehicles/
    germany/
      panther-ausf-g.json
      tiger-i-ausf-e.json
    usa/
      m4a3-sherman.json
  towed/
    germany/
      7.5-cm-pak-40.json
  weapons/
    germany/
      75mm-kwk-42-l70.json
      88mm-kwk-36-l56.json
  infantry-units/
    germany/
      panzergrenadier-squad-1944.json
      volksgrenadier-squad-1944.json

Las datas tendrán un dato de fecha de revisión para poder llevar el control de cuando han sido validadas.