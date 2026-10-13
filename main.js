
    const expressionEl=document.querySelector('#expression'),
    resultEl=document.querySelector('#result'),
    codeEl=document.querySelector('#code'),
    historyList=document.querySelector('#historyList');

    let expression='',
    justCalculated=false,
    history=[];
    
    const operators=['+','−','×','÷','%'];
    function safeCalc(input){
        const normalized=input.replaceAll('×','*').replaceAll('÷','/').replaceAll('−','-').replaceAll(',','.').replaceAll('%','/100');
        if(!/^[0-9+\-*/.()\s]+$/.test(normalized))
            throw new Error('Expressão inválida');
        const value=Function('"use strict"; return ('+normalized+')')();
        if(!Number.isFinite(value))
            throw new Error('Não é possível dividir por zero');
        return Math.round((value+Number.EPSILON)*1e10)/1e10
    }

    function format(value){
        return new Intl.NumberFormat('pt-BR',{maximumFractionDigits:10}).format(value)
    }

    function escapeHtml(text){
        return text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')
    }

    function render(){expressionEl.textContent=expression||'Digite uma operação';
        if(!expression)resultEl.textContent='0';
        const shown=escapeHtml(expression||'0');
        codeEl.innerHTML='<span class="kw">const</span> expressão = <span class="optext">"'+shown+'"</span>;\n<span class="kw">const</span> resultado = <span class="fn">calcular</span>(expressão);\n\n<span class="fn">console.log</span>(resultado);'}

    function append(value){
        if(justCalculated&&!operators.includes(value)){expression='';resultEl.textContent='0'}justCalculated=false;
        const last=expression.at(-1);
        if(operators.includes(value)&&(!expression||operators.includes(last))){
            if(value==='−'&&!expression)expression=value;
            else if(expression)expression=expression.slice(0,-1)+value}
        else if(value===','&&((expression.split(/[+−×÷%]/).at(-1)||'').includes(',')))
            return;
        else expression+=value;render()
        }

    function calculate(){
        if(!expression)
            return;
                try{const original=expression,value=safeCalc(expression);
                    resultEl.textContent=format(value);history.unshift({expression:original,result:format(value)});history=history.slice(0,5);
                    renderHistory();
                    justCalculated=true;
                    codeEl.innerHTML='<span class="kw">const</span> expressão = <span class="optext">"'+escapeHtml(original)+'"</span>;\n<span class="kw">const</span> resultado = <span class="fn">calcular</span>(expressão);\n\n<span class="fn">console.log</span>(resultado); <span class="num">// '+format(value)+'</span>'}
                    catch(error){
                        resultEl.textContent='Erro';
                        expressionEl.textContent=error.message}
                }
                
    function renderHistory(){
        historyList.innerHTML=history.length?history.map(item=>'<li class="history-item"><span>'+escapeHtml(item.expression)+'</span><b>= '+escapeHtml(item.result)+'</b></li>').join(''):'<li class="empty">Seus cálculos aparecerão aqui.</li>'}
    document.querySelector('#keys').addEventListener('click',e=>{
        const b=e.target.closest('button');
            if(!b)return;if(b.dataset.value)append(b.dataset.value);
            if(b.dataset.action==='clear'){expression='';justCalculated=false;render()}
            if(b.dataset.action==='delete'){expression=expression.slice(0,-1);render()}
            if(b.dataset.action==='calculate')calculate()});
    document.querySelector('#clearHistory').addEventListener('click',()=>{history=[];renderHistory()});

    window.addEventListener('keydown',e=>{
        const map={'*':'×','/':'÷','-':'−','.' : ','};if(/[0-9+*\/\-.,%]/.test(e.key)){e.preventDefault();append(map[e.key]||e.key)}
        else if(e.key==='Enter'){e.preventDefault();calculate()}else if(e.key==='Backspace'){expression=expression.slice(0,-1);render()}
        else if(e.key==='Escape'){expression='';justCalculated=false;render()}});render()
            ;
