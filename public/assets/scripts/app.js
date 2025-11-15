const DADOS_URL = "http://localhost:3000/dados";
const META_URL = "http://localhost:3000/dadosMeta";

// ======== LISTAR AS 6 PRIMEIRAS ATIVIDADES ========
async function loadMainActivities() {
    const container = document.getElementById('activities-cards');
    try {
        const res = await fetch(`${DADOS_URL}?_limit=6`);
        const atividades = await res.json();
        const metaRes = await fetch(META_URL);
        const meta = await metaRes.json();
        atividades.forEach(activity => {
            const inicio = activity.data?.dataInicio?.slice(5, 13) || "";
            const fim = activity.data?.dataFim?.slice(5, 13) || "";

            container.innerHTML += `
                <div class="col-12 col-sm-6 col-lg-4 card-style-content" id="${activity.id}">
                    <a href="details.html?id=${activity.id}&category=${activity.categoria}">
                        <div class="activity-item activity-color">
                            <div class="activity-header row">
                                <div class="col">
                                    <i class="${meta[activity.categoria].icone}"></i>
                                    <span>${activity.categoria}</span>
                                </div>
                                <button class="btn btn-sm btn-outline-secondary border-0 delete-btn col-2" 
                                    onclick="event.preventDefault(); event.stopPropagation(); deleteActivity(${activity.id})">
                                    <i class="fa-solid fa-xmark fa-lg"></i>
                                </button>
                                </div>
                            <p>${inicio}h | ${fim}h</p>
                        </div>
                    </a>
                </div>`;
        });

        var resCount = await fetch(`${DADOS_URL}`);
        resCount = await resCount.json();
        if (resCount.length > 6) {
            container.innerHTML += `
            <div class="col-12 text-center mt-3">
                <button id="btn-expandir" class="btn btn-primary">Ver mais</button>
            </div>`;
            document.getElementById('btn-expandir').addEventListener('click', loadAllActivities);
        }

    } catch (err) {
        container.innerHTML = "<p>Erro ao carregar atividades.</p>";
        console.error(err);
    }
}

// ======== CARREGAR TODAS AS ATIVIDADES ========
async function loadAllActivities() {
    const container = document.getElementById('activities-cards');
    try {
        const res = await fetch(DADOS_URL);
        const atividades = await res.json();
        const metaRes = await fetch(META_URL);
        const meta = await metaRes.json();

        container.innerHTML = "";
        atividades.forEach(activity => {
            const inicio = activity.data?.dataInicio?.slice(5, 13) || "";
            const fim = activity.data?.dataFim?.slice(5, 13) || "";

            container.innerHTML += `
                <div class="col-12 col-sm-6 col-lg-4 card-style-content" id="${activity.id}">
                    <a href="details.html?id=${activity.id}&category=${activity.categoria}">
                        <div class="activity-item activity-color">
                            <div class="activity-header row">
                                <div class="col">
                                    <i class="${meta[activity.categoria].icone}"></i>
                                    <span>${activity.categoria}</span>
                                </div>
                                <button class="btn btn-sm btn-outline-secondary border-0 delete-btn col-2" 
                                    onclick="event.preventDefault(); event.stopPropagation(); deleteActivity(${activity.id})">
                                    <i class="fa-solid fa-xmark fa-lg"></i>
                                </button>
                                </div>
                            <p>${inicio}h | ${fim}h</p>
                        </div>
                    </a>
                </div>`;
        });
    } catch (err) {
        container.innerHTML = "<p>Erro ao carregar atividades.</p>";
        console.error(err);
    }
}

