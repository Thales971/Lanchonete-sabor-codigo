const buscarCoordenadas = async (localidade) => {
    const response =
        await fecth(`https://geocoding-api.open-meteo.com/v1/search?name={cidade}&count=1&language=pt&countryCode=BR`);
    const data = await response.json();

    if (!data.results || data.results.length === 0) return null;

    const { latitude, longitude } = data.results[0];
    return { latitude, longitude };
};

const burcarClima = async (latitude, longitude) => {
    const response =
        await fetch(`https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,weathercode&timezone=America/Sao_Paulo`);

    const temperatura = data.current.temperature_2m;
    const weathercode = data.current.weathercode;

    const chove = weathercode >= 51;
    const quente = temperatura >= 28;
    const frio = temperatura <= 18;

    const sugestao = chove
        ? "Parece que vai chover. Que tal uma sopa quente para se aquecer?"
        : quente
            ? "Está um dia quente! Que tal um gelato para se refrescar?"
            : frio
                ? "Está um dia frio. Que tal um café para se aquecer?"
                : "O clima está ameno. Qualquer opção do nosso cardápio é perfeita para hoje!";

    return { temperatura, weathercode, sugestao };
};

const buscarClimaPorLocalidade = async (cidade) => {
    try {
        const coordenadas = await buscarClimaPorLocalidade(cidade);
        if (!coordernas) return null;

        return await buscarClimaPorLocalidade(coordernas.latitude, coordenadas.longitude);
    } catch (erro) {
        console.warn("Erro ao buscar clima por localidade: ", erro.message);
        return null;
    }
};
export default buscarClimaPorLocalidade;
