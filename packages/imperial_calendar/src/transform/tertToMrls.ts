import { TerrestrialTime } from "../TerrestrialTime";

function tertToOffsetSinceJ2000(tert: TerrestrialTime): number {
  return tert.terrestrialTime - 2451545.0;
}

function offsetToMarsMeanAnomaly(offset: number): number {
  return 19.3871 + 0.52402073 * offset;
}

function offsetToAngleOfFictitiousMeanSun(offset: number): number {
  return 270.3871 + 0.524038496 * offset;
}

function offsetToPerturbers(offset: number): number {
  const amp = [0.0071, 0.0057, 0.0039, 0.0037, 0.0021, 0.002, 0.0018];
  const tau = [2.2353, 2.7543, 1.1177, 15.7866, 2.1354, 2.4694, 32.8493];
  const phi = [49.409, 168.173, 191.837, 21.736, 15.704, 95.528, 49.095];
  let perturbers = 0;
  for (let i = 0; i < amp.length; i += 1) {
    const angle = ((360 / 365.25) * offset) / tau[i] + phi[i];
    perturbers += amp[i] * Math.cos((angle * Math.PI) / 180);
  }
  return perturbers;
}

function offsetToEquationOfCenter(offset: number): number {
  const angleM = (offsetToMarsMeanAnomaly(offset) * Math.PI) / 180;
  const pbs = offsetToPerturbers(offset);
  return (
    (10.691 + 0.0000003 * offset) * Math.sin(angleM) +
    0.623 * Math.sin(2 * angleM) +
    0.05 * Math.sin(3 * angleM) +
    0.005 * Math.sin(4 * angleM) +
    0.0005 * Math.sin(5 * angleM) +
    pbs
  );
}

function offsetToAreocentricSolarLongitude(offset: number): number {
  const alphaFms = offsetToAngleOfFictitiousMeanSun(offset);
  const equationOfCenter = offsetToEquationOfCenter(offset);
  const longitude = alphaFms + equationOfCenter;
  return ((longitude % 360) + 360) % 360;
}

export function tertToMrls(tert: TerrestrialTime): number {
  const offset = tertToOffsetSinceJ2000(tert);
  return offsetToAreocentricSolarLongitude(offset);
}
