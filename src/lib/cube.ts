/**
 * Isometric drawing of the 3×3×3 system cube, as plain SVG geometry.
 * Used for the hero's first paint / no-WebGL fallback and for the OG image.
 * Same orientation as the WebGL scene in src/scripts/hero3d.ts.
 */

const S = 46;

export type CubeTile = { points: string; face: 'top' | 'x' | 'z'; key: boolean };

const project = (x: number, y: number, z: number) =>
  `${((x - z) * 0.7071 * S).toFixed(1)},${(((x - 2 * y + z) / 2.4495) * S).toFixed(1)}`;

const quad = (pts: [number, number, number][]) => pts.map((p) => project(...p)).join(' ');

export const cubeViewBox = `${-2.25 * S} ${-2.6 * S} ${4.5 * S} ${5.2 * S}`;
export const cubeSize = { width: 4.5 * S, height: 5.2 * S };

export const cubeTiles = (): CubeTile[] => {
  const tiles: CubeTile[] = [];
  for (const i of [0, 1, 2]) {
    for (const j of [0, 1, 2]) {
      // The marked module is the corner that points at the reader.
      const key = i === 2 && j === 2;
      tiles.push({ face: 'top', key, points: quad([[i, 3, j], [i + 1, 3, j], [i + 1, 3, j + 1], [i, 3, j + 1]]) });
      tiles.push({ face: 'x', key, points: quad([[3, i, j], [3, i + 1, j], [3, i + 1, j + 1], [3, i, j + 1]]) });
      tiles.push({ face: 'z', key, points: quad([[i, j, 3], [i + 1, j, 3], [i + 1, j + 1, 3], [i, j + 1, 3]]) });
    }
  }
  return tiles;
};

/** Standalone SVG string with fixed colours (for images, not for the page). */
export const cubeSvg = (colors: {
  ink: string;
  top: string;
  x: string;
  z: string;
  keyTop: string;
  keyX: string;
  keyZ: string;
}): string => {
  const fill = (tile: CubeTile) =>
    tile.key
      ? { top: colors.keyTop, x: colors.keyX, z: colors.keyZ }[tile.face]
      : { top: colors.top, x: colors.x, z: colors.z }[tile.face];
  const polygons = cubeTiles()
    .map(
      (tile) =>
        `<polygon points="${tile.points}" fill="${fill(tile)}" stroke="${colors.ink}" stroke-width="2.4" stroke-linejoin="round"/>`,
    )
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${cubeViewBox}" width="${cubeSize.width}" height="${cubeSize.height}">${polygons}</svg>`;
};