// ======== PRÓXIMO COMPROMISSO ========
async function getNextAppointment() {
    const container = document.getElementById('next-appointment');
    try {
        const res = await fetch(DADOS_URL);
        const atividades = await res.json();
        const metaRes = await fetch(META_URL);
        const meta = await metaRes.json();

        let nextActivity = null;
        let minData = null;

        atividades.forEach(activity => {
            const dataInicio = new Date(activity.data.dataInicio);
            if (!minData || dataInicio < minData) {
                minData = dataInicio;
                nextActivity = activity;
            }
        });

        if (!nextActivity) {
            container.innerHTML = "<p>Não há próximos compromissos.</p>";
            return;
        }

        const inicio = nextActivity.data.dataInicio.slice(5, 16);
        const fim = nextActivity.data.dataFim.slice(5, 16);

        container.innerHTML = `
            <a href="details.html?id=${nextActivity.id}&category=${nextActivity.categoria}">
                <header class="card-style-header">
                    <h3 class="card-style-title">
                        <i class="fa-regular fa-clock"></i> Próximo Compromisso
                    </h3>
                </header>
                <div class="card-style-content">
                    <div class="appointment-info">
                        <div class="appointment-icon">
                            <i class="${meta[nextActivity.categoria].icone} fa-xl"></i>
                        </div>
                        <div class="appointment-details">
                            <h4>${nextActivity.titulo}</h4>
                            <p class="appointment-time">${inicio} | ${fim}</p>
                            <p class="appointment-desc">${nextActivity.categoria} - ${nextActivity.local}</p>
                        </div>
                    </div>
                </div>
            </a>`;
    } catch (err) {
        container.innerHTML = "<p>Erro ao buscar compromissos.</p>";
        console.error(err);
    }
}

// ======== TOTAL DE ATIVIDADES ========
async function totalActivities() {
    const container = document.getElementById('stats-number');
    try {
        const res = await fetch(DADOS_URL);
        const atividades = await res.json();
        container.innerHTML = atividades.length;
    } catch (err) {
        container.innerHTML = "-";
        console.error(err);
    }
}

// ======== DETALHE OU PRÓXIMA ATIVIDADE POR CATEGORIA ========
async function getActivity() {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const category = params.get('category');
    const tela = document.getElementById('next-appointment');

    try {
        if (id) {
            const res = await fetch(`${DADOS_URL}/${id}`);
            const activity = await res.json();

            if (!activity || !activity.id) {
                tela.innerHTML = "<p>Atividade não encontrada.</p>";
                return;
            }

            tela.innerHTML = `
                <header class="card-style-header header-with-delete">
                    <h3 class="card-style-title">
                        Próxima Atividade da Categoria - ${activity.categoria}
                        <button class="btn btn-sm btn-outline-primary border-0 edit-btn" onclick="editActivity(${activity.id})">
                        <i class="fa-solid fa-pen fa-lg"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger border-0 delete-btn" onclick="deleteActivity(${activity.id})">
                        <i class="fa-solid fa-xmark fa-lg"></i>
                        </button>
                    </h3>
                    </header>
                <div class="card-style-content" id="activity-${activity.id}">
                    <div class="appointment-info">
                        <div class="appointment-icon">
                            <img src="./assets/img/${activity.categoria}.png" class="appointment-image">
                        </div>
                        <div class="appointment-details">
                            <h4>${activity.titulo}</h4>
                            <p class="appointment-time">${activity.data.dataInicio} | ${activity.data.dataFim}</p>
                            <p class="appointment-desc"><i class="fa-solid fa-location-dot"></i> ${activity.local}</p>
                            <p class="appointment-desc">${activity.descricao}</p>
                        </div>
                    </div>
                </div>`;
        } else if (category) {
            const res = await fetch(`${DADOS_URL}?categoria=${category}`);
            const atividades = await res.json();

            if (atividades.length === 0) {
                tela.innerHTML = "<p>Não há atividades nessa categoria.</p>";
                return;
            }

            let nextActivity = atividades.reduce((min, act) =>
                new Date(act.data.dataInicio) < new Date(min.data.dataInicio) ? act : min
            );

            tela.innerHTML = `
                <header class="card-style-header header-with-delete">
                    <h3 class="card-style-title">
                        Próxima Atividade da Categoria - ${nextActivity.categoria}
                        <button class="btn btn-sm btn-outline-primary border-0 edit-btn" onclick="editActivity(${nextActivity.id})">
                        <i class="fa-solid fa-pen fa-lg"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger border-0 delete-btn" onclick="deleteActivity(${nextActivity.id})">
                        <i class="fa-solid fa-xmark fa-lg"></i>
                        </button>
                    </h3>
                    </header>
                <div class="card-style-content" id="activity-${nextActivity.id}">
                    <div class="appointment-info">
                        <div class="appointment-icon">
                            <img src="./assets/img/${nextActivity.categoria}.png" class="appointment-image">
                        </div>
                        <div class="appointment-details">
                            <h4>${nextActivity.titulo}</h4>
                            <p class="appointment-time">${nextActivity.data.dataInicio} | ${nextActivity.data.dataFim}</p>
                            <p class="appointment-desc"><i class="fa-solid fa-location-dot"></i> ${nextActivity.local}</p>
                            <p class="appointment-desc">${nextActivity.descricao}</p>
                        </div>
                    </div>
                </div>`;
        }
    } catch (err) {
        tela.innerHTML = "<p>Erro ao carregar atividade.</p>";
        console.error(err);
    }
}

