package http

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"backend/k8s" // Verifique se o nome do pacote está correto
)

// CORS middleware para permitir requisições do frontend
func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Log da requisição para debug
		log.Printf("Requisição recebida: %s %s", r.Method, r.URL.Path)

		// Headers CORS necessários
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Max-Age", "86400")

		// Se for uma requisição OPTIONS (preflight), retorna imediatamente
		if r.Method == "OPTIONS" {
			log.Printf("Requisição OPTIONS (preflight) recebida para %s", r.URL.Path)
			w.WriteHeader(http.StatusOK)
			return
		}

		// Chama o handler original
		next(w, r)
	}
}

// listPodsHandler agora lê o namespace da URL
func listPodsHandler(w http.ResponseWriter, r *http.Request) {
	// 1. Extrai o valor do placeholder "{namespace}" da URL
	namespace := r.PathValue("namespace")

	// 2. [IMPORTANTE] Validação: Verifica se o namespace não está vazio
	if namespace == "" {
		http.Error(w, "O namespace não pode estar vazio", http.StatusBadRequest)
		return
	}

	// 3. [IMPORTANTE] Trate o erro da sua função! Não ignore com _
	jsonAllPods, err := k8s.ListPods(namespace)
	if err != nil {
		// Loga o erro no servidor
		log.Printf("ERRO: Falha ao listar pods no namespace '%s': %v", namespace, err)
		http.Error(w, "Erro ao buscar dados do Kubernetes", http.StatusInternalServerError)
		return
	}

	// 4. [MELHORIA] Defina o Content-Type para que os clientes saibam que é JSON
	w.Header().Set("Content-Type", "application/json")

	// 5. Converte para JSON
	jsonResponse, err := json.Marshal(jsonAllPods)
	if err != nil {
		// Se a serialização falhar (raro, mas possível), avise o servidor.
		// Não use log.Fatal(), pois isso derruba o servidor!
		log.Printf("ERRO: Falha ao serializar JSON: %v", err)
		http.Error(w, "Erro ao formatar resposta", http.StatusInternalServerError)
		return
	}

	// 6. Envia a resposta
	w.Write(jsonResponse)
}
func listNsHandler(w http.ResponseWriter, r *http.Request) {
	// 1. Extrai o valor do placeholder "{namespace}" da URL

	// 3. [IMPORTANTE] Trate o erro da sua função! Não ignore com _
	jsonAllNs, err := k8s.ListNamespaces()
	if err != nil {
		// Loga o erro no servidor
		log.Printf("ERRO: Falha ao listar NS '%s': %v", jsonAllNs, err)
		http.Error(w, "Erro ao buscar dados do Kubernetes", http.StatusInternalServerError)
		return
	}

	// 4. [MELHORIA] Defina o Content-Type para que os clientes saibam que é JSON
	w.Header().Set("Content-Type", "application/json")

	// 5. Converte para JSON
	jsonResponse, err := json.Marshal(jsonAllNs)
	if err != nil {
		// Se a serialização falhar (raro, mas possível), avise o servidor.
		// Não use log.Fatal(), pois isso derruba o servidor!
		log.Printf("ERRO: Falha ao serializar JSON: %v", err)
		http.Error(w, "Erro ao formatar resposta", http.StatusInternalServerError)
		return
	}

	// 6. Envia a resposta
	w.Write(jsonResponse)
}

type PodCreationRequest struct {
	Name      string `json:"podName"`
	Namespace string `json:"namespace"`
	Image     string `json:"image"`
}

func createPodHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("createPodHandler chamado com método: %s", r.Method)

	if r.Method != http.MethodPost {
		log.Printf("Método não permitido: %s (esperado: POST)", r.Method)
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	// 2. Declare uma variável do tipo da sua struct para ser o destino dos dados.
	var podReq PodCreationRequest

	// 3. Crie um decoder que lê diretamente do corpo da requisição.
	//    Isso é mais eficiente do que ler o corpo inteiro para a memória primeiro.
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&podReq) // O '&' é crucial, passamos um ponteiro!

	// 4. TRATAMENTO DE ERROS DETALHADO (MUITO IMPORTANTE!)
	if err != nil {
		// Se o corpo estiver vazio, o decoder retorna um erro EOF (End of File).
		if err == io.EOF {
			log.Printf("ERRO: Corpo da requisição vazio")
			http.Error(w, "Corpo da requisição não pode ser vazio", http.StatusBadRequest)
			return
		}
		// Se o JSON estiver mal formatado, retorna um erro de sintaxe.
		// Damos uma resposta genérica para não expor detalhes internos.
		log.Printf("ERRO ao decodificar JSON: %v", err)
		http.Error(w, "JSON mal formatado", http.StatusBadRequest)
		return
	}

	log.Printf("Dados recebidos: Name=%s, Namespace=%s, Image=%s", podReq.Name, podReq.Namespace, podReq.Image)

	// 5. [Opcional mas recomendado] Valide os dados recebidos.
	if podReq.Name == "" || podReq.Namespace == "" || podReq.Image == "" {
		log.Printf("ERRO: Campos obrigatórios vazios - Name: %s, Namespace: %s, Image: %s", podReq.Name, podReq.Namespace, podReq.Image)
		http.Error(w, "Campos 'podName', 'namespace', e 'image' são obrigatórios", http.StatusBadRequest)
		return
	}

	log.Printf("Criando pod: %s no namespace: %s com imagem: %s", podReq.Name, podReq.Namespace, podReq.Image)

	// Chama a função de criação do pod
	err = k8s.CreatePod(podReq.Namespace, podReq.Image, podReq.Name)
	if err != nil {
		log.Printf("ERRO ao criar pod: %v", err)
		http.Error(w, fmt.Sprintf("Erro ao criar pod: %v", err), http.StatusInternalServerError)
		return
	}

	// 7. Envie uma resposta de sucesso para o cliente.
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated) // Status 201 Created é apropriado aqui.

	// Você pode retornar uma mensagem de sucesso simples
	response := map[string]string{"status": "sucesso", "message": fmt.Sprintf("Pod '%s' está sendo criado.", podReq.Name)}
	json.NewEncoder(w).Encode(response)

	log.Printf("Pod criado com sucesso: %s", podReq.Name)
}

