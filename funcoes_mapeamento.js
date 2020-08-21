/** Padrão regex que reconhece o formato de horário do SIGAA */
const padraoSigaa = /\b([2-7]{1,5})([MTN])([1-7]{1,7})\b/gm;

/**
 * Função que separa os dias para que toda "palavra" de horário tenha só 1 dígito de dia antes do turno.
 * ex: 246M12 vira 2M12 4M12 6M12.
 * 
 * Quando já está devidamente separado, retorna o mesmo texto.
 * 
 * @param {*} match     O horário completo reconhecido pelo regex
 * @param {*} g1        O primeiro grupo de captura do regex - no caso, o(s) dígito(s) do dia da semana
 * @param {*} g2        O segundo grupo de captura do regex - no caso, a letra do turno
 * @param {*} g3        O terceiro grupo de captura do regex - no caso, o conjunto de dígitos dos horários
 */
function separaDias(match, g1, g2, g3) {
    return [...g1].map(dia => `${dia}${g2}${g3}`).join(' ');
}

/** 
 * Função que recebe o texto com os horários e o ordena pela ordem dos dias da semana
 * Ou seja, o primeiro dígito de cada "palavra".
 * 
 * @param {*} texto     O texto HTML dos horários separados por espaço, que já foi tratado pela separaDias().
 * @returns   O texto com os horários ordenados separados por espaço.
 */
function ordenaDias(texto) {
    return [...texto.matchAll(padraoSigaa)]
        .sort((a,b) => a[1] < b[1] ? -1 :
                       a[1] > b[1] ? 1 : 0)
        .map(a => a[0])
        .join(' ');
}

/**
 * Função que recebe o horário do SIGAA e retorna o texto traduzido através do dicionário acima
 *
 * @param {*} match     O horário completo reconhecido pelo regex
 * @param {*} g1        O primeiro grupo de captura do regex - no caso, o dígito do dia da semana
 * @param {*} g2        O segundo grupo de captura do regex - no caso, a letra do turno
 * @param {*} g3        O terceiro grupo de captura do regex - no caso, o conjunto de dígitos dos horários
 */
function mapeiaHorarios(match, g1, g2, g3) {
    let dia         = mapaDias[g1];
    let hora_inicio = mapaHorarios[`${g2}${g3.charAt(0)}`].inicio;
    let hora_fim    = mapaHorarios[`${g2}${g3.charAt(g3.length-1)}`].fim;
    return `${dia} ${hora_inicio}-${hora_fim}`;
}