// ======== CARROSSEL DE CATEGORIAS ========
async function carouselItemsByCategory() {
    const container = document.getElementById('carousel-categories');
    try {
        const res = await fetch(META_URL);
        const categorias = await res.json();
        container.innerHTML = "";

        Object.keys(categorias).forEach(cat => {
            container.innerHTML += `
                <div class="carousel-item">
                    <article class="card-style next-appointment">
                        <a href="details.html?category=${cat}">
                            <header class="card-style-header">
                                <h3 class="card-style-title">
                                    <i class="fa-solid fa-bars"></i> Categorias
                                </h3>
                            </header>
                            <div class="card-style-content">
                                <div class="appointment-info">
                                    <div class="appointment-icon">
                                        <i class="${categorias[cat].icone} fa-xl"></i>
                                    </div>
                                    <div class="appointment-details">
                                        <h4>${cat}</h4>
                                        <p class="appointment-desc">${categorias[cat].descricao}</p>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </article>
                </div>`;
        });
    } catch (err) {
        container.innerHTML = "<p>Erro ao carregar categorias.</p>";
        console.error(err);
    }
}

// ======== CARREGA ATIVIDADES DE UMA CATEGORIA ========
async function loadActivitiesByCategory() {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');

    const container = document.getElementById('activities-cards');
    container.innerHTML = "<p>Carregando...</p>";

    if (!category) {
        container.innerHTML = "<p>Categoria não informada.</p>";
        return;
    }

    try {
        // Busca apenas os itens da categoria
        const res = await fetch(`${DADOS_URL}?categoria=${category}`);
        const metaRes = await fetch(META_URL);
        const meta = await metaRes.json();
        if (!res.ok) throw new Error('Erro ao buscar atividades por categoria');
        const atividades = await res.json();

        if (!atividades || atividades.length === 0) {
            container.innerHTML = "<p>Não há atividades nesta categoria.</p>";
            return;
        }

        // Ordena pela dataInicio (client-side, porque data está aninhada)
        atividades.sort((a, b) => new Date(a.data.dataInicio) - new Date(b.data.dataInicio));

        // Renderiza
        container.innerHTML = "";
        atividades.forEach(activity => {
            const inicio = activity.data?.dataInicio ? activity.data.dataInicio.slice(5, 16) : "";
            const fim = activity.data?.dataFim ? activity.data.dataFim.slice(5, 16) : "";

            container.innerHTML += `
            <div class="col-12 col-sm-6 col-lg-4 card-style-content" id="${activity.id}">
                <a href="details.html?id=${activity.id}&category=${activity.categoria}">
                    <div class="activity-item activity-color">
                        <div class="activity-header">
                            <i class="${meta[activity.categoria].icone}"></i>
                            <span class="text">${activity.categoria}</span>
                        </div>
                        <p>${inicio} | ${fim}</p>
                    </div>
                </a>
            </div>`;
        });
    } catch (err) {
        container.innerHTML = "<p>Erro ao carregar atividades.</p>";
        console.error(err);
    }
}

