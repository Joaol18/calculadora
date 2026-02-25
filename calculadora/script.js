let display = document.getElementById('display');
let expressao = '';
let ultimoCaractere = '';

function atualizarDisplay() {
    display.value = expressao || '0';
    ultimoCaractere = expressao.slice(-1);
}

function limparDisplay() {
    expressao = '';
    atualizarDisplay();
}

function adicionarAoDisplay(valor) {
    if (expressao === '0' && !isOperador(valor)) {
        expressao = valor;
    } else if (valor === '+/-') {
        alternarSinal();
    } else if (valor === '%') {
        calcularPorcentagem();
    } else {
        // Verifica se não está tentando adicionar operador no início
        if (expressao === '' && isOperador(valor) && valor !== '-') {
            return;
        }
        
        // Previne múltiplos operadores consecutivos
        if (isOperador(valor) && isOperador(ultimoCaractere) && valor !== '-') {
            expressao = expressao.slice(0, -1) + valor;
        } else {
            expressao += valor;
        }
    }
    
    atualizarDisplay();
}

function isOperador(caractere) {
    return ['+', '-', '*', '/', '%'].includes(caractere);
}

function alternarSinal() {
    if (expressao === '' || expressao === '0') return;
    
    // Pega o último número da expressão
    let numeros = expressao.split(/(?=[+\-*/])|(?<=[+\-*/])/g);
    let ultimoNumero = numeros[numeros.length - 1];
    
    if (!isNaN(parseFloat(ultimoNumero))) {
        if (ultimoNumero.startsWith('-')) {
            numeros[numeros.length - 1] = ultimoNumero.substring(1);
        } else {
            numeros[numeros.length - 1] = '-' + ultimoNumero;
        }
        expressao = numeros.join('');
    }
}

function calcularPorcentagem() {
    if (expressao === '') return;
    
    try {
        // Divide a expressão em partes
        let partes = expressao.split(/(?=[+\-*/])|(?<=[+\-*/])/g);
        
        if (partes.length === 1) {
            // Se for apenas um número, converte para porcentagem
            let numero = parseFloat(partes[0]) / 100;
            expressao = numero.toString();
        } else if (partes.length >= 3) {
            // Se for uma operação, calcula a porcentagem relativa ao primeiro número
            let numero1 = parseFloat(partes[0]);
            let operador = partes[1];
            let numero2 = parseFloat(partes[2]);
            
            if (!isNaN(numero1) && !isNaN(numero2)) {
                let resultado;
                switch(operador) {
                    case '+':
                    case '-':
                        resultado = (numero2 / 100) * numero1;
                        expressao = numero1 + operador + resultado;
                        break;
                    case '*':
                    case '/':
                        resultado = numero2 / 100;
                        expressao = numero1 + operador + resultado;
                        break;
                }
            }
        }
    } catch (error) {
        expressao = 'Erro';
    }
    
    atualizarDisplay();
}

function calcular() {
    if (expressao === '' || isOperador(ultimoCaractere)) return;
    
    try {
        // Substitui × por * para avaliação
        let expressaoCalculo = expressao.replace(/×/g, '*');
        
        // Avalia a expressão de forma segura
        let resultado = new Function('return ' + expressaoCalculo)();
        
        // Trata divisão por zero
        if (!isFinite(resultado)) {
            throw new Error('Divisão por zero');
        }
        
        // Arredonda para evitar problemas de precisão
        resultado = Math.round(resultado * 1000000) / 1000000;
        
        expressao = resultado.toString();
    } catch (error) {
        expressao = 'Erro';
    }
    
    atualizarDisplay();
}

// Suporte para teclado
document.addEventListener('keydown', function(event) {
    const tecla = event.key;
    
    if (tecla >= '0' && tecla <= '9') {
        adicionarAoDisplay(tecla);
    } else if (tecla === '.') {
        adicionarAoDisplay('.');
    } else if (tecla === '+' || tecla === '-' || tecla === '*' || tecla === '/') {
        adicionarAoDisplay(tecla);
    } else if (tecla === '%') {
        adicionarAoDisplay('%');
    } else if (tecla === 'Enter' || tecla === '=') {
        calcular();
    } else if (tecla === 'Escape') {
        limparDisplay();
    } else if (tecla === 'Backspace') {
        expressao = expressao.slice(0, -1);
        atualizarDisplay();
    }
});