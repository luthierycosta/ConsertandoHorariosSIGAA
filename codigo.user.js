// ==UserScript==
// @name         Consertando os horários do SIGAA UnB
// @namespace    https://github.com/luthierycosta
// @version      1.2.4
// @icon         https://github.com/luthierycosta/ConsertandoHorariosSIGAA/blob/master/images/icon.png?raw=true
// @description  Traduz as informações de horários das turmas no SIGAA (novo sistema da UnB), de formato pouco entendível, por dias e horas escritas por extenso.
// @author       Luthiery Costa
// @supportURL   https://github.com/luthierycosta
// @match        https://sig.unb.br/sigaa/*
// @grant        none
// @noframes
// ==/UserScript==

'use strict';

/** Cria dicionário para mapear os números e letras aos dias e horas reais */
const mapaDias = {
    2: 'SEG',
    3: 'TER',
    4: 'QUA',
    5: 'QUI',
    6: 'SEX',
    7: 'SAB'
}
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
}

/** Padrão regex que reconhece o formato de horário do SIGAA */
const padraoSigaa = /\b([2-7]{1,5})([MTN])([1-7]{1,7})\b/gm;

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

/** Objeto TreeWalker que permite navegar por todos os campos de texto da página.
 * Neste, caso possui um filtro (3º argumento) que só permite textos (nós) que se encaixem no padrão SIGAA.
*/
const treeWalker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {acceptNode: (node) => padraoSigaa.test(node.textContent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP},
    false
);

/** Procura por todos os textos e, onde reconhecer o padrão de horário, executa a substituição */
let node;
while(node = treeWalker.nextNode()){
    node.textContent = node.textContent.replace(padraoSigaa,separaDias);
    node.textContent = ordenaDias(node.textContent);
    node.textContent = node.textContent.replace(padraoSigaa,mapeiaHorarios);
    
    // por fim, junta as ocorrências 12:00-12:55/12:55-13:50 em simplesmente 12:00-13:50
    node.textContent = node.textContent.replace(/([A-Z]{3}) 12:00-12:55 ([A-Z]{3}) 12:55-13:50/gm, '$1 12:00-13:50')
}

let url = window.location.href;

/** Na página de oferta de turmas existem caixas de ajuda com o horário consertado ao lado do texto de cada horário,
 que se tornam redundantes quando esse script é executado, portanto serão desabilitadas */
if (url.includes("public/turmas/listar.jsf")) {
    Array.from(document.querySelectorAll("img[src='/shared/img/geral/ajuda.gif']"))
    .forEach((icon) => icon.hidden = true);
}

/** Procedimento para alterar o tamanho da coluna dos horários, dependendo de qual página foi aberta */
Array.from(document.querySelectorAll("tHead th"))              // seleciona todos os cabeçalhos de tabelas na página
.filter((col) => col.innerText.includes("Horário"))   // seleciona só as colunas cujo texto é "Horário" (geralmente será só 1)
.forEach((col) =>
    col.width = url.includes("graduacao/matricula/turmas_curriculo.jsf")              ? "35%" :
                url.includes("graduacao/matricula/turmas_equivalentes_curriculo.jsf") ? "13%" :
                url.includes("graduacao/matricula/turmas_extra_curriculo.jsf")        ? "12%" :
                url.includes("portais/discente/discente.jsf")                         ? "18%" :
                url.includes("portais/discente/turmas.jsf")                           ? "34%" :
                url.includes("public/turmas/listar.jsf")                              ? "13%" :
                col.width
);