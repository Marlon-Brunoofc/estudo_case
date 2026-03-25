// 1. INICIALIZAÇÃO
let bancoEmpreendedores = JSON.parse(localStorage.getItem('bd_empreendedores')) || [];
let bancoAtendimentos = JSON.parse(localStorage.getItem('bd_atendimentos')) || [];
let filaEspera = JSON.parse(localStorage.getItem('bd_fila')) || [];

function salvarDados() {
    localStorage.setItem('bd_empreendedores', JSON.stringify(bancoEmpreendedores));
    localStorage.setItem('bd_atendimentos', JSON.stringify(bancoAtendimentos));
    localStorage.setItem('bd_fila', JSON.stringify(filaEspera));
}

// Seletores
const menuItems = document.querySelectorAll('.menu-item');
const sections = document.querySelectorAll('main section');

// 2. NAVEGAÇÃO
menuItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        sections.forEach(s => s.classList.add('hidden'));
        sections[index].classList.remove('hidden');

        // Atualização dinâmica de abas
        if (index === 1) atualizarInterfaceFila(); 
        if (index === 2) atualizarSelectEmpreendedores(); 
        if (index === 3) atualizarTabelaHistorico();      
        if (index === 4) atualizarRelatorios();           
    });
});

// 3. CADASTRO
const btnConfirmarCadastro = document.getElementById('btn-cadastrar');
btnConfirmarCadastro.addEventListener('click', () => {
    const nome = document.getElementById('emp-nome').value.trim();
    const documento = document.getElementById('emp-doc').value.trim();

    if (nome === '' || documento === '') {
        alert("⚠️ Erro: Preencha todos os campos.");
        return;
    }

    bancoEmpreendedores.push({ id: Date.now(), nome, documento });
    salvarDados();

    alert(`✅ Empreendedor ${nome} cadastrado!`);
    document.getElementById('emp-nome').value = '';
    document.getElementById('emp-doc').value = '';
});