type PodDeleteRequest struct {
	Name      string `json:"podName"`
	Namespace string `json:"namespace"`
}

func deletePodHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("delete chamado com método: %s", r.Method)

	if r.Method != http.MethodPost {
		log.Printf("Método não permitido: %s (esperado: POST)", r.Method)
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	// 2. Declare uma variável do tipo da sua struct para ser o destino dos dados.
	var podReq PodDeleteRequest

	// 3. Crie um decoder que lê diretamente do corpo da requisição.
	//    Isso é mais eficiente do que ler o corpo inteiro para a memória primeiro.
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&podReq) // O '&' é crucial, passamos um ponteiro!

	// 4. TRATAMENTO DE ERROS DETALHADO (MUITO IMPORTANTE!)
	if err != nil {
		// Se o corpo estiver vazio, o decoder retorna um erro EOF (End of File).
		if err == io.EOF {
			log.Printf("ERRO: Corpo da requisição vazio")
			http.Error(w, "Corpo da requisição não pode ser vazio", http.StatusBadRequest)
			return
		}
		// Se o JSON estiver mal formatado, retorna um erro de sintaxe.
		// Damos uma resposta genérica para não expor detalhes internos.
		log.Printf("ERRO ao decodificar JSON: %v", err)
		http.Error(w, "JSON mal formatado", http.StatusBadRequest)
		return
	}

	// 5. [Opcional mas recomendado] Valide os dados recebidos.
	if podReq.Name == "" || podReq.Namespace == "" {
		log.Printf("ERRO: Campos obrigatórios vazios - Name: %s, Namespace: %s", podReq.Name, podReq.Namespace)
		http.Error(w, "Campos 'podName', 'namespace' são obrigatórios", http.StatusBadRequest)
		return
	}

	log.Printf("Deletando pod: %s no namespace: %s ", podReq.Name, podReq.Namespace)

	// Chama a função de criação do pod
	err = k8s.DeletePod(podReq.Name, podReq.Namespace)
	if err != nil {
		log.Printf("ERRO ao Deletar pod: %v", err)
		http.Error(w, fmt.Sprintf("Erro ao Deletar pod: %v", err), http.StatusInternalServerError)
		return
	}

	// 7. Envie uma resposta de sucesso para o cliente.
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated) // Status 201 Created é apropriado aqui.

	// Você pode retornar uma mensagem de sucesso simples
	response := map[string]string{"status": "sucesso", "message": fmt.Sprintf("Pod '%s' foi deletado.", podReq.Name)}
	json.NewEncoder(w).Encode(response)

	log.Printf("Pod Deletado com sucesso: %s", podReq.Name)
}

func Listen() {
	// Aplica o middleware CORS ao handler
	http.HandleFunc("GET /listAllPods/{namespace}", corsMiddleware(listPodsHandler))
	http.HandleFunc("POST /createPod", corsMiddleware(createPodHandler))
	http.HandleFunc("GET /listAllNs", corsMiddleware(listNsHandler))
	http.HandleFunc("POST /deletePod", corsMiddleware(deletePodHandler))

	// Adiciona handler para requisições OPTIONS (preflight) para ambas as rotas
	http.HandleFunc("OPTIONS /listAllPods/{namespace}", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {}))
	http.HandleFunc("OPTIONS /createPod", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {}))
	http.HandleFunc("OPTIONS /listAllNs", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {}))
	http.HandleFunc("OPTIONS /deletePod", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {}))

	log.Println("Servidor iniciado na porta 7000 com CORS habilitado")
	log.Fatal(http.ListenAndServe(":7000", nil))
}
