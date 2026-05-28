# Vehículos

## Blindaje

Los vehículos tienen cuatro niveles de blindaje:

- *Frontal*
- *Lateral*
- *Trasero*
- *Expuesto*

Estos valores se establecen estableciendo el promedio de blindaje de cada una de las partes del vehículo cuando fueran diferentes (por ejemplo en el casco, superestructura, mantelete, etc).

El blindaje expuesto representa las zonas menos blindadas del vehículo que pudieran ser atacadas localmente como por ejemplo infantería accediendo a elementos expuestos de un carro de combate como el sistema de ventilación, francotiradores con rifles pesados dañando las ópticas o un ataque de aviación resuelto contra el blindaje superior.

### Cálculo de los valores de blindaje

De cara a mantener una coherencia y verosimilutud con los datos reales el blindaje efectivo será calculado del modo siguiente:

**Blindaje efectivo = Escala * (Blindaje en mm / cos(θ))**

*Por ejemplo para un blindaje de 80mm inclinado 55º tendremos (sin aplicar escala):*

*Ef = 80 / cos(55º) ≈ 139 mm*