// 4. LÓGICA DA FILA DE ESPERA
function atualizarInterfaceFila() {
    const select = document.getElementById('select-fila');
    const lista = document.getElementById('lista-fila');
    
    select.innerHTML = '<option value="">-- Selecione o Empreendedor --</option>';
    bancoEmpreendedores.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.nome;
        option.textContent = emp.nome;
        select.appendChild(option);
    });

    lista.innerHTML = '';
    if (filaEspera.length === 0) {
        lista.innerHTML = '<tr><td colspan="4" style="text-align:center">Ninguém aguardando no momento.</td></tr>';
        return;
    }

    filaEspera.forEach((pessoa, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${index + 1}</td>
            <td><strong>${pessoa.nome}</strong></td>
            <td>${pessoa.hora}</td>
            <td class="actions">
                <button class="btn-action btn-call" onclick="chamarDaFila(${index})" title="Chamar para Atendimento">
                    <i class="fas fa-bullhorn"></i>
                </button>
                <button class="btn-action btn-delete" onclick="removerDaFila(${index})" title="Remover da Fila">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        `;
        lista.appendChild(row);
    });
}

function adicionarAFila() {
    const nome = document.getElementById('select-fila').value;
    if (!nome) return alert("Selecione um empreendedor.");

    const jaNaFila = filaEspera.find(p => p.nome === nome);
    if (jaNaFila) return alert("Este empreendedor já está na fila!");

    filaEspera.push({
        nome: nome,
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });

    salvarDados();
    atualizarInterfaceFila();
}

function removerDaFila(index) {
    filaEspera.splice(index, 1);
    salvarDados();
    atualizarInterfaceFila();
}

function chamarDaFila(index) {
    const pessoa = filaEspera[index];
    alert(`📢 Chamando: ${pessoa.nome}`);
    
    // Remove da fila e vai para atendimento
    filaEspera.splice(index, 1);
    salvarDados();
    
    // Troca para aba de atendimento e preenche o nome
    menuItems[2].click(); 
    setTimeout(() => {
        document.getElementById('select-empreendedor').value = pessoa.nome;
    }, 100);
}

// 5. ATENDIMENTO
function atualizarSelectEmpreendedores() {
    const select = document.getElementById('select-empreendedor');
    const valorAtual = select.value;
    select.innerHTML = '<option value="">-- Selecione o Empreendedor --</option>';
    
    bancoEmpreendedores.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.nome;
        option.textContent = `${emp.nome} (${emp.documento})`;
        select.appendChild(option);
    });
    if(valorAtual) select.value = valorAtual;
}

const btnFinalizarAtendimento = document.getElementById('btn-atendimento');
btnFinalizarAtendimento.addEventListener('click', () => {
    const nomeSelecionado = document.getElementById('select-empreendedor').value;
    const detalhes = document.getElementById('atend-detalhes').value.trim();
    
    // Captura os checkboxes marcados
    const checkboxes = document.querySelectorAll('input[name="encaminhamento"]:checked');
    const encaminhamentos = Array.from(checkboxes).map(cb => cb.value);

    if (!nomeSelecionado || detalhes === '') {
        alert("⚠️ Erro: Selecione o cliente e descreva o atendimento.");
        return;
    }

    bancoAtendimentos.push({
        data: new Date().toLocaleDateString('pt-BR'),
        empreendedor: nomeSelecionado,
        descricao: detalhes,
        encaminhamentos: encaminhamentos, // Novo campo salvo
        status: "Finalizado"
    });

    salvarDados();
    
    // Limpar campos
    document.getElementById('atend-detalhes').value = '';
    checkboxes.forEach(cb => cb.checked = false);
    
    alert("🚀 Atendimento e encaminhamentos registrados!");
});
// 6. HISTÓRICO
function atualizarTabelaHistorico() {
    const lista = document.getElementById('lista-historico');
    lista.innerHTML = '';

    if (bancoAtendimentos.length === 0) {
        lista.innerHTML = '<tr><td colspan="4" style="text-align:center">Nenhum registro encontrado.</td></tr>';
        return;
    }

    [...bancoAtendimentos].reverse().forEach((atend, index) => {
        const realIndex = bancoAtendimentos.length - 1 - index;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${atend.data}</td>
            <td><strong>${atend.empreendedor}</strong></td>
            <td>${atend.descricao.substring(0, 30)}...</td>
            <td class="actions">
                <button class="btn-action btn-edit" onclick="event.stopPropagation(); prepararEdicao(${realIndex})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-delete" onclick="event.stopPropagation(); excluirAtendimento(${realIndex})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        row.onclick = () => abrirModalDetalhes(realIndex);
        lista.appendChild(row);
    });
}

function filtrarHistorico() {
    const termo = document.getElementById('input-busca').value.toLowerCase();
    const rows = document.getElementById('lista-historico').getElementsByTagName('tr');
    for (let row of rows) {
        const nome = row.cells[1]?.innerText.toLowerCase();
        row.style.display = nome?.includes(termo) ? "" : "none";
    }
}

// 7. CONTROLES E MODAL
function excluirAtendimento(index) {
    if (confirm("Excluir este registro permanentemente?")) {
        bancoAtendimentos.splice(index, 1);
        salvarDados();
        atualizarTabelaHistorico();
        atualizarRelatorios();
    }
}

function prepararEdicao(index) {
    const atend = bancoAtendimentos[index];
    const body = document.getElementById('modal-body');
    body.innerHTML = `
        <div style="display: grid; gap: 10px;">
            <h3>Editar Relato</h3>
            <textarea id="edit-descricao" rows="6" style="width:100%;">${atend.descricao}</textarea>
            <button class="btn btn-gradient" onclick="confirmarEdicao(${index})">Salvar</button>
        </div>
    `;
    document.getElementById('modal-detalhes').classList.remove('hidden');
}

function confirmarEdicao(index) {
    bancoAtendimentos[index].descricao = document.getElementById('edit-descricao').value;
    salvarDados();
    fecharModal();
    atualizarTabelaHistorico();
}

function abrirModalDetalhes(index) {
    const atend = bancoAtendimentos[index];
    const cliente = bancoEmpreendedores.find(e => e.nome === atend.empreendedor);
    
    // Gera as tags de encaminhamento para o modal
    const tagsHtml = atend.encaminhamentos && atend.encaminhamentos.length > 0 
        ? atend.encaminhamentos.map(tag => `<span class="status-badge" style="background:#e0e7ff; color:#4338ca; margin-right:5px;">${tag}</span>`).join('')
        : '<span style="color:var(--text-muted); font-size:0.8rem;">Nenhum encaminhamento específico.</span>';

    document.getElementById('modal-body').innerHTML = `
        <p><strong>🗓 Data:</strong> ${atend.data}</p>
        <p><strong>👤 Cliente:</strong> ${atend.empreendedor}</p>
        <p><strong>🆔 Documento:</strong> ${cliente ? cliente.documento : 'Não localizado'}</p>
        <div style="margin-top:10px;">
            <strong>📍 Encaminhamentos:</strong><br>
            <div style="margin-top:5px;">${tagsHtml}</div>
        </div>
        <hr style="margin:15px 0; border:0; border-top:1px solid #eee;">
        <div style="background:#f8fafc; padding:15px; border-radius:8px; border-left:4px solid var(--primary); white-space: pre-wrap;">
            <strong>Relato:</strong><br>${atend.descricao}
        </div>
    `;
    document.getElementById('modal-detalhes').classList.remove('hidden');
}

function fecharModal() { document.getElementById('modal-detalhes').classList.add('hidden'); }

function atualizarRelatorios() {
    document.getElementById('count-emp').innerText = bancoEmpreendedores.length;
    document.getElementById('count-atend').innerText = bancoAtendimentos.length;
}

function gerarExportacao() {
    if (bancoAtendimentos.length === 0) return alert("Sem dados para exportar!");
    const csv = "Data;Cliente;Descricao\n" + bancoAtendimentos.map(a => `${a.data};${a.empreendedor};${a.descricao}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'relatorio.csv';
    a.click();
}

// Inicialização
atualizarRelatorios();