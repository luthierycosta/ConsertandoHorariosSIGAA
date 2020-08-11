// ==UserScript==
// @name         Consertando os horários do SIGAA UnB
// @namespace    https://github.com/luthierycosta
// @version      1.2.2
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
 * @param {*} g1        O primeiro grupo de captura do regex - no caso, o(s) dígito(s) do dia da semana
 * @param {*} g2        O segundo grupo de captura do regex - no caso, a letra do turno
 * @param {*} g3        O terceiro grupo de captura do regex - no caso, o conjunto de dígitos dos horários
 */
function mapeiaHorarios(match, g1, g2, g3) {
    const first = (str) => str.charAt(0);
    const last = (str) => str.charAt(str.length-1);

    let dia         = mapaDias[g1];
    let hora_inicio = mapaHorarios[`${first(g2)}${first(g3)}`].inicio;
    let hora_fim    = mapaHorarios[`${last(g2)}${last(g3)}`].fim;
    return `${dia} ${hora_inicio}-${hora_fim}`;
}

function separaDias(match, g1, g2, g3) {
    let retorno = [];
    for (let dia of g1)
        retorno.push(`${dia}${g2}${g3}`);

    return retorno.join(' ');
}

function ordenaDias(texto) {

    let horarios = [];
    for (horario of [...texto.matchAll(padraoSigaa)])
        for (dia of horario[1])
            horarios.push(
                [`${dia}`,
                 `${horario[2]}`,
                 `${horario[3]}`]
            );

    let turnos_juntos = [];
    let visitado = [];
    
    for (let i = 0; i < horarios.length; i++) {   
        if (visitado[i])
            continue;
        
        for (let j = i+1; j < horarios.length; j++) {
            if (horarios[i][0] == horarios[j][0]) {
                turnos_juntos.push(
                    [`${horarios[i][0]}`,
                     `${horarios[i][1]}${horarios[j][1]}`,
                     `${horarios[i][2]}${horarios[j][2]}`]
                );
            } else {
                turnos_juntos.push(
                    [`${horarios[i][0]}`,
                     `${horarios[i][1]}`,
                     `${horarios[i][2]}`]
                );
            }
            visitado[j] = true;
        } 
    }
    
    return turnos_juntos
        .sort((a,b) =>  a[0] < b[0] ? -1 :
                        a[0] > b[0] ? 1 : 0)
        .map((match) => `${match[0]}${match[1]}${match[2]}`)
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

/** Procura por todos os textos da página e, onde reconhecer o padrão de horário, chama a mapeiaHorarios() */
let node;
while(node = treeWalker.nextNode()){
    node.textContent = ordenaDias(node.textContent);
    node.textContent = node.textContent.replace(padraoSigaa,mapeiaHorarios);
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


