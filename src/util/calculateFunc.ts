export function cartesianToCylindrical(x, y) {
  const theta = Math.atan2(y, x);
  return (theta * 180) / Math.PI;
}

export function vectorToTheta(KP, a, b) {
  const v_x = KP[a].x - KP[b].x;
  const v_y = KP[a].y - KP[b].y;
  return cartesianToCylindrical(v_x, v_y);
}

export function degreeByTheta(x, y) {
  return Math.abs(x - y);
}

export function degreeToTheta(x) {
  return (Math.PI / 180) * x;
}