// ======== CRIA OPÇÕES COM AS CATEGORIA ========
async function optionsByCategory() {
    const container = document.getElementById("category");
    const res = await fetch(META_URL)
    const categorias = await res.json();
    Object.keys(categorias).forEach(cat => {
        container.innerHTML += `
            <option value="${cat}">${cat}</option>
        `;
    });
}
async function createNewActivity() {
    const container = document.getElementById("content");
    const category = document.getElementById("category").value;
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const local = document.getElementById("local").value;
    const dataInicio = document.getElementById("dataInicio").value;
    const dataFim = document.getElementById("dataFim").value;

    try {
        const response = await fetch(DADOS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "titulo": title,
                "descricao": description,
                "data": {
                    "dataInicio": dataInicio,
                    "dataFim": dataFim
                },
                "local": local,
                "categoria": category,
            })
        });

        if (response.ok) {
            container.innerHTML += `
                <div class="alert alert-success mt-3" role="alert">
                    Atividade criada com sucesso <i class="fa-solid fa-check"></i>
                </div>`;
        }
        else {
            container.innerHTML = `
                <div class="alert alert-danger mt-3" role="alert">
                    Erro ao criar atividade <i class="fa-solid fa-xmark"></i>
                </div>`;
        }
    }
    catch (err) {
        console.error("Erro de conexão:", err);
        alert("Erro ao conectar com o servidor.");
    }
}

async function deleteActivity(id) {
    if (!confirm("Tem certeza que deseja excluir esta atividade?")) return;

    try {
        const res = await fetch(`${DADOS_URL}/${id}`, {
            method: "DELETE"
        });

        if (res.ok) {
            alert("Atividade excluída com sucesso!");
            window.location.href="index.html";
        } else {
            alert("Erro ao excluir atividade.");
        }
    } catch (err) {
        console.error("Erro na exclusão:", err);
        alert("Erro ao conectar com o servidor.");
    }
}

async function editActivity(id) {
  const container = document.getElementById(`activity-${id}`);
  const title = container.querySelector("h4").textContent;
  const [dataInicio, dataFim] = container.querySelector(".appointment-time").textContent.split("|").map(v => v.trim());
  const local = container.querySelectorAll(".appointment-desc")[0].textContent.replace("📍", "").trim();
  const desc = container.querySelectorAll(".appointment-desc")[1].textContent.trim();

  container.innerHTML = `
    <div class="appointment-details w-100">
      <input id="edit-title-${id}" class="form-control mb-2" value="${title}">
      <div class="row g-2">
        <div class="col"><input type="datetime-local" id="edit-dataInicio-${id}" class="form-control" value="${dataInicio}"></div>
        <div class="col"><input type="datetime-local" id="edit-dataFim-${id}" class="form-control" value="${dataFim}"></div>
      </div>
      <input id="edit-local-${id}" class="form-control mt-2 mb-2" value="${local}">
      <textarea id="edit-desc-${id}" class="form-control mb-2">${desc}</textarea>
      <button class="btn btn-success w-100" onclick="saveActivity(${id})">Salvar</button>
    </div>
  `;
}

async function saveActivity(id) {
  const title = document.getElementById(`edit-title-${id}`).value;
  const dataInicio = document.getElementById(`edit-dataInicio-${id}`).value;
  const dataFim = document.getElementById(`edit-dataFim-${id}`).value;
  const local = document.getElementById(`edit-local-${id}`).value;
  const descricao = document.getElementById(`edit-desc-${id}`).value;

  try {
    const res = await fetch(`${DADOS_URL}/${id}`);
    const atual = await res.json();

    const atualizado = {
      ...atual,
      titulo: title,
      descricao,
      local,
      data: {
        ...atual.data,
        dataInicio,
        dataFim
      }
    };

    const put = await fetch(`${DADOS_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(atualizado)
    });

    if (put.ok) {
      window.location.href="index.html";
    } else {
      alert("Erro ao salvar alterações.");
    }
  } catch (e) {
    console.error(e);
    alert("Erro de conexão.");
  }
}


