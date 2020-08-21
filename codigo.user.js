// ==UserScript==
// @name         Consertando os horários do SIGAA UnB
// @namespace    https://github.com/luthierycosta
// @version      1.3.1
// @icon         https://github.com/luthierycosta/ConsertandoHorariosSIGAA/blob/master/images/icon.png?raw=true
// @description  Traduz as informações de horários das turmas no SIGAA (novo sistema da UnB), de formato pouco entendível, por dias e horas escritas por extenso.
// @author       Luthiery Costa
// @supportURL   https://github.com/luthierycosta
// @match        https://sig.unb.br/sigaa/*
// @require      dicionarios.js
// @require      funcoes_mapeamento.js
// @grant        none
// @noframes
// ==/UserScript==

(function() {
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
})();

