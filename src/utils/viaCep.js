const buscarEnderecoPorCep = async (cep) => {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();

    return data.erro ? null : data;
};

export default buscarEnderecoPorCep;
