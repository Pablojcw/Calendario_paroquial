// Mapeamento das solenidades litúrgicas e celebrações diocesanas marcadas na coluna SEMANA da agenda 2026
const LITURGICAL_CALENDAR_2026: Record<string, string> = {
  // Janeiro
  '2026-01-01': 'Santa Maria, Mãe de Deus',
  '2026-01-04': '2° Domingo do Natal',
  '2026-01-06': 'Epifania do Senhor',
  '2026-01-11': 'Batismo do Senhor',
  '2026-01-18': '2º Domingo do Tempo Comum',

  // Fevereiro
  '2026-02-01': '4° Domingo do Tempo Comum',
  '2026-02-02': 'Apresentação do Senhor',
  '2026-02-03': 'São Brás',
  '2026-02-08': '5º Domingo do Tempo Comum',
  '2026-02-15': '6° Domingo do Tempo Comum',
  '2026-02-17': 'Carnaval',
  '2026-02-18': 'Quarta-feira de Cinzas',
  '2026-02-22': '1° Domingo da Quaresma',

  // Março
  '2026-03-01': '2° Domingo da Quaresma',
  '2026-03-08': '3º Domingo da Quaresma',
  '2026-03-15': '4º Domingo da Quaresma',
  '2026-03-19': 'São José',
  '2026-03-22': '5° Domingo da Quaresma',
  '2026-03-25': 'Anunciação do Senhor',
  '2026-03-29': 'Ramos da Paixão de Nosso Senhor Jesus Cristo',

  // Abril
  '2026-04-02': 'Instituição da Eucaristia (Lava-Pés)',
  '2026-04-03': 'Paixão de Nosso Senhor Jesus Cristo',
  '2026-04-04': 'Vigília Pascal',
  '2026-04-05': 'Páscoa da Ressurreição do Senhor',
  '2026-04-12': '2° Domingo da Páscoa (Divina Misericórdia)',
  '2026-04-19': '3° Domingo da Páscoa',
  '2026-04-25': 'São Marcos Evangelista',
  '2026-04-26': '4° Domingo da Páscoa (Bom Pastor)',

  // Maio
  '2026-05-01': 'São José Operário',
  '2026-05-03': '5º Domingo da Páscoa',
  '2026-05-07': 'Festa da Padroeira',
  '2026-05-08': 'Festa da Padroeira',
  '2026-05-09': 'Festa da Padroeira',
  '2026-05-10': '6° Domingo da Páscoa',
  '2026-05-13': 'Nossa Senhora de Fátima',
  '2026-05-14': 'São Matias, Apóstolo',
  '2026-05-17': 'Ascensão do Senhor',
  '2026-05-22': 'Santa Rita de Cássia',
  '2026-05-24': 'Domingo de Pentecostes',
  '2026-05-30': 'Visitação da Virgem Maria',
  '2026-05-31': 'Santíssima Trindade',

  // Junho
  '2026-06-04': 'Corpus Christi',
  '2026-06-07': '10° Domingo do Tempo Comum',
  '2026-06-12': 'Sagrado Coração de Jesus',
  '2026-06-13': 'Santo Antônio de Pádua',
  '2026-06-14': '11° Domingo do Tempo Comum',
  '2026-06-21': '12º Domingo do Tempo Comum',
  '2026-06-24': 'Natividade de São João Batista',
  '2026-06-28': '13º Domingo do Tempo Comum',
  '2026-06-29': 'Santos Pedro e Paulo Apóstolos',

  // Julho
  '2026-07-03': 'São Tomé',
  '2026-07-05': '14º Domingo do Tempo Comum',
  '2026-07-11': 'São Bento',
  '2026-07-12': '15º Domingo do Tempo Comum',
  '2026-07-16': 'Nossa Senhora do Carmo',
  '2026-07-19': '16º Domingo do Tempo Comum',
  '2026-07-22': 'Santa Maria Madalena',
  '2026-07-25': 'São Tiago Maior, Apóstolo',
  '2026-07-26': '17º Domingo do Tempo Comum',
  '2026-07-29': 'Santos Marta, Maria e Lázaro',

  // Agosto
  '2026-08-02': '18º Domingo do Tempo Comum',
  '2026-08-04': 'São João Maria Vianney',
  '2026-08-06': 'Transfiguração do Senhor',
  '2026-08-09': '19º Domingo do Tempo Comum',
  '2026-08-15': 'Assunção de Nossa Senhora',
  '2026-08-16': '20° Domingo do Tempo Comum',
  '2026-08-22': 'Santa Rosa de Lima',
  '2026-08-23': '21º Domingo do Tempo Comum',
  '2026-08-30': '22° Domingo do Tempo Comum',

  // Setembro
  '2026-09-06': '23º Domingo do Tempo Comum',
  '2026-09-08': 'Natividade de Nossa Senhora',
  '2026-09-13': '24° Domingo do Tempo Comum',
  '2026-09-14': 'Exaltação da Santa Cruz',
  '2026-09-15': 'Nossa Senhora das Dores',
  '2026-09-20': '25º Domingo do Tempo Comum',
  '2026-09-23': 'São Padre Pio',
  '2026-09-27': '26º Domingo do Tempo Comum',
  '2026-09-29': 'São Miguel Arcanjo',

  // Outubro
  '2026-10-01': 'Santa Teresinha do Menino Jesus',
  '2026-10-02': 'Santos Anjos da Guarda',
  '2026-10-04': '27º Domingo do Tempo Comum',
  '2026-10-06': 'Nossa Senhora do Rosário',
  '2026-10-11': '28º Domingo do Tempo Comum',
  '2026-10-12': 'Nossa Senhora Aparecida',
  '2026-10-16': 'Santa Edwiges',
  '2026-10-18': '29º Domingo do Tempo Comum',
  '2026-10-22': 'São João Paulo II',
  '2026-10-25': '30º Domingo do Tempo Comum',
  '2026-10-28': 'São Judas Tadeu',

  // Novembro
  '2026-11-01': 'Todos os Santos',
  '2026-11-02': 'Fiéis Defuntos',
  '2026-11-08': '32° Domingo do Tempo Comum',
  '2026-11-09': 'Dedicação da Basílica de Latrão',
  '2026-11-15': '33° Domingo do Tempo Comum',
  '2026-11-21': 'Apresentação da Bem-Aventurada Virgem Maria',
  '2026-11-22': 'Cristo Rei do Universo',
  '2026-11-27': 'Nossa Senhora das Graças',
  '2026-11-29': '1º Domingo do Advento',

  // Dezembro
  '2026-12-06': '2° Domingo do Advento',
  '2026-12-08': 'Imaculada Conceição de Maria',
  '2026-12-12': 'Nossa Senhora de Guadalupe',
  '2026-12-13': '3º Domingo do Advento',
  '2026-12-20': '4º Domingo do Advento',
  '2026-12-24': 'Véspera de Natal',
  '2026-12-25': 'Natal de Nosso Senhor Jesus Cristo',
  '2026-12-26': 'Santo Estêvão',
  '2026-12-27': 'Sagrada Família',
};

export type LiturgicalCalendarYear = Record<string, string>;

export const LITURGICAL_CALENDARS: Record<number, LiturgicalCalendarYear> = {
  2026: LITURGICAL_CALENDAR_2026,
  // 2027: Pronto para receber o calendário diocesano de 2027
};

export function registerLiturgicalYear(year: number, feasts: LiturgicalCalendarYear): void {
  LITURGICAL_CALENDARS[year] = { ...(LITURGICAL_CALENDARS[year] ?? {}), ...feasts };
}

export function getLiturgicalFeast(iso: string): string | null {
  const year = parseInt(iso.slice(0, 4), 10);
  return LITURGICAL_CALENDARS[year]?.[iso] ?? null;
}
