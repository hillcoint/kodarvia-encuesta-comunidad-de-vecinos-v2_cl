/**
 * Generador de códigos QR sin dependencias externas (se ejecuta 100 % en el
 * navegador). Implementa la norma ISO/IEC 18004 en modo byte (UTF-8) con
 * corrección de errores de nivel M, versiones 1 a 40.
 */

// Tablas por versión (índice = versión; el índice 0 no se usa). Nivel M.
const ECC_POR_BLOQUE_M = [
  -1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28,
  28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
];
const BLOQUES_M = [
  -1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29,
  31, 33, 35, 37, 38, 40, 43, 45, 47, 49,
];
const BITS_FORMATO_M = 0;

function bit(x: number, i: number): boolean {
  return ((x >>> i) & 1) !== 0;
}

function modulosDatosBrutos(ver: number): number {
  let r = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const n = Math.floor(ver / 7) + 2;
    r -= (25 * n - 10) * n - 55;
    if (ver >= 7) r -= 36;
  }
  return r;
}

function codewordsDatos(ver: number): number {
  return Math.floor(modulosDatosBrutos(ver) / 8) - (ECC_POR_BLOQUE_M[ver] ?? 0) * (BLOQUES_M[ver] ?? 0);
}

// ——— Reed-Solomon sobre GF(256) ———
function multGF(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

function divisorRS(grado: number): number[] {
  const r: number[] = new Array<number>(grado).fill(0);
  r[grado - 1] = 1;
  let raiz = 1;
  for (let i = 0; i < grado; i++) {
    for (let j = 0; j < r.length; j++) {
      r[j] = multGF(r[j] ?? 0, raiz);
      if (j + 1 < r.length) r[j] = (r[j] ?? 0) ^ (r[j + 1] ?? 0);
    }
    raiz = multGF(raiz, 0x02);
  }
  return r;
}

function restoRS(datos: number[], divisor: number[]): number[] {
  const r: number[] = divisor.map(() => 0);
  for (const b of datos) {
    const factor = b ^ (r.shift() ?? 0);
    r.push(0);
    divisor.forEach((coef, i) => {
      r[i] = (r[i] ?? 0) ^ multGF(coef, factor);
    });
  }
  return r;
}

function posicionesAlineacion(ver: number): number[] {
  if (ver === 1) return [];
  const n = Math.floor(ver / 7) + 2;
  const paso = Math.floor((ver * 8 + n * 3 + 5) / (n * 4 - 4)) * 2;
  const r = [6];
  for (let pos = ver * 4 + 17 - 7; r.length < n; pos -= paso) r.splice(1, 0, pos);
  return r;
}

export interface CodigoQR {
  tamano: number;
  version: number;
  /** modulos[y][x] = true si el módulo es oscuro. */
  modulos: boolean[][];
}

export function generarQR(texto: string): CodigoQR {
  const bytes = Array.from(new TextEncoder().encode(texto));

  // 1. Elegir la versión mínima
  let ver = 1;
  for (; ver <= 40; ver++) {
    const bitsCuenta = ver <= 9 ? 8 : 16;
    const bitsNecesarios = 4 + bitsCuenta + bytes.length * 8;
    if (bitsNecesarios <= codewordsDatos(ver) * 8) break;
  }
  if (ver > 40) throw new Error("El texto es demasiado largo para un código QR.");

  // 2. Flujo de bits: modo byte + longitud + datos + terminador + relleno
  const bits: number[] = [];
  const agregar = (valor: number, longitud: number) => {
    for (let i = longitud - 1; i >= 0; i--) bits.push((valor >>> i) & 1);
  };
  agregar(0b0100, 4);
  agregar(bytes.length, ver <= 9 ? 8 : 16);
  bytes.forEach((b) => agregar(b, 8));
  const capacidad = codewordsDatos(ver) * 8;
  agregar(0, Math.min(4, capacidad - bits.length));
  agregar(0, (8 - (bits.length % 8)) % 8);
  for (let relleno = 0xec; bits.length < capacidad; relleno ^= 0xec ^ 0x11) agregar(relleno, 8);

  const datos: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | (bits[i + j] ?? 0);
    datos.push(b);
  }

  // 3. Bloques con corrección de errores e intercalado
  const numBloques = BLOQUES_M[ver] ?? 1;
  const eccLen = ECC_POR_BLOQUE_M[ver] ?? 0;
  const totalCodewords = Math.floor(modulosDatosBrutos(ver) / 8);
  const bloquesCortos = numBloques - (totalCodewords % numBloques);
  const largoCorto = Math.floor(totalCodewords / numBloques);
  const divisor = divisorRS(eccLen);
  const bloques: number[][] = [];
  for (let i = 0, k = 0; i < numBloques; i++) {
    const largo = largoCorto - eccLen + (i < bloquesCortos ? 0 : 1);
    const dat = datos.slice(k, k + largo);
    k += largo;
    const ecc = restoRS(dat, divisor);
    if (i < bloquesCortos) dat.push(0);
    bloques.push(dat.concat(ecc));
  }
  const final: number[] = [];
  const largoBloque = bloques[0]?.length ?? 0;
  for (let i = 0; i < largoBloque; i++) {
    bloques.forEach((blq, j) => {
      if (i !== largoCorto - eccLen || j >= bloquesCortos) final.push(blq[i] ?? 0);
    });
  }

  // 4. Matriz y patrones de función
  const tamano = ver * 4 + 17;
  const mod: boolean[][] = Array.from({ length: tamano }, () => new Array<boolean>(tamano).fill(false));
  const esFuncion: boolean[][] = Array.from({ length: tamano }, () => new Array<boolean>(tamano).fill(false));
  const fijar = (x: number, y: number, oscuro: boolean) => {
    const fila = mod[y];
    const filaF = esFuncion[y];
    if (fila && filaF) {
      fila[x] = oscuro;
      filaF[x] = true;
    }
  };

  for (let i = 0; i < tamano; i++) {
    fijar(6, i, i % 2 === 0);
    fijar(i, 6, i % 2 === 0);
  }
  const buscador = (cx: number, cy: number) => {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < tamano && y >= 0 && y < tamano) fijar(x, y, dist !== 2 && dist !== 4);
      }
    }
  };
  buscador(3, 3);
  buscador(tamano - 4, 3);
  buscador(3, tamano - 4);

  const alin = posicionesAlineacion(ver);
  const n = alin.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) continue;
      const cx = alin[i] ?? 0;
      const cy = alin[j] ?? 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) fijar(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
  }

  const dibujarFormato = (mascara: number) => {
    const dato = (BITS_FORMATO_M << 3) | mascara;
    let rem = dato;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const b = ((dato << 10) | rem) ^ 0x5412;
    for (let i = 0; i <= 5; i++) fijar(8, i, bit(b, i));
    fijar(8, 7, bit(b, 6));
    fijar(8, 8, bit(b, 7));
    fijar(7, 8, bit(b, 8));
    for (let i = 9; i < 15; i++) fijar(14 - i, 8, bit(b, i));
    for (let i = 0; i < 8; i++) fijar(tamano - 1 - i, 8, bit(b, i));
    for (let i = 8; i < 15; i++) fijar(8, tamano - 15 + i, bit(b, i));
    fijar(8, tamano - 8, true);
  };
  dibujarFormato(0);

  if (ver >= 7) {
    let rem = ver;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const b = (ver << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const a = tamano - 11 + (i % 3);
      const c = Math.floor(i / 3);
      fijar(a, c, bit(b, i));
      fijar(c, a, bit(b, i));
    }
  }

  // 5. Colocar los datos en zigzag
  let idx = 0;
  for (let derecha = tamano - 1; derecha >= 1; derecha -= 2) {
    if (derecha === 6) derecha = 5;
    for (let v = 0; v < tamano; v++) {
      for (let j = 0; j < 2; j++) {
        const x = derecha - j;
        const haciaArriba = ((derecha + 1) & 2) === 0;
        const y = haciaArriba ? tamano - 1 - v : v;
        const fila = mod[y];
        if (fila && !esFuncion[y]?.[x] && idx < final.length * 8) {
          fila[x] = bit(final[idx >>> 3] ?? 0, 7 - (idx & 7));
          idx++;
        }
      }
    }
  }

  // 6. Probar las 8 máscaras y quedarse con la de menor penalización
  const aplicarMascara = (m: number) => {
    for (let y = 0; y < tamano; y++) {
      for (let x = 0; x < tamano; x++) {
        let inv: boolean;
        switch (m) {
          case 0: inv = (x + y) % 2 === 0; break;
          case 1: inv = y % 2 === 0; break;
          case 2: inv = x % 3 === 0; break;
          case 3: inv = (x + y) % 3 === 0; break;
          case 4: inv = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
          case 5: inv = ((x * y) % 2) + ((x * y) % 3) === 0; break;
          case 6: inv = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0; break;
          default: inv = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0; break;
        }
        const fila = mod[y];
        if (fila && inv && !esFuncion[y]?.[x]) fila[x] = !fila[x];
      }
    }
  };

  const penalizacion = (): number => {
    let p = 0;
    const valor = (x: number, y: number) => mod[y]?.[x] ?? false;
    // Rachas de 5 o más módulos iguales (filas y columnas)
    for (let a = 0; a < tamano; a++) {
      let colorF = false, rachaF = 0, colorC = false, rachaC = 0;
      for (let b = 0; b < tamano; b++) {
        const f = valor(b, a);
        if (b === 0 || f !== colorF) { colorF = f; rachaF = 1; } else if (++rachaF === 5) p += 3; else if (rachaF > 5) p++;
        const c = valor(a, b);
        if (b === 0 || c !== colorC) { colorC = c; rachaC = 1; } else if (++rachaC === 5) p += 3; else if (rachaC > 5) p++;
      }
    }
    // Bloques 2x2 del mismo color
    for (let y = 0; y < tamano - 1; y++) {
      for (let x = 0; x < tamano - 1; x++) {
        const c = valor(x, y);
        if (c === valor(x + 1, y) && c === valor(x, y + 1) && c === valor(x + 1, y + 1)) p += 3;
      }
    }
    // Equilibrio entre claros y oscuros
    let oscuros = 0;
    mod.forEach((fila) => fila.forEach((c) => { if (c) oscuros++; }));
    const total = tamano * tamano;
    p += (Math.ceil(Math.abs(oscuros * 20 - total * 10) / total) - 1) * 10;
    return p;
  };

  let mejor = 0;
  let mejorPen = Infinity;
  for (let m = 0; m < 8; m++) {
    aplicarMascara(m);
    dibujarFormato(m);
    const pen = penalizacion();
    if (pen < mejorPen) {
      mejor = m;
      mejorPen = pen;
    }
    aplicarMascara(m); // deshace (XOR)
  }
  aplicarMascara(mejor);
  dibujarFormato(mejor);

  return { tamano, version: ver, modulos: mod };
}

/** Devuelve el QR como trazado SVG (un módulo = 1 unidad), con margen de 4 módulos. */
export function qrATrazadoSvg(qr: CodigoQR, margen = 4): { viewBox: string; d: string } {
  const partes: string[] = [];
  qr.modulos.forEach((fila, y) =>
    fila.forEach((oscuro, x) => {
      if (oscuro) partes.push(`M${x + margen},${y + margen}h1v1h-1z`);
    }),
  );
  const total = qr.tamano + margen * 2;
  return { viewBox: `0 0 ${total} ${total}`, d: partes.join("") };
}
