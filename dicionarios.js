'use strict';

/** Cria dicionário para mapear os números e letras aos dias e horas reais */
const mapaDias = {
    2: 'SEG',
    3: 'TER',
    4: 'QUA',
    5: 'QUI',
    6: 'SEX',
    7: 'SAB'
};

const mapaHorarios = {
    'M1': {inicio: '08:00', fim: '08:55'},
    'M2': {inicio: '08:55', fim: '09:50'},
    'M3': {inicio: '10:00', fim: '10:55'},
    'M4': {inicio: '10:55', fim: '11:50'},
    'M5': {inicio: '12:00', fim: '12:55'},
    'T1': {inicio: '12:55', fim: '13:50'},
    'T2': {inicio: '14:00', fim: '14:55'},
    'T3': {inicio: '14:55', fim: '15:50'},
    'T4': {inicio: '16:00', fim: '16:55'},
    'T5': {inicio: '16:55', fim: '17:50'},
    'T6': {inicio: '18:00', fim: '18:55'},
    'T7': {inicio: '18:55', fim: '19:50'},
    'N1': {inicio: '19:00', fim: '19:50'},
    'N2': {inicio: '19:50', fim: '20:40'},
    'N3': {inicio: '20:50', fim: '21:40'},
    'N4': {inicio: '21:40', fim: '22:30'}
};
