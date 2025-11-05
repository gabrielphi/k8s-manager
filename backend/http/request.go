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
	log.Printf("📋 listNsHandler chamado - método: %s", r.Method)

	// 3. [IMPORTANTE] Trate o erro da sua função! Não ignore com _
	jsonAllNs, err := k8s.ListNamespaces()
	if err != nil {
		// Loga o erro no servidor
		log.Printf("❌ ERRO: Falha ao listar namespaces: %v", err)
		http.Error(w, "Erro ao buscar dados do Kubernetes", http.StatusInternalServerError)
		return
	}

	log.Printf("✅ Namespaces encontrados: %v", jsonAllNs)

	// 4. [MELHORIA] Defina o Content-Type para que os clientes saibam que é JSON
	w.Header().Set("Content-Type", "application/json")

	// 5. Converte para JSON
	jsonResponse, err := json.Marshal(jsonAllNs)
	if err != nil {
		// Se a serialização falhar (raro, mas possível), avise o servidor.
		// Não use log.Fatal(), pois isso derruba o servidor!
		log.Printf("❌ ERRO: Falha ao serializar JSON: %v", err)
		http.Error(w, "Erro ao formatar resposta", http.StatusInternalServerError)
		return
	}

	// 6. Envia a resposta
	log.Printf("📤 Enviando resposta com %d namespaces", len(jsonAllNs))
	w.Write(jsonResponse)
}

type PodDeleteRequest struct {
	Name      string `json:"name"`
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

// CreateResourceRequest define um payload unificado para criação de recursos
// kind: "container" | "deployment" | "secret" | "ingress"
type CreateResourceRequest struct {
	Kind          string            `json:"kind"`
	Namespace     string            `json:"namespace"`
	Name          string            `json:"name"`
	Image         string            `json:"image,omitempty"`
	Replicas      *int32            `json:"replicas,omitempty"`
	ContainerPort *int32            `json:"containerPort,omitempty"`
	SecretType    string            `json:"secretType,omitempty"`
	Data          map[string]string `json:"data,omitempty"`
	Host          string            `json:"host,omitempty"`
	ServiceName   string            `json:"serviceName,omitempty"`
	ServicePort   *int32            `json:"servicePort,omitempty"`
}

func createResourceHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("createResourceHandler chamado com método: %s", r.Method)

	if r.Method != http.MethodPost {
		log.Printf("Método não permitido: %s (esperado: POST)", r.Method)
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	var req CreateResourceRequest
	dec := json.NewDecoder(r.Body)
	if err := dec.Decode(&req); err != nil {
		if err == io.EOF {
			http.Error(w, "Corpo da requisição não pode ser vazio", http.StatusBadRequest)
			return
		}
		log.Printf("ERRO ao decodificar JSON: %v", err)
		http.Error(w, "JSON mal formatado", http.StatusBadRequest)
		return
	}
	if req.Kind != "namespace" {
		if req.Kind == "" || req.Namespace == "" || req.Name == "" {
			http.Error(w, "Campos 'kind', 'namespace' e 'name' são obrigatórios", http.StatusBadRequest)
			return
		}
	}
	var err error
	switch req.Kind {
	case "container", "pod":
		if req.Image == "" {
			http.Error(w, "Campo 'image' é obrigatório para container/pod", http.StatusBadRequest)
			return
		}
		err = k8s.CreatePod(req.Namespace, req.Image, req.Name)
	case "deployment":
		if req.Image == "" || req.Replicas == nil {
			http.Error(w, "Campos 'image' e 'replicas' são obrigatórios para deployment", http.StatusBadRequest)
			return
		}
		var cport int32 = 0
		if req.ContainerPort != nil {
			cport = *req.ContainerPort
		}
		err = k8s.CreateDeployment(req.Namespace, req.Name, req.Image, *req.Replicas, cport)
	case "secret":
		if req.SecretType == "" {
			req.SecretType = "Opaque"
		}
		err = k8s.CreateSecret(req.Namespace, req.Name, req.SecretType, req.Data)
	case "ingress":
		if req.Host == "" || req.ServiceName == "" || req.ServicePort == nil {
			http.Error(w, "Campos 'host', 'serviceName' e 'servicePort' são obrigatórios para ingress", http.StatusBadRequest)
			return
		}
		err = k8s.CreateIngress(req.Namespace, req.Name, req.Host, req.ServiceName, *req.ServicePort)
	case "namespace":
		err = k8s.CreateNs(req.Name)
	default:
		http.Error(w, "'kind' inválido. Use: container, deployment, secret, ingress", http.StatusBadRequest)
		return
	}

	if err != nil {
		log.Printf("ERRO ao criar recurso: %v", err)
		http.Error(w, fmt.Sprintf("Erro ao criar recurso: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	response := map[string]string{"status": "sucesso", "message": fmt.Sprintf("Recurso '%s' (%s) está sendo criado.", req.Name, req.Kind)}
	json.NewEncoder(w).Encode(response)
}

func Listen() {
	// Aplica o middleware CORS ao handler
	http.HandleFunc("GET /listAllPods/{namespace}", corsMiddleware(listPodsHandler))
	http.HandleFunc("POST /createResource", corsMiddleware(createResourceHandler))
	http.HandleFunc("GET /listAllNs", corsMiddleware(listNsHandler))
	http.HandleFunc("POST /deletePod", corsMiddleware(deletePodHandler))

	// Adiciona handler para requisições OPTIONS (preflight) para ambas as rotas
	http.HandleFunc("OPTIONS /listAllPods/{namespace}", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {}))
	http.HandleFunc("OPTIONS /createResource", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {}))
	http.HandleFunc("OPTIONS /listAllNs", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {}))
	http.HandleFunc("OPTIONS /deletePod", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {}))

	log.Println("Servidor iniciado na porta 7000 com CORS habilitado")
	log.Fatal(http.ListenAndServe(":7000", nil))
}
