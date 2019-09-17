module.exports = {
  contentType: "application/vnd.microsoft.card.adaptive",
  content: {
    type: "AdaptiveCard",
    body: [
      {
        "type": "TextBlock",
        "text": "Por favor ingresa los datos de la empresa",
        "weight": "default",
        "size": "default"
      },
      {
        type: "Input.Text",
        placeholder: "RUT de la empresa",
        style: "text",
        maxLength: 12,
        id: "rut_empresa"
      },
      {
        type: "Input.Text",
        placeholder: "Razón social",
        style: "text",
        maxLength: 0,
        id: "razon_social"
      },
      {
        type: "Input.Text",
        placeholder: "Giro",
        style: "text",
        maxLength: 0,
        id: "giro"
      },
      {
        type: "Input.Text",
        placeholder: "Dirección de la empresa",
        style: "text",
        maxLength: 0,
        id: "direccion_empresa"
      },
      {
        type: "TextBlock",
        text: "Región"
      },
      {
        type: "Input.ChoiceSet",
        id: "region_direccion_empresa",
        style: "compact",
        value: "Arica y Parinacota",
        choices: [
          {
            title: "Arica y Parinacota",
            value: "Arica y Parinacota"
          },
          {
            title: "Tarapacá",
            value: "Tarapacá"
          },
          {
            title: "Antofagasta",
            value: "Antofagasta"
          },
          {
            title: "Atacama",
            value: "Atacama"
          },
          {
            title: "Coquimbo",
            value: "Coquimbo"
          },
          {
            title: "Valparaiso",
            value: "Valparaiso"
          },
          {
            title: "Metropolitana de Santiago",
            value: "Metropolitana de Santiago"
          },
          {
            title: "Libertador General Bernardo O'Higgins",
            value: "Libertador General Bernardo O'Higgins"
          },
          {
            title: "Maule",
            value: "Maule"
          },
          {
            title: "Biobío",
            value: "Biobío"
          },
          {
            title: "La Araucanía",
            value: "La Araucanía"
          },
          {
            title: "Los Ríos",
            value: "Los Ríos"
          },
          {
            title: "Los Lagos",
            value: "Los Lagos"
          },
          {
            title: "Aisén del General Carlos Ibáñez del Campo",
            value: "Aisén del General Carlos Ibáñez del Campo"
          },
          {
            title: "Magallanes y de la Antártica Chilena",
            value: "Magallanes y de la Antártica Chilena"
          }
        ]
      },
      {
        type: "TextBlock",
        text: "Comuna"
      },
      {
        type: "Input.ChoiceSet",
        id: "comuna_direccion_empresa",
        style: "compact",
        value: "Aisén",
        choices: [
          {
            title: "Aisén",
            value: "Aisén"
          },
          {
            title: "Algarrobo",
            value: "Algarrobo"
          },
          {
            title: "Alhué",
            value: "Alhué"
          },
          {
            title: "Alto Biobío",
            value: "Alto Biobío"
          },
          {
            title: "Alto del Carmen",
            value: "Alto del Carmen"
          },
          {
            title: "Alto Hospicio",
            value: "Alto Hospicio"
          },
          {
            title: "Ancud",
            value: "Ancud"
          },
          {
            title: "Andacollo",
            value: "Andacollo"
          },
          {
            title: "Angol",
            value: "Angol"
          },
          {
            title: "Antártica",
            value: "Antártica"
          },
          {
            title: "Antofagasta",
            value: "Antofagasta"
          },
          {
            title: "Antuco",
            value: "Antuco"
          },
          {
            title: "Arauco",
            value: "Arauco"
          },
          {
            title: "Arica",
            value: "Arica"
          },
          {
            title: "Buin",
            value: "Buin"
          },
          {
            title: "Bulnes",
            value: "Bulnes"
          },
          {
            title: "Cabildo",
            value: "Cabildo"
          },
          {
            title: "Cabo de Hornos",
            value: "Cabo de Hornos"
          },
          {
            title: "Cabrero",
            value: "Cabrero"
          },
          {
            title: "Calama",
            value: "Calama"
          },
          {
            title: "Calbuco",
            value: "Calbuco"
          },
          {
            title: "Caldera",
            value: "Caldera"
          },
          {
            title: "Calera de Tango",
            value: "Calera de Tango"
          },
          {
            title: "Calle Larga",
            value: "Calle Larga"
          },
          {
            title: "Camarones",
            value: "Camarones"
          },
          {
            title: "Camiña",
            value: "Camiña"
          },
          {
            title: "Canela",
            value: "Canela"
          },
          {
            title: "Cañete",
            value: "Cañete"
          },
          {
            title: "Carahue",
            value: "Carahue"
          },
          {
            title: "Cartagena",
            value: "Cartagena"
          },
          {
            title: "Casablanca",
            value: "Casablanca"
          },
          {
            title: "Castro",
            value: "Castro"
          },
          {
            title: "Catemu",
            value: "Catemu"
          },
          {
            title: "Cauquenes",
            value: "Cauquenes"
          },
          {
            title: "Cerrillos",
            value: "Cerrillos"
          },
          {
            title: "Cerro Navia",
            value: "Cerro Navia"
          },
          {
            title: "Chaitén",
            value: "Chaitén"
          },
          {
            title: "Chañaral",
            value: "Chañaral"
          },
          {
            title: "Chanco",
            value: "Chanco"
          },
          {
            title: "Chépica",
            value: "Chépica"
          },
          {
            title: "Chiguayante",
            value: "Chiguayante"
          },
          {
            title: "Chile Chico",
            value: "Chile Chico"
          },
          {
            title: "Chillán",
            value: "Chillán"
          },
          {
            title: "Chillán Viejo",
            value: "Chillán Viejo"
          },
          {
            title: "Chimbarongo",
            value: "Chimbarongo"
          },
          {
            title: "Cholchol",
            value: "Cholchol"
          },
          {
            title: "Chonchi",
            value: "Chonchi"
          },
          {
            title: "Cisnes",
            value: "Cisnes"
          },
          {
            title: "Cobquecura",
            value: "Cobquecura"
          },
          {
            title: "Cochamó",
            value: "Cochamó"
          },
          {
            title: "Cochrane",
            value: "Cochrane"
          },
          {
            title: "Codegua",
            value: "Codegua"
          },
          {
            title: "Coelemu",
            value: "Coelemu"
          },
          {
            title: "Coihaique",
            value: "Coihaique"
          },
          {
            title: "Coihueco",
            value: "Coihueco"
          },
          {
            title: "Coínco",
            value: "Coínco"
          },
          {
            title: "Colbún",
            value: "Colbún"
          },
          {
            title: "Colchane",
            value: "Colchane"
          },
          {
            title: "Colina",
            value: "Colina"
          },
          {
            title: "Collipulli",
            value: "Collipulli"
          },
          {
            title: "Coltauco",
            value: "Coltauco"
          },
          {
            title: "Combarbalá",
            value: "Combarbalá"
          },
          {
            title: "Concepción",
            value: "Concepción"
          },
          {
            title: "Conchalí",
            value: "Conchalí"
          },
          {
            title: "Concón",
            value: "Concón"
          },
          {
            title: "Constitución",
            value: "Constitución"
          },
          {
            title: "Contulmo",
            value: "Contulmo"
          },
          {
            title: "Copiapó",
            value: "Copiapó"
          },
          {
            title: "Coquimbo",
            value: "Coquimbo"
          },
          {
            title: "Coronel",
            value: "Coronel"
          },
          {
            title: "Corral",
            value: "Corral"
          },
          {
            title: "Cunco",
            value: "Cunco"
          },
          {
            title: "Curacautín",
            value: "Curacautín"
          },
          {
            title: "Curacaví",
            value: "Curacaví"
          },
          {
            title: "Curaco de Vélez",
            value: "Curaco de Vélez"
          },
          {
            title: "Curanilahue",
            value: "Curanilahue"
          },
          {
            title: "Curarrehue",
            value: "Curarrehue"
          },
          {
            title: "Curepto",
            value: "Curepto"
          },
          {
            title: "Curicó",
            value: "Curicó"
          },
          {
            title: "Dalcahue",
            value: "Dalcahue"
          },
          {
            title: "Diego de Almagro",
            value: "Diego de Almagro"
          },
          {
            title: "Doñihue",
            value: "Doñihue"
          },
          {
            title: "El Bosque",
            value: "El Bosque"
          },
          {
            title: "El Carmen",
            value: "El Carmen"
          },
          {
            title: "El Monte",
            value: "El Monte"
          },
          {
            title: "El Quisco",
            value: "El Quisco"
          },
          {
            title: "El Tabo",
            value: "El Tabo"
          },
          {
            title: "Empedrado",
            value: "Empedrado"
          },
          {
            title: "Ercilla",
            value: "Ercilla"
          },
          {
            title: "Estación Central",
            value: "Estación Central"
          },
          {
            title: "Florida",
            value: "Florida"
          },
          {
            title: "Freire",
            value: "Freire"
          },
          {
            title: "Freirina",
            value: "Freirina"
          },
          {
            title: "Fresia",
            value: "Fresia"
          },
          {
            title: "Frutillar",
            value: "Frutillar"
          },
          {
            title: "Futaleufú",
            value: "Futaleufú"
          },
          {
            title: "Futrono",
            value: "Futrono"
          },
          {
            title: "Galvarino",
            value: "Galvarino"
          },
          {
            title: "General Lagos",
            value: "General Lagos"
          },
          {
            title: "Gorbea",
            value: "Gorbea"
          },
          {
            title: "Graneros",
            value: "Graneros"
          },
          {
            title: "Guaitecas",
            value: "Guaitecas"
          },
          {
            title: "Hijuelas",
            value: "Hijuelas"
          },
          {
            title: "Hualaihué",
            value: "Hualaihué"
          },
          {
            title: "Hualañé",
            value: "Hualañé"
          },
          {
            title: "Hualpén",
            value: "Hualpén"
          },
          {
            title: "Hualqui",
            value: "Hualqui"
          },
          {
            title: "Huara",
            value: "Huara"
          },
          {
            title: "Huasco",
            value: "Huasco"
          },
          {
            title: "Huechuraba",
            value: "Huechuraba"
          },
          {
            title: "Illapel",
            value: "Illapel"
          },
          {
            title: "Independencia",
            value: "Independencia"
          },
          {
            title: "Iquique",
            value: "Iquique"
          },
          {
            title: "Isla de Maipo",
            value: "Isla de Maipo"
          },
          {
            title: "Isla de Pascua",
            value: "Isla de Pascua"
          },
          {
            title: "Juan Fernández",
            value: "Juan Fernández"
          },
          {
            title: "La Calera",
            value: "La Calera"
          },
          {
            title: "La Cisterna",
            value: "La Cisterna"
          },
          {
            title: "La Cruz",
            value: "La Cruz"
          },
          {
            title: "La Estrella",
            value: "La Estrella"
          },
          {
            title: "La Florida",
            value: "La Florida"
          },
          {
            title: "La Granja",
            value: "La Granja"
          },
          {
            title: "La Higuera",
            value: "La Higuera"
          },
          {
            title: "La Ligua",
            value: "La Ligua"
          },
          {
            title: "La Pintana",
            value: "La Pintana"
          },
          {
            title: "La Reina",
            value: "La Reina"
          },
          {
            title: "La Serena",
            value: "La Serena"
          },
          {
            title: "La Unión",
            value: "La Unión"
          },
          {
            title: "Lago Ranco",
            value: "Lago Ranco"
          },
          {
            title: "Lago Verde",
            value: "Lago Verde"
          },
          {
            title: "Laguna Blanca",
            value: "Laguna Blanca"
          },
          {
            title: "Laja",
            value: "Laja"
          },
          {
            title: "Lampa",
            value: "Lampa"
          },
          {
            title: "Lanco",
            value: "Lanco"
          },
          {
            title: "Las Cabras",
            value: "Las Cabras"
          },
          {
            title: "Las Condes",
            value: "Las Condes"
          },
          {
            title: "Lautaro",
            value: "Lautaro"
          },
          {
            title: "Lebu",
            value: "Lebu"
          },
          {
            title: "Licantén",
            value: "Licantén"
          },
          {
            title: "Limache",
            value: "Limache"
          },
          {
            title: "Linares",
            value: "Linares"
          },
          {
            title: "Litueche",
            value: "Litueche"
          },
          {
            title: "Llaillay",
            value: "Llaillay"
          },
          {
            title: "Llanquihue",
            value: "Llanquihue"
          },
          {
            title: "Lo Barnechea",
            value: "Lo Barnechea"
          },
          {
            title: "Lo Espejo",
            value: "Lo Espejo"
          },
          {
            title: "Lo Prado",
            value: "Lo Prado"
          },
          {
            title: "Lolol",
            value: "Lolol"
          },
          {
            title: "Loncoche",
            value: "Loncoche"
          },
          {
            title: "Longaví",
            value: "Longaví"
          },
          {
            title: "Lonquimay",
            value: "Lonquimay"
          },
          {
            title: "Los Álamos",
            value: "Los Álamos"
          },
          {
            title: "Los Andes",
            value: "Los Andes"
          },
          {
            title: "Los Ángeles",
            value: "Los Ángeles"
          },
          {
            title: "Los Lagos",
            value: "Los Lagos"
          },
          {
            title: "Los Muermos",
            value: "Los Muermos"
          },
          {
            title: "Los Sauces",
            value: "Los Sauces"
          },
          {
            title: "Los Vilos",
            value: "Los Vilos"
          },
          {
            title: "Lota",
            value: "Lota"
          },
          {
            title: "Lumaco",
            value: "Lumaco"
          },
          {
            title: "Machalí",
            value: "Machalí"
          },
          {
            title: "Macul",
            value: "Macul"
          },
          {
            title: "Máfil",
            value: "Máfil"
          },
          {
            title: "Maipú",
            value: "Maipú"
          },
          {
            title: "Malloa",
            value: "Malloa"
          },
          {
            title: "Marchihue",
            value: "Marchihue"
          },
          {
            title: "María Elena",
            value: "María Elena"
          },
          {
            title: "María Pinto",
            value: "María Pinto"
          },
          {
            title: "Mariquina",
            value: "Mariquina"
          },
          {
            title: "Maule",
            value: "Maule"
          },
          {
            title: "Maullín",
            value: "Maullín"
          },
          {
            title: "Mejillones",
            value: "Mejillones"
          },
          {
            title: "Melipeuco",
            value: "Melipeuco"
          },
          {
            title: "Melipilla",
            value: "Melipilla"
          },
          {
            title: "Molina",
            value: "Molina"
          },
          {
            title: "Monte Patria",
            value: "Monte Patria"
          },
          {
            title: "Mostazal",
            value: "Mostazal"
          },
          {
            title: "Mulchén",
            value: "Mulchén"
          },
          {
            title: "Nacimiento",
            value: "Nacimiento"
          },
          {
            title: "Nancagua",
            value: "Nancagua"
          },
          {
            title: "Natales",
            value: "Natales"
          },
          {
            title: "Navidad",
            value: "Navidad"
          },
          {
            title: "Negrete",
            value: "Negrete"
          },
          {
            title: "Ninhue",
            value: "Ninhue"
          },
          {
            title: "Ñiquen",
            value: "Ñiquen"
          },
          {
            title: "Nogales",
            value: "Nogales"
          },
          {
            title: "Nueva Imperial",
            value: "Nueva Imperial"
          },
          {
            title: "Ñuñoa",
            value: "Ñuñoa"
          },
          {
            title: "O'higgins",
            value: "O'higgins"
          },
          {
            title: "Olivar",
            value: "Olivar"
          },
          {
            title: "Ollague",
            value: "Ollague"
          },
          {
            title: "Olmué",
            value: "Olmué"
          },
          {
            title: "Osorno",
            value: "Osorno"
          },
          {
            title: "Ovalle",
            value: "Ovalle"
          },
          {
            title: "Padre Hurtado",
            value: "Padre Hurtado"
          },
          {
            title: "Padre Las Casas",
            value: "Padre Las Casas"
          },
          {
            title: "Paihuaco",
            value: "Paihuaco"
          },
          {
            title: "Paillaco",
            value: "Paillaco"
          },
          {
            title: "Paine",
            value: "Paine"
          },
          {
            title: "Palena",
            value: "Palena"
          },
          {
            title: "Palmilla",
            value: "Palmilla"
          },
          {
            title: "Panguipulli",
            value: "Panguipulli"
          },
          {
            title: "Panquehue",
            value: "Panquehue"
          },
          {
            title: "Papudo",
            value: "Papudo"
          },
          {
            title: "Parral",
            value: "Parral"
          },
          {
            title: "Pedro Aguirre Cerda",
            value: "Pedro Aguirre Cerda"
          },
          {
            title: "Pelarco",
            value: "Pelarco"
          },
          {
            title: "Pelluhue",
            value: "Pelluhue"
          },
          {
            title: "Pemuco",
            value: "Pemuco"
          },
          {
            title: "Peñaflor",
            value: "Peñaflor"
          },
          {
            title: "Peñalolén",
            value: "Peñalolén"
          },
          {
            title: "Pencahue",
            value: "Pencahue"
          },
          {
            title: "Penco",
            value: "Penco"
          },
          {
            title: "Peralillo",
            value: "Peralillo"
          },
          {
            title: "Peredones",
            value: "Peredones"
          },
          {
            title: "Perquenco",
            value: "Perquenco"
          },
          {
            title: "Petorca",
            value: "Petorca"
          },
          {
            title: "Peumo",
            value: "Peumo"
          },
          {
            title: "Pica",
            value: "Pica"
          },
          {
            title: "Pichidegua",
            value: "Pichidegua"
          },
          {
            title: "Pichilemu",
            value: "Pichilemu"
          },
          {
            title: "Pinto",
            value: "Pinto"
          },
          {
            title: "Pirque",
            value: "Pirque"
          },
          {
            title: "Pitrufquén",
            value: "Pitrufquén"
          },
          {
            title: "Placilla",
            value: "Placilla"
          },
          {
            title: "Portezuelo",
            value: "Portezuelo"
          },
          {
            title: "Porvenir",
            value: "Porvenir"
          },
          {
            title: "Pozo Almonte",
            value: "Pozo Almonte"
          },
          {
            title: "Primavera",
            value: "Primavera"
          },
          {
            title: "Providencia",
            value: "Providencia"
          },
          {
            title: "Puchuncaví",
            value: "Puchuncaví"
          },
          {
            title: "Pucón",
            value: "Pucón"
          },
          {
            title: "Pudahuel",
            value: "Pudahuel"
          },
          {
            title: "Puente Alto",
            value: "Puente Alto"
          },
          {
            title: "Puero Octay",
            value: "Puero Octay"
          },
          {
            title: "Puerto Montt",
            value: "Puerto Montt"
          },
          {
            title: "Puerto Varas",
            value: "Puerto Varas"
          },
          {
            title: "Pumanque",
            value: "Pumanque"
          },
          {
            title: "Punitaqui",
            value: "Punitaqui"
          },
          {
            title: "Punta Arenas",
            value: "Punta Arenas"
          },
          {
            title: "Puqueldón",
            value: "Puqueldón"
          },
          {
            title: "Purén",
            value: "Purén"
          },
          {
            title: "Purranque",
            value: "Purranque"
          },
          {
            title: "Putaendo",
            value: "Putaendo"
          },
          {
            title: "Putre",
            value: "Putre"
          },
          {
            title: "Puyehue",
            value: "Puyehue"
          },
          {
            title: "Queilén",
            value: "Queilén"
          },
          {
            title: "Quellón",
            value: "Quellón"
          },
          {
            title: "Quemchi",
            value: "Quemchi"
          },
          {
            title: "Quilaco",
            value: "Quilaco"
          },
          {
            title: "Quilicura",
            value: "Quilicura"
          },
          {
            title: "Quilleco",
            value: "Quilleco"
          },
          {
            title: "Quillón",
            value: "Quillón"
          },
          {
            title: "Quillota",
            value: "Quillota"
          },
          {
            title: "Quilpué",
            value: "Quilpué"
          },
          {
            title: "Quinchao",
            value: "Quinchao"
          },
          {
            title: "Quinta de Tilcoco",
            value: "Quinta de Tilcoco"
          },
          {
            title: "Quinta Normal",
            value: "Quinta Normal"
          },
          {
            title: "Quintero",
            value: "Quintero"
          },
          {
            title: "Quirihue",
            value: "Quirihue"
          },
          {
            title: "Rancagua",
            value: "Rancagua"
          },
          {
            title: "Ránquil",
            value: "Ránquil"
          },
          {
            title: "Rauco",
            value: "Rauco"
          },
          {
            title: "Recoleta",
            value: "Recoleta"
          },
          {
            title: "Renaico",
            value: "Renaico"
          },
          {
            title: "Renca",
            value: "Renca"
          },
          {
            title: "Rengo",
            value: "Rengo"
          },
          {
            title: "Requínoa",
            value: "Requínoa"
          },
          {
            title: "Retiro",
            value: "Retiro"
          },
          {
            title: "Rinconada",
            value: "Rinconada"
          },
          {
            title: "Río Bueno",
            value: "Río Bueno"
          },
          {
            title: "Río Claro",
            value: "Río Claro"
          },
          {
            title: "Río Hurtado",
            value: "Río Hurtado"
          },
          {
            title: "Río Ibáñez",
            value: "Río Ibáñez"
          },
          {
            title: "Río Negro",
            value: "Río Negro"
          },
          {
            title: "Río Verde",
            value: "Río Verde"
          },
          {
            title: "Romeral",
            value: "Romeral"
          },
          {
            title: "Saavedra",
            value: "Saavedra"
          },
          {
            title: "Sagrada Familia",
            value: "Sagrada Familia"
          },
          {
            title: "Salamanca",
            value: "Salamanca"
          },
          {
            title: "San Antonio",
            value: "San Antonio"
          },
          {
            title: "San Bernardo",
            value: "San Bernardo"
          },
          {
            title: "San Carlos",
            value: "San Carlos"
          },
          {
            title: "San Clemente",
            value: "San Clemente"
          },
          {
            title: "San Esteban",
            value: "San Esteban"
          },
          {
            title: "San Fabián",
            value: "San Fabián"
          },
          {
            title: "San Felipe",
            value: "San Felipe"
          },
          {
            title: "San Fernando",
            value: "San Fernando"
          },
          {
            title: "San Gregorio",
            value: "San Gregorio"
          },
          {
            title: "San Ignacio",
            value: "San Ignacio"
          },
          {
            title: "San Javier",
            value: "San Javier"
          },
          {
            title: "San Joaquín",
            value: "San Joaquín"
          },
          {
            title: "San José de Maipo",
            value: "San José de Maipo"
          },
          {
            title: "San Juan de la Costa",
            value: "San Juan de la Costa"
          },
          {
            title: "San Miguel",
            value: "San Miguel"
          },
          {
            title: "San Nicolás",
            value: "San Nicolás"
          },
          {
            title: "San Pablo",
            value: "San Pablo"
          },
          {
            title: "San Pedro",
            value: "San Pedro"
          },
          {
            title: "San Pedro de Atacama",
            value: "San Pedro de Atacama"
          },
          {
            title: "San Pedro de La Paz",
            value: "San Pedro de La Paz"
          },
          {
            title: "San Rafael",
            value: "San Rafael"
          },
          {
            title: "San Ramón",
            value: "San Ramón"
          },
          {
            title: "San Rosendo",
            value: "San Rosendo"
          },
          {
            title: "San Vicente de Tagua Tagua",
            value: "San Vicente de Tagua Tagua"
          },
          {
            title: "Santa Bárbara",
            value: "Santa Bárbara"
          },
          {
            title: "Santa Cruz",
            value: "Santa Cruz"
          },
          {
            title: "Santa Juana",
            value: "Santa Juana"
          },
          {
            title: "Santa María",
            value: "Santa María"
          },
          {
            title: "Santiago",
            value: "Santiago"
          },
          {
            title: "Santo Domingo",
            value: "Santo Domingo"
          },
          {
            title: "Sierra Gorda",
            value: "Sierra Gorda"
          },
          {
            title: "Talagante",
            value: "Talagante"
          },
          {
            title: "Talca",
            value: "Talca"
          },
          {
            title: "Talcahuano",
            value: "Talcahuano"
          },
          {
            title: "Taltal",
            value: "Taltal"
          },
          {
            title: "Temuco",
            value: "Temuco"
          },
          {
            title: "Teno",
            value: "Teno"
          },
          {
            title: "Teodoro Schmidt",
            value: "Teodoro Schmidt"
          },
          {
            title: "Tierra Amarilla",
            value: "Tierra Amarilla"
          },
          {
            title: "Tiltil",
            value: "Tiltil"
          },
          {
            title: "Timaukel",
            value: "Timaukel"
          },
          {
            title: "Tirúa",
            value: "Tirúa"
          },
          {
            title: "Tocopilla",
            value: "Tocopilla"
          },
          {
            title: "Toltén",
            value: "Toltén"
          },
          {
            title: "Tomé",
            value: "Tomé"
          },
          {
            title: "Torres del Paine",
            value: "Torres del Paine"
          },
          {
            title: "Tortel",
            value: "Tortel"
          },
          {
            title: "Traiguén",
            value: "Traiguén"
          },
          {
            title: "Treguaco",
            value: "Treguaco"
          },
          {
            title: "Tucapel",
            value: "Tucapel"
          },
          {
            title: "Valdivia",
            value: "Valdivia"
          },
          {
            title: "Vallenar",
            value: "Vallenar"
          },
          {
            title: "Valparaíso",
            value: "Valparaíso"
          },
          {
            title: "Vichuquén",
            value: "Vichuquén"
          },
          {
            title: "Victoria",
            value: "Victoria"
          },
          {
            title: "Vicuña",
            value: "Vicuña"
          },
          {
            title: "Vilcún",
            value: "Vilcún"
          },
          {
            title: "Villa Alegre",
            value: "Villa Alegre"
          },
          {
            title: "Villa Alemana",
            value: "Villa Alemana"
          },
          {
            title: "Villarrica",
            value: "Villarrica"
          },
          {
            title: "Viña del Mar",
            value: "Viña del Mar"
          },
          {
            title: "Vitacura",
            value: "Vitacura"
          },
          {
            title: "Yerbas Buenas",
            value: "Yerbas Buenas"
          },
          {
            title: "Yumbel",
            value: "Yumbel"
          },
          {
            title: "Yungay",
            value: "Yungay"
          },
          {
            title: "Zapallar",
            value: "Zapallar"
          }
        ]
      },
      {
        type: "Input.Text",
        placeholder: "Email de la empresa",
        style: "email",
        maxLength: 0,
        id: "email_empresa"
      },
      {
        type: "Input.Text",
        placeholder: "Teléfono de la empresa (Ej. 56912345678)",
        style: "tel",
        maxLength: 0,
        id: "telefono_empresa"
      },
      {
        type: "Input.Text",
        placeholder: "Solicitado por (Nombre y Apellido)",
        style: "text",
        maxLength: 0,
        id: "nombre_apellido_solicitante"
      }
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "Enviar",
        data: {
          id: "boton_enviar_formulario"
        }
      }
    ]
  }
}